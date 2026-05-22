"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, AlertCircle } from "lucide-react";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — booking checkout cannot initialize."
  );
}
const stripePromise = loadStripe(stripePublishableKey);

const FUNCTIONS_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
  "https://us-central1-bakkers-website-847ba.cloudfunctions.net";

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  amount: number; // in dollars
  metadata?: Record<string, string>;
}

function CheckoutForm({
  onSuccess,
  onError,
  amount,
}: Omit<PaymentFormProps, "metadata">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether Stripe has finished mounting the PaymentElement. If the
  // card form fails to mount (CSP block, network, etc.) the user shouldn't
  // be able to click Pay against an empty form.
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !elementReady) return;

    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/booking?payment=success",
      },
      redirect: "if_required",
    });

    if (result.error) {
      const msg = result.error.message || "Payment failed. Please try again.";
      setError(msg);
      onError(msg);
      setProcessing(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess(result.paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe ships its own loading skeleton inside PaymentElement —
          don't draw a custom one on top of it. */}
      <div className="min-h-[200px]">
        <PaymentElement
          options={{ layout: "tabs" }}
          onReady={() => setElementReady(true)}
          onLoadError={(e) => {
            const msg = e?.error?.message || "Card form failed to load.";
            setError(msg);
            onError(msg);
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-4 hover:bg-accent transition-colors duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Lock className="w-3 h-3" />
        {processing
          ? "Processing..."
          : `Pay $${amount.toLocaleString()}`}
      </button>

      <p className="text-[10px] text-muted text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secured by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}

export default function StripePayment({
  onSuccess,
  onError,
  amount,
  metadata = {},
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const initStartedRef = useRef(false);

  // Auto-create the payment intent on mount so the Stripe card form
  // renders immediately. No intermediate "Proceed to Payment" button.
  // The amount is locked to whatever the client passes in; the Cloud
  // Function validates it against the server-side allowlist anyway.
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_URL}/createPaymentIntent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            metadata,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to initialize payment");
        }
        const data = await res.json();
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to initialize payment";
        if (!cancelled) {
          setFetchError(msg);
          onError(msg);
        }
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetchError) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{fetchError}</span>
        </div>
        <button
          type="button"
          onClick={() => { initStartedRef.current = false; setFetchError(null); }}
          className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div className="border border-border p-6 bg-cream/30">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Total Due</p>
            <span className="font-heading text-2xl text-dark">${amount.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">All bookings are non-refundable.</p>
        </div>
        <div className="border border-border p-6 text-center">
          <p className="text-sm text-muted">Loading secure payment form...</p>
        </div>
      </div>
    );
  }

  // Use Stripe's default 'stripe' theme — minimal customization to avoid
  // any CSS rules that could make the form invisible. Brand colors only.
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#6B7B3A",
            colorText: "#2C2C2C",
            colorDanger: "#dc2626",
            fontFamily: "inherit",
            borderRadius: "0px",
          },
        },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} onError={onError} amount={amount} />
    </Elements>
  );
}
