"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import HandDrawnDivider from "@/components/HandDrawnDivider";
import { useBotGuard } from "@/components/BotGuard";
import { EVENT_TYPES } from "@/lib/booking";

const FUNCTIONS_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
  "https://us-central1-bakkers-website-847ba.cloudfunctions.net";

export default function InquirePage() {
  const bot = useBotGuard();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    guestCount: 10,
    eventType: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim() || !form.email.trim() || !form.date.trim()) {
      setError("Name, email, and a target date are required.");
      return;
    }
    if (!bot.verified || bot.isBot()) {
      setError("Please verify you're not a robot.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/submitBookingInquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          honeypot: bot.honeypotRef.current || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-heading text-3xl text-dark mb-3">Inquiry Sent</h2>
          <p className="text-muted text-sm mb-8">
            Your booking inquiry has been forwarded to our host through Hospitable.
            You&apos;ll receive a personal reply within 24 hours to confirm or discuss your dates.
          </p>
          <Link href="/" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <section className="relative h-[45vh] min-h-[300px] flex items-center justify-center">
        <Image src="/images/forest-approach.webp" alt="Inquire" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Prefer to Talk First?</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Send an Inquiry</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <HandDrawnDivider variant="botanical" className="mb-8" />
            <p className="text-muted text-base leading-relaxed text-center max-w-xl mx-auto mb-12">
              Skip the instant-book flow and reach out to our host directly. We&apos;ll review your dates,
              answer any questions, and confirm availability before any payment is taken.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={75}
                    value={form.guestCount}
                    onChange={(e) => update("guestCount", Math.max(1, Math.min(75, Number(e.target.value) || 1)))}
                    className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={(e) => update("eventType", e.target.value)}
                  className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select...</option>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us about your event, any questions, or special requests..."
                  className="w-full border border-border bg-transparent p-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* honeypot */}
              <div style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  onChange={(e) => { bot.honeypotRef.current = e.target.value; }}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bot.verified}
                  onChange={(e) => bot.setVerified(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-xs text-muted">I&apos;m not a robot.</span>
              </label>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-4 hover:bg-accent transition-colors duration-500 disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Inquiry"}
              </button>

              <p className="text-[10px] text-muted text-center">
                Your inquiry is forwarded to our host through Hospitable.
                You&apos;ll receive a personal reply — no payment required at this step.
              </p>

              <p className="text-xs text-muted text-center pt-4">
                Ready to book instantly? <Link href="/booking" className="text-dark border-b border-dark hover:text-accent hover:border-accent transition-colors">Book the estate</Link>
              </p>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
