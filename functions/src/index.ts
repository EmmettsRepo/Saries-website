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

const corsHandler = cors({ origin: true });

const ADMIN_EMAILS = new Set([
  "emmettg@griffithind.com",
  "bakkers4640@gmail.com",
]);

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

    try {
      const stripe = new Stripe(stripeSecretKey.value());
      const { amount, currency = "usd", metadata } = req.body;

      if (!amount || typeof amount !== "number" || amount < 100) {
        res.status(400).json({ error: "Invalid amount (minimum $1.00)" });
        return;
      }
      // Cap at $25,000 to prevent abuse
      if (amount > 2500000) {
        res.status(400).json({ error: "Amount exceeds maximum" });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { ...metadata, source: "anew-booking" },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err) {
      console.error("Stripe error:", err);
      const message = err instanceof Error ? err.message : "Payment setup failed";
      res.status(500).json({ error: message });
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
            eventType: pi.metadata.eventType || "",
            guestCount: Number(pi.metadata.guestCount) || 0,
            selectedPackage: pi.metadata.package || "",
            selectedDate: pi.metadata.arrivalDate || null,
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

    try {
      await requireAdmin(req);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unauthorized";
      res.status(401).json({ error: msg });
      return;
    }

    try {
      const { bookingId, refundType = "half" } = req.body as {
        bookingId?: string;
        refundType?: "half" | "full";
      };
      if (!bookingId) {
        res.status(400).json({ error: "Missing bookingId" });
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

    const token = hospitableApiToken.value();
    if (!token) {
      res.status(503).json({ error: "Hospitable not configured" });
      return;
    }

    const propertyId = String(req.query.propertyId || "");
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    if (!propertyId || !from || !to) {
      res.status(400).json({ error: "Missing propertyId, from, or to" });
      return;
    }

    try {
      const url = `https://public.api.hospitable.com/v2/calendar?property_id=${propertyId}&start_date=${from}&end_date=${to}`;
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
        data?: Array<{
          date: string; available?: boolean; status?: string;
          price?: { amount?: number }; min_nights?: number;
        }>;
      };
      const days = (json.data || []).map((d) => {
        let status: "available" | "limited" | "booked";
        if (d.available === false || d.status === "reserved" || d.status === "unavailable") status = "booked";
        else if (d.status === "available" || d.available === true) status = "available";
        else status = "limited";
        return { date: d.date, status, price: d.price?.amount, minNights: d.min_nights };
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

  const arrival = booking.selectedDate as string | undefined;
  if (!arrival) {
    console.warn(`Booking ${bookingId} has no selectedDate, skipping Hospitable push`);
    return;
  }

  // Default to 1-night stay; admin can extend in Hospitable dashboard
  const checkIn = new Date(arrival);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  const guestName = (booking.displayName as string) || (booking.guestName as string) || "Guest";
  const guestEmail = (booking.email as string) || "";
  const guestPhone = (booking.phone as string) || (booking.guestPhone as string) || "";
  const guestCount = (booking.guestCount as number) || 2;

  const payload = {
    property_id: propertyId,
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
    notes: `Booked via anewretreatandspa.com. Booking ID: ${bookingId}. Event: ${booking.eventType || "stay"}. Paid: $${((booking.stripeAmount as number) || 0) / 100}.`,
    confirmation_status: "confirmed",
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

    // Verify webhook signature (Hospitable signs with HMAC-SHA256)
    const secret = hospitableWebhookSecret.value();
    if (secret) {
      const signature = req.headers["x-hospitable-signature"];
      if (!signature || typeof signature !== "string") {
        res.status(401).send("Missing signature");
        return;
      }
      const crypto = await import("crypto");
      const expected = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");
      if (signature !== expected) {
        console.error("Hospitable webhook signature mismatch");
        res.status(401).send("Invalid signature");
        return;
      }
    }

    const event = req.body as {
      event?: string;
      data?: {
        id?: string;
        property_id?: string;
        check_in?: string;
        check_out?: string;
        status?: string;
        source?: string;
        guest?: { first_name?: string; last_name?: string; email?: string; phone?: string };
        number_of_guests?: number;
        total?: number;
      };
    };

    if (!event.event || !event.data) {
      res.status(400).send("Invalid payload");
      return;
    }

    console.log(`Hospitable event: ${event.event}`);

    try {
      switch (event.event) {
        case "reservation.created":
        case "reservation.confirmed": {
          const d = event.data;
          // Only record bookings that came from external channels (Airbnb, VRBO, etc.)
          // Our own direct bookings already exist in booking_inquiries.
          if (d.source && d.source !== "direct") {
            await db.collection("external_bookings").doc(d.id || "").set({
              source: d.source,
              hospitableReservationId: d.id,
              propertyId: d.property_id,
              checkIn: d.check_in,
              checkOut: d.check_out,
              status: d.status,
              guestName: `${d.guest?.first_name || ""} ${d.guest?.last_name || ""}`.trim(),
              guestEmail: d.guest?.email || "",
              guestPhone: d.guest?.phone || "",
              guestCount: d.number_of_guests,
              total: d.total,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              type: "external_booking",
            }, { merge: true });
          }
          break;
        }
        case "reservation.cancelled": {
          const d = event.data;
          // Find the matching booking — could be in either collection
          const snap = await db
            .collection("booking_inquiries")
            .where("hospitableReservationId", "==", d.id)
            .limit(1)
            .get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              status: "cancelled",
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            await db.collection("external_bookings").doc(d.id || "").set({
              status: "cancelled",
              cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          }
          break;
        }
        default:
          console.log(`Unhandled Hospitable event: ${event.event}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Hospitable webhook error:", err);
      res.status(500).send("Webhook processing failed");
    }
  }
);
