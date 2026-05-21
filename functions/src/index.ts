import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET");
const hospitableApiToken = defineString("HOSPITABLE_API_TOKEN");
const hospitablePropertyId = defineString("HOSPITABLE_PROPERTY_ID");
const hospitableWebhookSecret = defineString("HOSPITABLE_WEBHOOK_SECRET");
const hospitableWebhookToken = defineString("HOSPITABLE_WEBHOOK_TOKEN");
const hospitableAccountEmail = defineString("HOSPITABLE_ACCOUNT_EMAIL");

// Hospitable's public webhook source range — published in their SDK docs.
// All real webhook calls come from this /24.
const HOSPITABLE_IP_PREFIX = "38.80.170.";

const ALLOWED_ORIGINS = [
  "https://anewretreatandspa.com",
  "https://www.anewretreatandspa.com",
  "https://pnwretreatandspa.com",
  "https://www.pnwretreatandspa.com",
  "https://bakkers-website-847ba.web.app",
  "https://bakkers-website-847ba.firebaseapp.com",
  "https://anew-admin.web.app",
  "https://anew-admin.firebaseapp.com",
  // Local dev
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsHandler = cors({
  origin: (origin, callback) => {
    // Allow same-origin / curl / server-to-server (no Origin header).
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
});

const ADMIN_EMAILS = new Set([
  "emmettg@griffithind.com",
  "bakkers4640@gmail.com",
]);

// === Rate limiting (Firestore-backed, per IP+endpoint, sliding 1-minute window) ===
const RATE_LIMITS: Record<string, number> = {
  createPaymentIntent: 10,
  submitTour: 5,
  refundBooking: 30,
  getAvailability: 60,
  hospitableWebhook: 120,
  stripeWebhook: 240,
};

/** Returns the real client IP from X-Forwarded-For.
 *  Behind GFE/Firebase load balancers the actual client IP is the LAST
 *  trusted entry, not the first. Using the first lets attackers spoof IPs
 *  by injecting their own values into the header. */
function clientIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd.join(",") : (typeof fwd === "string" ? fwd : "");
  if (raw) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.ip || "unknown";
}

async function enforceRateLimit(endpoint: string, ip: string): Promise<boolean> {
  const limit = RATE_LIMITS[endpoint] ?? 30;
  const now = Date.now();
  const windowMs = 60_000;
  const key = `${endpoint}:${ip}`;
  const ref = db.collection("_rate_limits").doc(key);
  try {
    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() as { windowStart?: number; count?: number }) : null;
      const windowStart = data?.windowStart ?? 0;
      const count = data?.count ?? 0;
      if (now - windowStart > windowMs) {
        tx.set(ref, { windowStart: now, count: 1, updatedAt: now });
        return true;
      }
      if (count >= limit) return false;
      tx.set(ref, { windowStart, count: count + 1, updatedAt: now }, { merge: true });
      return true;
    });
    return allowed;
  } catch (err) {
    // Fail closed — on a money-touching endpoint, denying access is safer
    // than letting attackers flood through during Firestore disruption.
    console.error("Rate-limit check failed (fail-closed):", err);
    return false;
  }
}

/** Verify the request is from an authorized admin via Firebase ID token. */
async function requireAdmin(req: { headers: Record<string, string | string[] | undefined> }): Promise<string> {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!token) throw new Error("Missing Authorization header");
  const decoded = await admin.auth().verifyIdToken(token);
  const email = (decoded.email || "").toLowerCase();
  if (!ADMIN_EMAILS.has(email)) throw new Error("Not authorized");
  return email;
}

