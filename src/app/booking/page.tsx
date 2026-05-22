"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, CheckCircle2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useBotGuard } from "@/components/BotGuard";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import StripePayment from "@/components/StripePayment";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { BLOCK_OPTIONS, EVENT_TYPES, formatTime, type DurationBlock } from "@/lib/booking";

const STEPS = ["Date & Time", "Your Details", "Payment"];

/** Format a Date as YYYY-MM-DD in the user's local timezone.
 *  Using toISOString() shifts dates across the date line for evening Pacific users. */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface FormData {
  selectedDate: Date | null;
  blockHours: DurationBlock;
  startTime: string;
  endTime: string;
  eventType: string;
  guestCount: number;
  notes: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  agreeTerms: boolean;
}

function BookingPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const botGuard = useBotGuard();

  const [form, setForm] = useState<FormData>({
    selectedDate: null,
    blockHours: 24,
    startTime: "15:00",
    endTime: "11:00",
    eventType: "",
    guestCount: 10,
    notes: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    agreeTerms: false,
  });

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const [y, m, d] = dateParam.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        setForm((prev) => prev.selectedDate ? prev : { ...prev, selectedDate: date });
      }
    }
  }, [searchParams]);

  const updateForm = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setErrors((errs) => {
      const next = { ...errs };
      Object.keys(updates).forEach((k) => delete next[k]);
      return next;
    });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.selectedDate) {
        errs.selectedDate = "Select an arrival date";
      } else {
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        minDate.setDate(minDate.getDate() + 3);
        if (form.selectedDate < minDate) {
          errs.selectedDate = "Bookings require at least 3 days advance notice";
        }
      }
    }
    if (step === 1) {
      if (!form.eventType) errs.eventType = "Required";
      if (!user) {
        if (!form.guestName.trim()) errs.guestName = "Required";
        if (!form.guestEmail.trim()) errs.guestEmail = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) errs.guestEmail = "Invalid email";
        if (!form.guestPhone.trim()) errs.guestPhone = "Required";
      }
      if (!form.agreeTerms) errs.agreeTerms = "Required";
      if (!botGuard.verified || botGuard.isBot()) errs.botGuard = "Verify you're not a robot";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const selectedBlock = BLOCK_OPTIONS.find((b) => b.hours === form.blockHours) || null;
  const chargeAmount = selectedBlock?.price || 0;

  const handlePaymentSuccess = async (_paymentIntentId: string) => {
    // No client-side Firestore write. The Stripe webhook is the single
    // source of truth — it verifies the payment signature, then creates
    // the booking_inquiries doc from Stripe metadata and pushes to
    // Hospitable. This eliminates the forged-PI-id and replay attack
    // surface that direct client writes would create.
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full border-b bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none transition-colors ${
      errors[field] ? "border-red-400" : "border-border focus:border-accent"
    }`;

  if (submitted) {
    const dateStr = form.selectedDate
      ? form.selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      : "";
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-heading text-3xl text-dark mb-3">Reservation Confirmed</h2>
          <p className="text-muted text-sm mb-4">
            Payment of <span className="text-dark font-medium">${chargeAmount.toLocaleString()}</span> received.
          </p>
          {dateStr && (
            <p className="text-muted text-sm mb-2">
              <span className="text-dark font-medium">{dateStr}</span>
            </p>
          )}
          <p className="text-muted text-sm mb-8">
            Check-in {formatTime(form.startTime)} · Check-out {formatTime(form.endTime)} the following day
          </p>
          <p className="text-muted text-sm mb-8">
            Confirmation email on the way. We&apos;ll be in touch shortly to lock in the details.
          </p>
          <Link href="/profile" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
            View Your Bookings
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <section className="relative h-[45vh] min-h-[300px] flex items-center justify-center">
        <Image src="/images/forest-approach.webp" alt="Booking" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Reserve Your Date</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Book the Estate</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Stepper */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-[2px] bg-border" />
              <div className="absolute top-4 left-0 h-[2px] bg-accent transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
              {STEPS.map((s, i) => (
                <div key={s} className="relative flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    i < step ? "bg-accent text-white" : i === step ? "bg-dark text-white ring-4 ring-dark/10" : "bg-white border-2 border-border text-muted"
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`mt-2 text-[10px] tracking-[0.15em] uppercase whitespace-nowrap ${i <= step ? "text-dark" : "text-muted"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-16">
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                  {/* STEP 0: Date & Time */}
                  {step === 0 && (
                    <div className="space-y-8">
                      <div className="border border-border bg-cream/30 p-4 text-sm text-muted">
                        Prefer to ask first? <Link href="/inquire" className="text-dark border-b border-dark hover:text-accent hover:border-accent transition-colors">Send an inquiry</Link> and our host will reach out before any payment.
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Select Your Date *</label>
                        <AvailabilityCalendar
                          selectedDate={form.selectedDate}
                          onSelectDate={(date) => updateForm({ selectedDate: date })}
                        />
                        {form.selectedDate && (
                          <p className="text-xs text-accent mt-3">
                            {form.selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        {errors.selectedDate && <p className="text-red-500 text-xs mt-2">{errors.selectedDate}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Duration *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BLOCK_OPTIONS.map((b) => (
                            <button
                              key={b.hours}
                              type="button"
                              onClick={() => updateForm({ blockHours: b.hours })}
                              className={`p-4 border text-left transition-all ${
                                form.blockHours === b.hours ? "border-dark text-dark" : "border-border text-muted hover:border-dark"
                              }`}
                            >
                              <div className="font-heading text-lg">{b.label}</div>
                              <div className="text-[10px] tracking-[0.1em] uppercase mt-1">{b.desc}</div>
                              <div className="text-sm text-dark mt-2">${b.price.toLocaleString()}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Start Time *</label>
                          <input
                            id="startTime"
                            type="time"
                            value={form.startTime}
                            onChange={(e) => updateForm({ startTime: e.target.value })}
                            className={inputClass("startTime")}
                          />
                        </div>
                        <div>
                          <label htmlFor="endTime" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">End Time *</label>
                          <input
                            id="endTime"
                            type="time"
                            value={form.endTime}
                            onChange={(e) => updateForm({ endTime: e.target.value })}
                            className={inputClass("endTime")}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted">
                        {formatTime(form.startTime)} – {formatTime(form.endTime)} · {form.blockHours} hr block
                        {form.blockHours === 24 && " (overnight — check-out the following morning)"}
                      </p>
                    </div>
                  )}

                  {/* STEP 1: Details + Review */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="font-heading text-2xl text-dark mb-1">Your Details</h3>
                        <p className="text-muted text-sm">We&apos;ll use this to confirm your reservation and follow up.</p>
                      </div>

                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Event Type *</label>
                        <select value={form.eventType} onChange={(e) => updateForm({ eventType: e.target.value })} className={inputClass("eventType")}>
                          <option value="">Select...</option>
                          {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
                      </div>

                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Guest Count</label>
                        <div className="flex items-center gap-4">
                          <button type="button" onClick={() => updateForm({ guestCount: Math.max(1, form.guestCount - 1) })} className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent transition-colors"><Minus className="w-3 h-3" /></button>
                          <input type="number" value={form.guestCount} onChange={(e) => updateForm({ guestCount: Math.max(1, Math.min(75, Number(e.target.value) || 1)) })} className="w-16 text-center border-b border-border bg-transparent py-2 text-lg font-heading focus:outline-none focus:border-accent" />
                          <button type="button" onClick={() => updateForm({ guestCount: Math.min(75, form.guestCount + 1) })} className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>

                      {user ? (
                        <div className="bg-cream/50 border border-border p-5 text-sm">
                          <p className="text-dark mb-1">Logged in as <span className="font-medium">{user.email}</span></p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div>
                            <label htmlFor="guestName" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Full Name *</label>
                            <input id="guestName" type="text" required value={form.guestName} onChange={(e) => updateForm({ guestName: e.target.value })} className={inputClass("guestName")} placeholder="Your name" />
                            {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
                          </div>
                          <div>
                            <label htmlFor="guestEmail" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Email *</label>
                            <input id="guestEmail" type="email" required value={form.guestEmail} onChange={(e) => updateForm({ guestEmail: e.target.value })} className={inputClass("guestEmail")} placeholder="you@email.com" />
                            {errors.guestEmail && <p className="text-red-500 text-xs mt-1">{errors.guestEmail}</p>}
                          </div>
                          <div>
                            <label htmlFor="guestPhone" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Phone *</label>
                            <input id="guestPhone" type="tel" required value={form.guestPhone} onChange={(e) => updateForm({ guestPhone: e.target.value })} className={inputClass("guestPhone")} placeholder="(555) 000-0000" />
                            {errors.guestPhone && <p className="text-red-500 text-xs mt-1">{errors.guestPhone}</p>}
                          </div>
                          <button type="button" onClick={() => setAuthOpen(true)} className="text-[11px] tracking-[0.2em] uppercase text-muted hover:text-dark transition-colors">
                            Already have an account? Sign in
                          </button>
                        </div>
                      )}

                      <div>
                        <label htmlFor="hostMessage" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Message to Host (optional)</label>
                        <textarea
                          id="hostMessage"
                          value={form.notes}
                          onChange={(e) => updateForm({ notes: e.target.value.slice(0, 2000) })}
                          rows={4}
                          maxLength={2000}
                          placeholder="Anything we should know? Special requests, accessibility needs, arrival details, vendors you're bringing, dietary restrictions..."
                          className={inputClass("notes") + " resize-none"}
                        />
                        <p className="text-[10px] text-muted mt-1">
                          {form.notes.length > 0 ? `${form.notes.length}/2000 — sent directly to ANEW` : "Sent to your host through Hospitable."}
                        </p>
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.agreeTerms} onChange={(e) => updateForm({ agreeTerms: e.target.checked })} className="w-4 h-4 mt-0.5 rounded-none border-border text-accent focus:ring-accent" />
                        <span className="text-sm text-muted">
                          I agree to pay <span className="text-dark font-medium">${chargeAmount.toLocaleString()}</span> in full to secure my reservation. All bookings are non-refundable.
                        </span>
                      </label>
                      {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

                      <div className="flex items-center gap-3 py-4 px-5 border border-border bg-cream/30">
                        <button type="button" onClick={() => botGuard.setVerified(true)} className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${botGuard.verified ? "border-green-500 bg-green-500" : "border-border hover:border-dark"}`}>
                          {botGuard.verified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className="text-sm text-muted">{botGuard.verified ? "Verified" : "I'm not a robot"}</span>
                      </div>
                      {errors.botGuard && <p className="text-red-500 text-xs">{errors.botGuard}</p>}
                      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" onChange={(e) => { botGuard.honeypotRef.current = e.target.value; }} />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Payment */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Confirm Your Reservation</h3>
                      <p className="text-muted text-sm">Pay in full to lock in your dates. You&apos;ll receive a confirmation email with all the details.</p>

                      {submitting ? (
                        <div className="text-center py-12">
                          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-muted text-sm">Confirming your reservation...</p>
                        </div>
                      ) : (
                        <StripePayment
                          amount={chargeAmount}
                          onSuccess={handlePaymentSuccess}
                          onError={(msg) => setPaymentError(msg)}
                          metadata={{
                            chargeAmount: String(chargeAmount),
                            eventType: form.eventType,
                            guestCount: String(form.guestCount),
                            arrivalDate: form.selectedDate ? toLocalDateString(form.selectedDate) : "",
                            durationHours: String(form.blockHours || ""),
                            startTime: form.startTime,
                            endTime: form.endTime,
                            customerEmail: user?.email || form.guestEmail,
                            customerName: user?.displayName || form.guestName,
                            customerPhone: form.guestPhone,
                            // Stripe caps metadata values at 500 chars
                            guestMessage: form.notes.slice(0, 500),
                          }}
                        />
                      )}
                      {paymentError && <p className="text-red-500 text-xs text-center">{paymentError}</p>}
                    </div>
                  )}

                  {/* Nav */}
                  {step < STEPS.length - 1 && (
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                      {step > 0 ? (
                        <button type="button" onClick={prev} className="flex items-center gap-1 text-sm text-muted hover:text-dark transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                      ) : <div />}
                      <button type="button" onClick={next} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors duration-500 flex items-center gap-2">
                        {step === STEPS.length - 2 ? "Proceed to Payment" : "Continue"} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {step === STEPS.length - 1 && !submitting && (
                    <div className="flex items-center mt-8 pt-8 border-t border-border">
                      <button type="button" onClick={prev} className="flex items-center gap-1 text-sm text-muted hover:text-dark transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 border-l border-border pl-8">
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted mb-6">Summary</p>
                <div className="space-y-3 text-sm">
                  {form.selectedDate && <div className="flex justify-between"><span className="text-muted">Date</span><span className="text-dark">{form.selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>}
                  {selectedBlock && <div className="flex justify-between"><span className="text-muted">Block</span><span className="text-dark">{selectedBlock.label}</span></div>}
                  {form.blockHours && <div className="flex justify-between"><span className="text-muted">Time</span><span className="text-dark">{formatTime(form.startTime)} – {formatTime(form.endTime)}</span></div>}
                  {form.eventType && <div className="flex justify-between"><span className="text-muted">Event</span><span className="text-dark">{form.eventType}</span></div>}
                  <div className="flex justify-between"><span className="text-muted">Guests</span><span className="text-dark">{form.guestCount}</span></div>
                  {form.notes.trim().length > 0 && (
                    <div className="pt-2">
                      <span className="text-muted block mb-1">Message to host</span>
                      <span className="text-dark text-xs whitespace-pre-wrap break-words line-clamp-4">{form.notes}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border my-5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark">Total Due</span>
                  <span className="font-heading text-2xl text-dark">${chargeAmount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted mt-4 italic">Charged in full at checkout. All bookings are non-refundable. Minimum 3 days advance notice required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-24">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    }>
      <BookingPageInner />
    </Suspense>
  );
}
