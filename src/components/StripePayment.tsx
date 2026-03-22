"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// TODO: Update to your deployed Cloud Function URL
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: {},
        }}
      />

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
          : `Pay $${amount.toLocaleString()} Deposit`}
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
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const initPayment = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/createPaymentIntent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to cents
          metadata,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to initialize payment");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to initialize payment";
      setFetchError(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  }, [amount, metadata, onError]);

  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div className="border border-border p-6 bg-cream/30">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted">
              Deposit Required
            </p>
            <span className="font-heading text-2xl text-dark">
              ${amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed mb-1">
            A 25% non-refundable deposit secures your date. The remaining
            balance is due 30 days before your event.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Cancellations 60+ days out receive a 50% refund of the remaining
            balance.
          </p>
        </div>

        {fetchError && (
          <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={initPayment}
          disabled={loading}
          className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-4 hover:bg-accent transition-colors duration-500 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Lock className="w-3 h-3" />
          {loading ? "Setting up payment..." : "Proceed to Payment"}
        </button>

        <p className="text-[10px] text-muted text-center flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Secured by Stripe. Your card details never touch our servers.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            fontFamily: "inherit",
            colorPrimary: "#6B7B3A",
            colorBackground: "#FDFBF7",
            colorText: "#2C2C2C",
            colorDanger: "#dc2626",
            borderRadius: "0px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #E8E4DE",
              boxShadow: "none",
              padding: "12px",
              fontSize: "14px",
            },
            ".Input:focus": {
              border: "1px solid #6B7B3A",
              boxShadow: "none",
            },
            ".Label": {
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#8B8680",
              marginBottom: "8px",
            },
            ".Tab": {
              border: "1px solid #E8E4DE",
              boxShadow: "none",
            },
            ".Tab--selected": {
              border: "1px solid #2C2C2C",
              boxShadow: "none",
            },
          },
        },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} onError={onError} amount={amount} />
    </Elements>
  );
}