// ============================================================================
// STRIPE: Create Payment Intent
// ============================================================================
export const createPaymentIntent = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const ip = clientIp(req);
    if (!(await enforceRateLimit("createPaymentIntent", ip))) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    try {
      const stripe = new Stripe(stripeSecretKey.value());
      const body = (req.body || {}) as { amount?: unknown; currency?: unknown; metadata?: unknown };
      const amount = body.amount;
      const currency = typeof body.currency === "string" ? body.currency : "usd";

      // Server-side allowlist of valid charge amounts (cents).
      // Anything else is treated as price tampering and rejected.
      const VALID_AMOUNTS_CENTS = new Set<number>([
        550000, // $5,500 — flat day rate at the estate
      ]);
      if (typeof amount !== "number" || !Number.isFinite(amount) || !VALID_AMOUNTS_CENTS.has(Math.round(amount))) {
        console.warn(`Rejected payment intent — invalid amount ${amount} from ip=${ip}`);
        res.status(400).json({ error: "Invalid amount" });
        return;
      }
      if (!/^[a-z]{3}$/.test(currency)) {
        res.status(400).json({ error: "Invalid currency" });
        return;
      }

      // Sanitize metadata: only string keys/values, cap sizes (Stripe rejects >500 chars).
      const rawMeta = (body.metadata && typeof body.metadata === "object" ? body.metadata : {}) as Record<string, unknown>;
      const metadata: Record<string, string> = {};
      let metaKeys = 0;
      for (const [k, v] of Object.entries(rawMeta)) {
        if (metaKeys >= 40) break;
        if (typeof k !== "string" || k.length > 40) continue;
        if (v == null) continue;
        const str = String(v).slice(0, 500);
        metadata[k] = str;
        metaKeys++;
      }
      metadata.source = "anew-booking";
      metadata.clientIp = ip;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        metadata,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: "Payment setup failed" });
    }
  });
});

// ============================================================================
// STRIPE: Webhook — handles payment events, pushes to Hospitable
// ============================================================================
export const stripeWebhook = onRequest(
  { invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    // Rate limit by source IP before doing HMAC verification work.
    // Stripe's legitimate webhook traffic is far below this ceiling.
    const sourceIp = clientIp(req);
    if (!(await enforceRateLimit("stripeWebhook", sourceIp))) {
      res.status(429).send("Too many requests");
      return;
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", msg);
      res.status(400).send(`Webhook Error: ${msg}`);
      return;
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${pi.id} ($${pi.amount / 100})`);

        const snapshot = await db
          .collection("booking_inquiries")
          .where("paymentIntentId", "==", pi.id)
          .limit(1)
          .get();

        let doc: FirebaseFirestore.DocumentReference;
        let bookingData: FirebaseFirestore.DocumentData;

        if (snapshot.empty) {
          // Lost-booking recovery: customer paid but their browser died before
          // submitBookingInquiry wrote to Firestore. Reconstruct from PI metadata.
          console.warn(`No booking found for ${pi.id} — creating recovery record from PI metadata`);
          const recovery = {
            type: "booking",
            status: "new",
            email: pi.metadata.customerEmail || pi.receipt_email || "",
            displayName: pi.metadata.customerName || "Recovered Booking",
            phone: pi.metadata.customerPhone || "",
            eventType: pi.metadata.eventType || "",
            guestCount: Number(pi.metadata.guestCount) || 0,
            selectedDate: pi.metadata.arrivalDate || null,
            durationHours: Number(pi.metadata.durationHours) || null,
            startTime: pi.metadata.startTime || "",
            endTime: pi.metadata.endTime || "",
            notes: pi.metadata.guestMessage || "",
            paymentIntentId: pi.id,
            paymentStatus: "paid",
            paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeAmount: pi.amount,
            estimatedTotal: pi.amount / 100,
            amountPaid: pi.amount / 100,
            recoveredFromWebhook: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          doc = await db.collection("booking_inquiries").add(recovery);
          bookingData = recovery;
        } else {
          doc = snapshot.docs[0].ref;
          await doc.update({
            paymentStatus: "paid",
            paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeAmount: pi.amount,
          });
          bookingData = snapshot.docs[0].data();
        }

        // Push to Hospitable so Airbnb/VRBO calendars block this date
        try {
          await pushReservationToHospitable(doc.id, bookingData);
        } catch (err) {
          console.error("Hospitable push failed (will retry manually):", err);
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${pi.id}`);
        const snapshot = await db
          .collection("booking_inquiries")
          .where("paymentIntentId", "==", pi.id)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({ paymentStatus: "failed" });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!pi) break;
        console.log(`Charge refunded: ${charge.id} (PI ${pi}, $${charge.amount_refunded / 100})`);
        const snapshot = await db
          .collection("booking_inquiries")
          .where("paymentIntentId", "==", pi)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            paymentStatus: charge.amount_refunded === charge.amount ? "refunded" : "partially_refunded",
            refundedAmount: charge.amount_refunded,
            refundedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);

