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

const corsHandler = cors({ origin: true });

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
        amount, // in cents
        currency,
        metadata: {
          ...metadata,
          source: "anew-booking",
        },
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

/**
 * Stripe webhook — verifies payment events server-side.
 * Set up in Stripe Dashboard > Developers > Webhooks
 * Listen for: payment_intent.succeeded, payment_intent.payment_failed
 */
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
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
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

        // Find and update matching booking inquiry
        const snapshot = await db
          .collection("booking_inquiries")
          .where("paymentIntentId", "==", pi.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            paymentStatus: "deposit_paid",
            paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeAmount: pi.amount,
          });
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
          await snapshot.docs[0].ref.update({
            paymentStatus: "failed",
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

/**
 * Hospitable availability proxy.
 * Hospitable is the central booking hub syncing Airbnb, VRBO, and direct.
 * Forwards property calendar requests with the server-side PAT.
 * When HOSPITABLE_API_TOKEN is unset, returns 503 so the client falls back to mock.
 */
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
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!r.ok) {
        const text = await r.text();
        console.error("Hospitable error:", r.status, text);
        res.status(502).json({ error: "Hospitable API error" });
        return;
      }
      const json = await r.json() as { data?: Array<{ date: string; available?: boolean; status?: string; price?: { amount?: number }; min_nights?: number }> };
      const days = (json.data || []).map((d) => {
        let status: "available" | "limited" | "booked";
        if (d.available === false || d.status === "reserved" || d.status === "unavailable") status = "booked";
        else if (d.status === "available" || d.available === true) status = "available";
        else status = "limited";
        return {
          date: d.date,
          status,
          price: d.price?.amount,
          minNights: d.min_nights,
        };
      });
      res.status(200).json({ days });
    } catch (err) {
      console.error("Hospitable fetch failed:", err);
      res.status(500).json({ error: "Availability fetch failed" });
    }
  });
});