// ============================================================================
// STRIPE: Refund (admin only)
// ============================================================================
export const refundBooking = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const ip = clientIp(req);
    if (!(await enforceRateLimit("refundBooking", ip))) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    try {
      await requireAdmin(req);
    } catch (err) {
      console.warn("Unauthorized refund attempt from", ip, err instanceof Error ? err.message : err);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const body = (req.body || {}) as { bookingId?: unknown; refundType?: unknown };
      const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
      const refundType: "half" | "full" = body.refundType === "full" ? "full" : "half";
      if (!bookingId || !/^[A-Za-z0-9_-]{1,128}$/.test(bookingId)) {
        res.status(400).json({ error: "Invalid bookingId" });
        return;
      }

      const docRef = db.collection("booking_inquiries").doc(bookingId);
      const doc = await docRef.get();
      if (!doc.exists) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      const data = doc.data() as Record<string, unknown>;
      const pi = data.paymentIntentId as string | undefined;
      const stripeAmount = data.stripeAmount as number | undefined;
      if (!pi || !stripeAmount) {
        res.status(400).json({ error: "Booking has no associated payment" });
        return;
      }

      const refundAmount = refundType === "full" ? stripeAmount : Math.floor(stripeAmount / 2);
      const stripe = new Stripe(stripeSecretKey.value());
      const refund = await stripe.refunds.create({
        payment_intent: pi,
        amount: refundAmount,
        metadata: { bookingId, refundType, source: "admin-dashboard" },
      });

      // Webhook charge.refunded will update Firestore, but mark optimistically
      await docRef.update({
        paymentStatus: refundType === "full" ? "refunded" : "partially_refunded",
        refundedAmount: refundAmount,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
        refundId: refund.id,
      });

      res.status(200).json({
        success: true,
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
      });
    } catch (err) {
      console.error("Refund failed:", err);
      const message = err instanceof Error ? err.message : "Refund failed";
      res.status(500).json({ error: message });
    }
  });
});

// ============================================================================
// HOSPITABLE: Availability proxy (read)
// ============================================================================
export const getAvailability = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const ip = clientIp(req);
    if (!(await enforceRateLimit("getAvailability", ip))) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    const token = hospitableApiToken.value();
    if (!token) {
      res.status(503).json({ error: "Hospitable not configured" });
      return;
    }

    const propertyId = String(req.query.propertyId || "");
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    if (!/^[a-f0-9-]{32,40}$/i.test(propertyId)) {
      res.status(400).json({ error: "Invalid propertyId" });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      res.status(400).json({ error: "Dates must be YYYY-MM-DD" });
      return;
    }
    // Limit the range we'll proxy (defense-in-depth — Hospitable handles months, not years).
    const fromTs = Date.parse(from);
    const toTs = Date.parse(to);
    if (!Number.isFinite(fromTs) || !Number.isFinite(toTs) || toTs < fromTs || toTs - fromTs > 1000 * 60 * 60 * 24 * 90) {
      res.status(400).json({ error: "Invalid date range (max 90 days)" });
      return;
    }

    try {
      const url = `https://public.api.hospitable.com/v2/properties/${encodeURIComponent(propertyId)}/calendar?start_date=${encodeURIComponent(from)}&end_date=${encodeURIComponent(to)}`;
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!r.ok) {
        const text = await r.text();
        console.error("Hospitable error:", r.status, text);
        res.status(502).json({ error: "Hospitable API error" });
        return;
      }
      const json = await r.json() as {
        data?: {
          days?: Array<{
            date: string;
            min_stay?: number;
            closed_for_checkin?: boolean;
            closed_for_checkout?: boolean;
            status?: { available?: boolean; reason?: string };
            price?: { amount?: number };
          }>;
        };
      };
      const days = (json.data?.days || []).map((d) => {
        const available = d.status?.available;
        // available === undefined just means Hospitable has no explicit rule
        // for the date — treat as available (not "limited", which the UI
        // styles as yellow and discourages selection).
        const status: "available" | "booked" = available === false ? "booked" : "available";
        // Hospitable returns price.amount in cents (300000 = $3000). Convert to whole dollars.
        const priceDollars = typeof d.price?.amount === "number" ? Math.round(d.price.amount / 100) : undefined;
        return { date: d.date, status, price: priceDollars, minNights: d.min_stay };
      });
      res.status(200).json({ days });
    } catch (err) {
      console.error("Hospitable fetch failed:", err);
      res.status(500).json({ error: "Availability fetch failed" });
    }
  });
});

// ============================================================================
// HOSPITABLE: Push reservation (called from stripeWebhook on payment success)
// ============================================================================
async function pushReservationToHospitable(
  bookingId: string,
  booking: FirebaseFirestore.DocumentData
): Promise<void> {
  const token = hospitableApiToken.value();
  const propertyId = hospitablePropertyId.value();
  if (!token || !propertyId) {
    console.log("Hospitable not configured — skipping reservation push");
    return;
  }

  // Idempotency: Stripe retries webhooks on any non-2xx response.
  // Re-read the doc to avoid double-pushing if another invocation already synced.
  const docRef = db.collection("booking_inquiries").doc(bookingId);
  const fresh = await docRef.get();
  if (fresh.exists && fresh.data()?.hospitableReservationId) {
    console.log(`Booking ${bookingId} already synced to Hospitable — skipping duplicate push`);
    return;
  }

  const arrival = booking.selectedDate as string | undefined;
  if (!arrival) {
    console.warn(`Booking ${bookingId} has no selectedDate, skipping Hospitable push`);
    return;
  }

  // For sub-24hr blocks we still book the calendar day to prevent double-booking.
  // Hospitable v2 requires check_out > check_in, so check_out = arrival + 1 always.
  const checkIn = new Date(arrival);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  const guestName = (booking.displayName as string) || (booking.guestName as string) || "Guest";
  const guestEmail = (booking.email as string) || "";
  const guestPhone = (booking.phone as string) || (booking.guestPhone as string) || "";
  const guestCount = (booking.guestCount as number) || 2;
  const durationHours = (booking.durationHours as number) || 24;
  const startTime = (booking.startTime as string) || "";
  const endTime = (booking.endTime as string) || "";
  const eventType = (booking.eventType as string) || "stay";
  const amountPaid = ((booking.stripeAmount as number) || 0) / 100;

  const timeWindow = startTime && endTime ? ` ${startTime}–${endTime}` : "";
  const notes = [
    `Booked via anewretreatandspa.com`,
    `Booking ID: ${bookingId}`,
    `Event: ${eventType}`,
    `Block: ${durationHours}hr${timeWindow}`,
    `Guests: ${guestCount}`,
    `Paid: $${amountPaid}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
  ].filter(Boolean).join(" | ");

  const payload = {
    properties: [propertyId],
    check_in: checkIn.toISOString().split("T")[0],
    check_out: checkOut.toISOString().split("T")[0],
    guest: {
      first_name: guestName.split(" ")[0] || "Guest",
      last_name: guestName.split(" ").slice(1).join(" ") || "—",
      email: guestEmail,
      phone: guestPhone,
    },
    number_of_guests: guestCount,
    source: "direct",
    notes,
    confirmation_status: "confirmed",
  };
  console.log(`Pushing reservation to Hospitable: booking=${bookingId} property=${propertyId} check_in=${payload.check_in} check_out=${payload.check_out} guests=${payload.number_of_guests}`);

  const r = await fetch("https://public.api.hospitable.com/v2/reservations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Hospitable ${r.status}: ${text}`);
  }

  const result = await r.json() as { data?: { id?: string; code?: string } };
  const reservationId = result.data?.id || result.data?.code;
  await db.collection("booking_inquiries").doc(bookingId).update({
    hospitableReservationId: reservationId,
    hospitableSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Hospitable reservation created: ${reservationId} for booking ${bookingId}`);
}

// ============================================================================
// HOSPITABLE: Incoming webhook (when Airbnb/VRBO bookings happen directly)
// ============================================================================
export const hospitableWebhook = onRequest(
  { invoker: "public" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    // Rate limit before doing any HMAC work so flood traffic with bogus
    // signatures can't exhaust the CPU on signature verification.
    const rateLimitIp = clientIp(req);
    if (!(await enforceRateLimit("hospitableWebhook", rateLimitIp))) {
      res.status(429).send("Too many requests");
      return;
    }

    // Verify the request came from Hospitable.
    //
    // Per Hospitable's published spec (see hospitable-python SDK
    // docs/webhooks.md), customer-plan webhooks are HMAC-SHA256 signed with
    // a secret = base64(primary_account_email). The signature comes in the
    // `Signature` header. As defense-in-depth we also require the source IP
    // to fall within Hospitable's published webhook range 38.80.170.0/24.
    const ip = clientIp(req);
    const fromHospitableIp = ip.startsWith(HOSPITABLE_IP_PREFIX);

    const crypto = await import("crypto");
    const accountEmail = hospitableAccountEmail.value();
    const explicitSecret = hospitableWebhookSecret.value();
    const fallbackToken = hospitableWebhookToken.value();

    const rawSig = req.headers["signature"] ?? req.headers["x-hospitable-signature"];
    const signature = Array.isArray(rawSig) ? rawSig[0] : rawSig;

    let verified = false;
    let verifiedVia = "";

    if (typeof signature === "string" && signature.length > 0) {
      const sig = signature.startsWith("sha256=") ? signature.slice(7) : signature;
      const sigBuf = Buffer.from(sig, "hex");

      // Candidate keys, in order of preference.
      const candidates: Array<[string, string]> = [];
      if (accountEmail) {
        const emailKey = Buffer.from(accountEmail).toString("base64");
        candidates.push([`email_b64(${accountEmail})`, emailKey]);
      }
      if (explicitSecret) candidates.push(["webhook_secret", explicitSecret]);

      for (const [label, key] of candidates) {
        try {
          const expected = crypto.createHmac("sha256", key).update(req.rawBody).digest("hex");
          const expBuf = Buffer.from(expected, "hex");
          if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
            verified = true;
            verifiedVia = `hmac:${label}`;
            break;
          }
        } catch { /* ignore individual candidate failures */ }
      }

      if (!verified) {
        const previews: Record<string, string> = {};
        for (const [label, key] of candidates) {
          try {
            previews[label] = crypto.createHmac("sha256", key).update(req.rawBody).digest("hex").slice(0, 12);
          } catch { /* ignore */ }
        }
        console.warn(
          "Hospitable signature mismatch",
          JSON.stringify({
            ip,
            fromHospitableIp,
            url: req.originalUrl || req.url,
            sigPrefix: sig.slice(0, 12),
            sigLen: sig.length,
            sigHasShaPrefix: signature.startsWith("sha256="),
            bodyLen: req.rawBody?.length ?? 0,
            triedKeys: candidates.map(([l]) => l),
            computedPrefixes: previews,
          })
        );
      }
    }

    if (!verified && fallbackToken) {
      const headerToken = req.headers["x-webhook-token"];
      const authHeader = req.headers["authorization"];
      let provided = "";
      // Token must come from a HEADER. Never accept it via query string —
      // URL query params end up in proxy/CDN/Cloud Logging history,
      // permanently exposing the secret.
      if (typeof headerToken === "string") provided = headerToken;
      else if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) provided = authHeader.slice(7);

      const provBuf = Buffer.from(provided);
      const expBuf = Buffer.from(fallbackToken);
      if (provBuf.length === expBuf.length && crypto.timingSafeEqual(provBuf, expBuf)) {
        verified = true;
        verifiedVia = "token";
      }
    }

    if (!verified) {
      res.status(401).send("Unauthorized");
      return;
    }

    // Defense-in-depth: even with a valid signature, refuse traffic that
    // doesn't originate from Hospitable's published webhook IP range.
    // (Skipped for local-token verification — useful for local testing.)
    if (verifiedVia.startsWith("hmac:") && !fromHospitableIp) {
      console.warn(`Verified signature but unexpected source IP: ${ip}`);
      res.status(403).send("Forbidden source");
      return;
    }

    console.log(`Hospitable webhook verified via ${verifiedVia}`);

    // Hospitable payload shape (per their published spec):
    //   { id, action, data, created, version }
    // `action` is the event type (e.g. "reservation.created").
    const payload = req.body as {
      id?: string;
      action?: string;
      data?: Record<string, unknown>;
      created?: string;
      version?: string;
    };

    const action = payload.action;
    const data = payload.data;
    if (!action || !data) {
      console.warn("Hospitable webhook: invalid payload shape", {
        hasAction: !!action,
        hasData: !!data,
        keys: Object.keys(payload || {}),
      });
      res.status(400).send("Invalid payload");
      return;
    }

    console.log(`Hospitable event: ${action} (id=${payload.id ?? "?"})`);

    const fallbackDocId = (payload.id || "").trim();
    function pickId(d: Record<string, unknown>): string {
      const candidates = ["id", "uuid", "code", "reservation_id", "message_id", "review_id"];
      for (const k of candidates) {
        const v = d[k];
        if (typeof v === "string" && v.trim().length > 0) return v.trim();
      }
      return fallbackDocId;
    }

    try {
      switch (action) {
        case "reservation.created":
        case "reservation.updated":
        case "reservation.confirmed": {
          const d = data as {
            id?: string;
            code?: string;
            property_id?: string;
            check_in?: string;
            check_out?: string;
            status?: string;
            channel?: { name?: string };
            source?: string;
            guest?: { first_name?: string; last_name?: string; email?: string; phone?: string };
            guests?: { adults?: number; children?: number; infants?: number };
            number_of_guests?: number;
            total?: number;
            money?: { host_payout?: { amount?: number } };
          };
          const reservationId = pickId(d as Record<string, unknown>);
          if (!reservationId) {
            console.warn("Hospitable reservation event missing id/code, skipping");
            break;
          }
          // Direct bookings already exist in booking_inquiries (created by our
          // own flow). External channel bookings (Airbnb, VRBO, etc.) go into
          // external_bookings so the admin sees the full calendar.
          const channelName = d.channel?.name || d.source || "unknown";
          const isDirect = channelName.toLowerCase() === "direct";
          if (!isDirect) {
            const guestCount =
              d.number_of_guests ??
              (d.guests ? (d.guests.adults || 0) + (d.guests.children || 0) : undefined);
            await db.collection("external_bookings").doc(reservationId).set(
              {
                source: channelName,
                hospitableReservationId: reservationId,
                propertyId: d.property_id,
                checkIn: d.check_in,
                checkOut: d.check_out,
                status: d.status,
                guestName: `${d.guest?.first_name || ""} ${d.guest?.last_name || ""}`.trim(),
                guestEmail: d.guest?.email || "",
                guestPhone: d.guest?.phone || "",
                guestCount,
                total: d.total ?? d.money?.host_payout?.amount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                type: "external_booking",
                lastAction: action,
              },
              { merge: true }
            );
          }
          break;
        }
        case "reservation.cancelled": {
          const d = data as { id?: string; code?: string };
          const reservationId = pickId(d as Record<string, unknown>);
          if (!reservationId) break;
          const snap = await db
            .collection("booking_inquiries")
            .where("hospitableReservationId", "==", reservationId)
            .limit(1)
            .get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              status: "cancelled",
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            await db.collection("external_bookings").doc(reservationId).set(
              {
                status: "cancelled",
                cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
          break;
        }
        case "message.created": {
          const d = data as {
            id?: string;
            reservation_id?: string;
            body?: string;
            sender_type?: string;
            sender_name?: string;
            created_at?: string;
          };
          const messageId = pickId(d as Record<string, unknown>);
          if (!messageId) {
            console.warn("Hospitable message.created missing id, skipping", { dataKeys: Object.keys(data) });
            break;
          }
          await db.collection("guest_messages").doc(messageId).set(
            {
              hospitableMessageId: messageId,
              reservationId: d.reservation_id,
              body: (d.body || "").slice(0, 10000),
              senderType: d.sender_type,
              senderName: d.sender_name,
              sentAt: d.created_at,
              receivedAt: admin.firestore.FieldValue.serverTimestamp(),
              rawDataKeys: Object.keys(data).join(","),
            },
            { merge: true }
          );
          break;
        }
        case "review.created": {
          const d = data as { id?: string; reservation_id?: string; rating?: number; public_review?: string };
          const reviewId = pickId(d as Record<string, unknown>);
          if (!reviewId) {
            console.warn("Hospitable review.created missing id, skipping");
            break;
          }
          await db.collection("guest_reviews").doc(reviewId).set(
            {
              hospitableReviewId: reviewId,
              reservationId: d.reservation_id,
              rating: d.rating,
              review: (d.public_review || "").slice(0, 10000),
              receivedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          break;
        }
        case "property.updated":
        case "property.merged":
          // Currently informational — log but don't persist.
          console.log(`Property change acknowledged: ${action}`);
          break;
        default:
          console.log(`Unhandled Hospitable event: ${action}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Hospitable webhook error:", err);
      res.status(500).send("Webhook processing failed");
    }
  }
);

// ============================================================================
// TOUR: Submit tour request — writes Firestore + pushes inquiry to Hospitable
// ============================================================================
interface TourPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  message?: string;
  honeypot?: string;
}

export const submitTour = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const ip = clientIp(req);
    if (!(await enforceRateLimit("submitTour", ip))) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    try {
      const body = (req.body || {}) as TourPayload;

      // Honeypot field — bots fill it, humans don't.
      if (body.honeypot) {
        res.status(200).json({ success: true });
        return;
      }

      const firstName = (body.firstName || "").trim().slice(0, 100);
      const lastName = (body.lastName || "").trim().slice(0, 100);
      const email = (body.email || "").trim().slice(0, 254).toLowerCase();
      const phone = (body.phone || "").trim().slice(0, 30);
      const date = (body.date || "").trim();
      const time = (body.time || "").trim().slice(0, 10);
      const message = (body.message || "").trim().slice(0, 2000);

      if (!firstName || !email || !date) {
        res.status(400).json({ error: "firstName, email, and date are required" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Invalid email" });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: "Date must be YYYY-MM-DD" });
        return;
      }
      if (phone && !/^[\d\s+()\-.]{7,30}$/.test(phone)) {
        res.status(400).json({ error: "Invalid phone" });
        return;
      }
      const dateTs = Date.parse(date);
      const now = Date.now();
      if (!Number.isFinite(dateTs) || dateTs < now - 1000 * 60 * 60 * 24 || dateTs > now + 1000 * 60 * 60 * 24 * 365 * 3) {
        res.status(400).json({ error: "Date out of range" });
        return;
      }

      const doc = await db.collection("tour_requests").add({
        firstName,
        lastName,
        email,
        phone,
        date,
        time,
        message,
        type: "tour",
        status: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      let hospitableId: string | null = null;
      try {
        hospitableId = await pushTourToHospitable(doc.id, {
          firstName, lastName, email, phone, date, time, message,
        });
        if (hospitableId) {
          await doc.update({
            hospitableReservationId: hospitableId,
            hospitableSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("Tour Hospitable push failed:", err);
      }

      res.status(200).json({ success: true, tourId: doc.id, hospitableId });
    } catch (err) {
      console.error("submitTour error:", err);
      const message = err instanceof Error ? err.message : "Tour submission failed";
      res.status(500).json({ error: message });
    }
  });
});

async function pushTourToHospitable(
  tourId: string,
  tour: { firstName: string; lastName: string; email: string; phone: string; date: string; time: string; message: string }
): Promise<string | null> {
  const token = hospitableApiToken.value();
  const propertyId = hospitablePropertyId.value();
  if (!token || !propertyId) {
    console.log("Hospitable not configured — skipping tour push");
    return null;
  }

  // Tour inquiry: 1-night placeholder on the requested date.
  // confirmation_status="inquiry" so the admin sees the request without blocking
  // the calendar. Admin can promote to confirmed if they accept.
  const checkIn = new Date(tour.date);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  const notes = [
    `TOUR REQUEST via anewretreatandspa.com`,
    `Tour ID: ${tourId}`,
    tour.time ? `Requested time: ${tour.time}` : "",
    `Email: ${tour.email}`,
    tour.phone ? `Phone: ${tour.phone}` : "",
    tour.message ? `Message: ${tour.message}` : "",
  ].filter(Boolean).join(" | ");

  const payload = {
    properties: [propertyId],
    check_in: checkIn.toISOString().split("T")[0],
    check_out: checkOut.toISOString().split("T")[0],
    guest: {
      first_name: tour.firstName || "Tour",
      last_name: tour.lastName || "Guest",
      email: tour.email,
      phone: tour.phone,
    },
    number_of_guests: 1,
    source: "direct",
    notes,
    confirmation_status: "inquiry",
  };

  const r = await fetch("https://public.api.hospitable.com/v2/reservations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text();
    console.error(`Hospitable tour push ${r.status}: ${text}`);
    return null;
  }

  const result = await r.json() as { data?: { id?: string; code?: string } };
  return result.data?.id || result.data?.code || null;
}
