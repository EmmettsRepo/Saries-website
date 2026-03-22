"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, CheckCircle2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { submitBookingInquiry } from "@/lib/submissions";
import { getChefs, type Chef } from "@/lib/chefs";
import { useBotGuard } from "@/components/BotGuard";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import StripePayment from "@/components/StripePayment";

const eventTypeOptions = [
  "Wedding", "Elopement", "Birthday Celebration", "Family Gathering",
  "Corporate Retreat", "Private Dinner", "Wellness Retreat",
  "Photography Session", "Holiday Event", "Weekend Celebration", "Other",
];

const yearOptions = ["2026", "2027", "2028"];
const seasonOptions = ["Spring (Mar-May)", "Summer (Jun-Aug)", "Fall (Sep-Nov)", "Winter (Dec-Feb)"];

const durationOptions = [
  { label: "Half Day (4 hrs)", value: "half" },
  { label: "Full Day (8 hrs)", value: "full" },
  { label: "Extended (12 hrs)", value: "extended" },
  { label: "Weekend (2 days)", value: "weekend" },
  { label: "Custom", value: "custom" },
];

const packageOptions = [
  { name: "Elopement", price: 3000, desc: "Up to 15 · 1 night" },
  { name: "Gathering", price: 3000, desc: "Up to 40 · 1 night" },
  { name: "Corporate", price: 3000, desc: "Up to 50 · 1 night" },
  { name: "Signature", price: 6000, desc: "Up to 75 · 2 nights", popular: true },
  { name: "Weekend Retreat", price: 9000, desc: "Up to 75 · 3 nights" },
  { name: "Custom", price: 0, desc: "Up to 75 · Custom" },
];

const addOnOptions = [
  { name: "Catering Service", price: 45, unit: "/person", key: "catering" },
  { name: "Photography", price: 800, unit: "", key: "photography" },
  { name: "DJ / Music", price: 600, unit: "", key: "dj" },
  { name: "Floral & Decor", price: 1200, unit: "", key: "floral" },
  { name: "Fire Pit Evening", price: 300, unit: "", key: "firepit" },
  { name: "Ceremony Setup", price: 500, unit: "", key: "ceremony" },
  { name: "Nature Walk", price: 200, unit: "", key: "nature" },
  { name: "Extended Hours", price: 400, unit: "/hr", key: "extended" },
  { name: "Cleanup", price: 350, unit: "", key: "cleanup" },
  { name: "Shuttle", price: 250, unit: "", key: "shuttle" },
];

const boutiqueAddOns = [
  { name: "Welcome Gift — Signature Tea & Truffles", price: 68, key: "gift-tea" },
  { name: "Silk Sleep Mask (per guest room)", price: 48, key: "gift-mask" },
  { name: "Spa Bathrobe (per guest room)", price: 200, key: "gift-robe" },
  { name: "Cashmere Blanket", price: 780, key: "gift-cashmere" },
  { name: "Baby Alpaca Blanket", price: 640, key: "gift-alpaca" },
  { name: "Cork Yoga Mat Set (group)", price: 65, unit: "/mat", key: "gift-yoga" },
  { name: "Local Chocolate Box", price: 48, key: "gift-chocolate" },
  { name: "Lavender Sachet Set", price: 32, key: "gift-lavender" },
  { name: "Sheepskin Throw (4×6)", price: 280, key: "gift-sheepskin" },
  { name: "Selenite Votive Set", price: 80, key: "gift-selenite" },
];

const steps = ["Event", "Package", "Vision", "Review", "Payment"];

interface FormData {
  eventType: string; preferredYear: string; preferredSeason: string; guestCount: number;
  duration: string; setting: string; selectedPackage: string; packagePrice: number;
  addOns: string[]; boutiqueItems: string[]; selectedChef: string; cateringPref: string; decorStyle: string; budget: string;
  specialRequests: string; hearAbout: string; agreeTerms: boolean;
  guestName: string; guestEmail: string; guestPhone: string;
}

export default function BookingPage() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => { getChefs().then(setChefs); }, []);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    eventType: "", preferredYear: "", preferredSeason: "", guestCount: 30,
    duration: "", setting: "", selectedPackage: "", packagePrice: 0,
    addOns: [], boutiqueItems: [], selectedChef: "", cateringPref: "", decorStyle: "", budget: "",
    specialRequests: "", hearAbout: "", agreeTerms: false,
    guestName: "", guestEmail: "", guestPhone: "",
  });

  const updateForm = (updates: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((k) => delete clearedErrors[k]);
    setErrors(clearedErrors);
  };

  const toggleAddOn = (key: string) => {
    updateForm({ addOns: form.addOns.includes(key) ? form.addOns.filter((a) => a !== key) : [...form.addOns, key] });
  };

  const toggleBoutiqueItem = (key: string) => {
    updateForm({ boutiqueItems: form.boutiqueItems.includes(key) ? form.boutiqueItems.filter((a) => a !== key) : [...form.boutiqueItems, key] });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.eventType) errs.eventType = "Required";
      if (!form.preferredYear) errs.preferredYear = "Required";
      if (!form.preferredSeason) errs.preferredSeason = "Required";
      if (!form.duration) errs.duration = "Required";
      if (!form.setting) errs.setting = "Required";
    }
    if (step === 1 && !form.selectedPackage) errs.selectedPackage = "Required";
    if (step === 3) {
      if (!form.agreeTerms) errs.agreeTerms = "Required";
      if (!botGuard.verified) errs.botGuard = "Please verify you're not a robot";
      if (botGuard.isBot()) errs.botGuard = "Verification failed";
      if (!user) {
        if (!form.guestName.trim()) errs.guestName = "Required";
        if (!form.guestEmail.trim()) errs.guestEmail = "Required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) errs.guestEmail = "Invalid email";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 4)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const botGuard = useBotGuard();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setSubmitting(true);
    try {
      await submitBookingInquiry({
        ...form,
        type: "booking",
        userId: user?.uid || "guest",
        email: user?.email || form.guestEmail,
        displayName: user?.displayName || form.guestName,
        phone: form.guestPhone || undefined,
        estimatedTotal: subtotal,
        estimatedDeposit: deposit,
        paymentIntentId,
        paymentStatus: "deposit_paid",
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addOnTotal = form.addOns.reduce((sum, key) => {
    const addon = addOnOptions.find((a) => a.key === key);
    if (!addon) return sum;
    if (addon.key === "catering") return sum + addon.price * form.guestCount;
    return sum + addon.price;
  }, 0);
  const boutiqueTotal = form.boutiqueItems.reduce((sum, key) => {
    const item = boutiqueAddOns.find((a) => a.key === key);
    return item ? sum + item.price : sum;
  }, 0);
  const selectedChef = form.selectedChef ? chefs.find((c) => c.id === form.selectedChef) : null;
  const chefTotal = selectedChef ? selectedChef.price * form.guestCount : 0;
  const subtotal = form.packagePrice + addOnTotal + boutiqueTotal + chefTotal;
  const deposit = Math.round(subtotal * 0.25);

  const inputClass = (field: string) =>
    `w-full border-b bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none transition-colors ${
      errors[field] ? "border-red-400" : "border-border focus:border-accent"
    }`;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-heading text-3xl text-dark mb-3">Booking Confirmed</h2>
          <p className="text-muted text-sm mb-4">Your deposit of <span className="text-dark font-medium">${deposit.toLocaleString()}</span> has been received.</p>
          <p className="text-muted text-sm mb-8">We&apos;ll review your {form.eventType.toLowerCase() || "event"} request for {form.preferredSeason} {form.preferredYear} and reach out via email to finalize details and confirm your date.</p>
          {subtotal > 0 && <p className="text-muted text-sm mb-8">Estimated total: <span className="text-dark font-medium">${subtotal.toLocaleString()}</span> &middot; Remaining balance due 30 days before your event.</p>}
          <Link href="/profile" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
            View Your Bookings
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[300px] flex items-center justify-center">
        <Image src="/images/forest-approach.jpg" alt="Booking" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Begin Your Journey</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Plan Your Event</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-8 mb-16">
            {steps.map((s, i) => (
              <button key={s} onClick={() => i < step && setStep(i)} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  i < step ? "bg-accent text-white" : i === step ? "border border-dark text-dark" : "border border-border text-muted"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className={`hidden sm:block text-[11px] tracking-[0.2em] uppercase ${i <= step ? "text-dark" : "text-muted"}`}>{s}</span>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-16">
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.25 }}>
                  {/* STEP 0: Event Details */}
                  {step === 0 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Event Details</h3>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Event Type *</label>
                        <select value={form.eventType} onChange={(e) => updateForm({ eventType: e.target.value })} className={inputClass("eventType")}>
                          <option value="">Select...</option>
                          {eventTypeOptions.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Preferred Year *</label>
                          <div className="flex gap-2">
                            {yearOptions.map((y) => (
                              <button key={y} type="button" onClick={() => updateForm({ preferredYear: y })}
                                className={`flex-1 py-2.5 text-sm border transition-all ${form.preferredYear === y ? "border-dark text-dark" : "border-border text-muted hover:border-dark"}`}>
                                {y}
                              </button>
                            ))}
                          </div>
                          {errors.preferredYear && <p className="text-red-500 text-xs mt-1">{errors.preferredYear}</p>}
                        </div>
                        <div>
                          <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Preferred Season *</label>
                          <div className="grid grid-cols-2 gap-2">
                            {seasonOptions.map((s) => (
                              <button key={s} type="button" onClick={() => updateForm({ preferredSeason: s })}
                                className={`py-2.5 text-xs border transition-all ${form.preferredSeason === s ? "border-dark text-dark" : "border-border text-muted hover:border-dark"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                          {errors.preferredSeason && <p className="text-red-500 text-xs mt-1">{errors.preferredSeason}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Guest Count</label>
                        <div className="flex items-center gap-4">
                          <button type="button" onClick={() => updateForm({ guestCount: Math.max(2, form.guestCount - 5) })} className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent transition-colors"><Minus className="w-3 h-3" /></button>
                          <input type="number" value={form.guestCount} onChange={(e) => updateForm({ guestCount: Math.max(2, Math.min(75, Number(e.target.value))) })} className="w-16 text-center border-b border-border bg-transparent py-2 text-lg font-heading focus:outline-none focus:border-accent" />
                          <button type="button" onClick={() => updateForm({ guestCount: Math.min(75, form.guestCount + 5) })} className="w-8 h-8 border border-border flex items-center justify-center hover:border-accent transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Duration *</label>
                        <div className="flex flex-wrap gap-2">
                          {durationOptions.map((d) => (
                            <button key={d.value} type="button" onClick={() => updateForm({ duration: d.value })}
                              className={`px-4 py-2.5 text-sm border transition-all ${form.duration === d.value ? "border-dark text-dark" : "border-border text-muted hover:border-dark"}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Setting *</label>
                        <div className="flex gap-2">
                          {["Indoor", "Outdoor", "Both"].map((s) => (
                            <button key={s} type="button" onClick={() => updateForm({ setting: s })}
                              className={`flex-1 py-3 text-sm border transition-all ${form.setting === s ? "border-dark text-dark" : "border-border text-muted hover:border-dark"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                        {errors.setting && <p className="text-red-500 text-xs mt-1">{errors.setting}</p>}
                      </div>
                    </div>
                  )}

                  {/* STEP 1: Package & Add-ons */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Package & Add-ons</h3>
                      <div className="space-y-0">
                        {packageOptions.map((pkg) => (
                          <button key={pkg.name} type="button" onClick={() => updateForm({ selectedPackage: pkg.name, packagePrice: pkg.price })}
                            className={`w-full flex items-center justify-between py-5 border-b border-border text-left transition-colors ${form.selectedPackage === pkg.name ? "text-dark" : "text-muted hover:text-dark"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${form.selectedPackage === pkg.name ? "border-accent bg-accent" : "border-border"}`}>
                                {form.selectedPackage === pkg.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              <div>
                                <span className="text-[15px]">{pkg.name}</span>
                                {pkg.popular && <span className="ml-2 text-[9px] tracking-[0.2em] uppercase text-accent">Popular</span>}
                                <p className="text-xs text-muted mt-0.5">{pkg.desc}</p>
                              </div>
                            </div>
                            <span className="font-heading text-lg">{pkg.price > 0 ? `$${pkg.price.toLocaleString()}` : "Custom"}</span>
                          </button>
                        ))}
                      </div>
                      {errors.selectedPackage && <p className="text-red-500 text-xs">{errors.selectedPackage}</p>}

                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-muted mb-4">Add-ons</p>
                        <div className="space-y-0">
                          {addOnOptions.map((addon) => (
                            <button key={addon.key} type="button" onClick={() => toggleAddOn(addon.key)}
                              className={`w-full flex items-center justify-between py-3.5 border-b border-border text-left text-sm transition-colors ${form.addOns.includes(addon.key) ? "text-dark" : "text-muted hover:text-dark"}`}>
                              <span className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 border flex items-center justify-center ${form.addOns.includes(addon.key) ? "bg-accent border-accent" : "border-border"}`}>
                                  {form.addOns.includes(addon.key) && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                {addon.name}
                              </span>
                              <span>${addon.price}{addon.unit}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-muted mb-4">Book a Private Chef</p>
                        <div className="space-y-0">
                          <button type="button" onClick={() => updateForm({ selectedChef: "" })}
                            className={`w-full flex items-center justify-between py-3.5 border-b border-border text-left text-sm transition-colors ${!form.selectedChef ? "text-dark" : "text-muted hover:text-dark"}`}>
                            <span className="flex items-center gap-2">
                              <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${!form.selectedChef ? "border-accent bg-accent" : "border-border"}`}>
                                {!form.selectedChef && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              No chef needed
                            </span>
                          </button>
                          {chefs.map((chef) => (
                            <button key={chef.id} type="button" onClick={() => updateForm({ selectedChef: chef.id })}
                              className={`w-full flex items-center justify-between py-3.5 border-b border-border text-left text-sm transition-colors ${form.selectedChef === chef.id ? "text-dark" : "text-muted hover:text-dark"}`}>
                              <span className="flex items-center gap-2">
                                <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${form.selectedChef === chef.id ? "border-accent bg-accent" : "border-border"}`}>
                                  {form.selectedChef === chef.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <div>
                                  <span>{chef.name}</span>
                                  <span className="text-xs text-muted ml-2">{chef.specialty}</span>
                                </div>
                              </span>
                              <span className="font-heading">${chef.price}/person</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-muted mb-2">Boutique Add-ons</p>
                        <p className="text-xs text-muted mb-4">Elevate your event with curated boutique items</p>
                        <div className="space-y-0">
                          {boutiqueAddOns.map((item) => (
                            <button key={item.key} type="button" onClick={() => toggleBoutiqueItem(item.key)}
                              className={`w-full flex items-center justify-between py-3.5 border-b border-border text-left text-sm transition-colors ${form.boutiqueItems.includes(item.key) ? "text-dark" : "text-muted hover:text-dark"}`}>
                              <span className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 border flex items-center justify-center ${form.boutiqueItems.includes(item.key) ? "bg-accent border-accent" : "border-border"}`}>
                                  {form.boutiqueItems.includes(item.key) && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                {item.name}
                              </span>
                              <span>${item.price}{item.unit || ""}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Vision */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Your Vision</h3>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Catering Preference</label>
                        <select value={form.cateringPref} onChange={(e) => updateForm({ cateringPref: e.target.value })} className={inputClass("cateringPref")}>
                          <option value="">Select...</option>
                          <option>No Catering</option><option>Appetizers Only</option><option>Full Dinner</option><option>Brunch</option><option>Custom Menu</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-3">Decor Style</label>
                        <div className="flex flex-wrap gap-2">
                          {["Rustic Woodland", "Elegant Classic", "Bohemian", "Minimalist", "Custom"].map((s) => (
                            <button key={s} type="button" onClick={() => updateForm({ decorStyle: s })}
                              className={`px-4 py-2.5 text-sm border transition-all ${form.decorStyle === s ? "border-dark text-dark" : "border-border text-muted hover:border-dark"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Budget Range</label>
                        <select value={form.budget} onChange={(e) => updateForm({ budget: e.target.value })} className={inputClass("budget")}>
                          <option value="">Select...</option>
                          <option>Under $3,000</option><option>$3,000 - $5,000</option><option>$5,000 - $10,000</option><option>$10,000 - $15,000</option><option>$15,000+</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Special Requests</label>
                        <textarea value={form.specialRequests} onChange={(e) => updateForm({ specialRequests: e.target.value })} rows={4} placeholder="Tell us about your dream event..." className={inputClass("specialRequests") + " resize-none"} />
                      </div>
                      <div>
                        <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">How did you find us?</label>
                        <select value={form.hearAbout} onChange={(e) => updateForm({ hearAbout: e.target.value })} className={inputClass("hearAbout")}>
                          <option value="">Select...</option>
                          <option>Instagram</option><option>Google</option><option>Friend</option><option>Wedding Blog</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Review & Contact */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Review & Contact</h3>

                      {user ? (
                        <div className="bg-cream/50 border border-border p-5 text-sm">
                          <p className="text-dark mb-1">Logged in as <span className="font-medium">{user.email}</span></p>
                          <p className="text-muted text-xs">Your contact info is linked to this account.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <p className="text-muted text-sm">Enter your contact details so we can follow up on your booking.</p>
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
                            <label htmlFor="guestPhone" className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Phone (optional)</label>
                            <input id="guestPhone" type="tel" value={form.guestPhone} onChange={(e) => updateForm({ guestPhone: e.target.value })} className={inputClass("guestPhone")} placeholder="(555) 000-0000" />
                          </div>
                          <div className="pt-2">
                            <button type="button" onClick={() => setAuthOpen(true)} className="text-[11px] tracking-[0.2em] uppercase text-muted hover:text-dark transition-colors">
                              Already have an account? Sign in
                            </button>
                          </div>
                        </div>
                      )}

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.agreeTerms} onChange={(e) => updateForm({ agreeTerms: e.target.checked })} className="w-4 h-4 mt-0.5 rounded-none border-border text-accent focus:ring-accent" />
                        <span className="text-sm text-muted">I agree to pay a 25% non-refundable deposit to secure my date. The remaining balance is due 30 days before the event.</span>
                      </label>
                      {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}

                      {/* Bot guard */}
                      <div className="flex items-center gap-3 py-4 px-5 border border-border bg-cream/30">
                        <button type="button" onClick={() => botGuard.setVerified(true)}
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${botGuard.verified ? "border-green-500 bg-green-500" : "border-border hover:border-dark"}`}>
                          {botGuard.verified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className="text-sm text-muted">{botGuard.verified ? "Verified" : "I'm not a robot"}</span>
                      </div>
                      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" onChange={(e) => { botGuard.honeypotRef.current = e.target.value; }} />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Payment */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <h3 className="font-heading text-2xl text-dark">Secure Your Date</h3>
                      <p className="text-muted text-sm">Pay your 25% deposit to confirm your booking. You&apos;ll receive an email confirmation with all the details.</p>

                      {submitting ? (
                        <div className="text-center py-12">
                          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-muted text-sm">Confirming your booking...</p>
                        </div>
                      ) : (
                        <StripePayment
                          amount={deposit}
                          onSuccess={handlePaymentSuccess}
                          onError={(msg) => setPaymentError(msg)}
                          metadata={{
                            eventType: form.eventType,
                            guestCount: String(form.guestCount),
                            package: form.selectedPackage,
                            customerEmail: user?.email || form.guestEmail,
                            customerName: user?.displayName || form.guestName,
                          }}
                        />
                      )}

                      {paymentError && (
                        <p className="text-red-500 text-xs text-center">{paymentError}</p>
                      )}
                    </div>
                  )}

                  {/* Nav */}
                  {step < 4 && (
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                      {step > 0 ? (
                        <button type="button" onClick={prev} className="flex items-center gap-1 text-sm text-muted hover:text-dark transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                      ) : <div />}
                      <button type="button" onClick={next} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors duration-500 flex items-center gap-2">
                        {step === 3 ? "Proceed to Payment" : "Continue"} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {step === 4 && (
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
                  {form.eventType && <div className="flex justify-between"><span className="text-muted">Event</span><span className="text-dark">{form.eventType}</span></div>}
                  {form.preferredSeason && <div className="flex justify-between"><span className="text-muted">Season</span><span className="text-dark">{form.preferredSeason}</span></div>}
                  {form.preferredYear && <div className="flex justify-between"><span className="text-muted">Year</span><span className="text-dark">{form.preferredYear}</span></div>}
                  <div className="flex justify-between"><span className="text-muted">Guests</span><span className="text-dark">{form.guestCount}</span></div>
                  {form.duration && <div className="flex justify-between"><span className="text-muted">Duration</span><span className="text-dark capitalize">{durationOptions.find(d => d.value === form.duration)?.label}</span></div>}
                  {form.setting && <div className="flex justify-between"><span className="text-muted">Setting</span><span className="text-dark">{form.setting}</span></div>}
                </div>
                {form.selectedPackage && (
                  <>
                    <div className="border-t border-border my-5" />
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">Package</span><span className="text-dark">{form.selectedPackage}</span>
                    </div>
                    {form.packagePrice > 0 && <div className="flex justify-between text-xs"><span className="text-muted">Base</span><span>${form.packagePrice.toLocaleString()}</span></div>}
                  </>
                )}
                {form.addOns.length > 0 && (
                  <>
                    <div className="border-t border-border my-5" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Add-ons</p>
                    {form.addOns.map((key) => {
                      const addon = addOnOptions.find((a) => a.key === key);
                      if (!addon) return null;
                      const cost = addon.key === "catering" ? addon.price * form.guestCount : addon.price;
                      return <div key={key} className="flex justify-between text-xs mb-1"><span className="text-muted">{addon.name}</span><span>${cost.toLocaleString()}</span></div>;
                    })}
                  </>
                )}
                {selectedChef && (
                  <>
                    <div className="border-t border-border my-5" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Private Chef</p>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted">{selectedChef.name}</span><span>${chefTotal.toLocaleString()}</span></div>
                  </>
                )}
                {form.boutiqueItems.length > 0 && (
                  <>
                    <div className="border-t border-border my-5" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted mb-2">Boutique</p>
                    {form.boutiqueItems.map((key) => {
                      const item = boutiqueAddOns.find((a) => a.key === key);
                      if (!item) return null;
                      return <div key={key} className="flex justify-between text-xs mb-1"><span className="text-muted">{item.name}</span><span>${item.price}</span></div>;
                    })}
                  </>
                )}
                {subtotal > 0 && (
                  <>
                    <div className="border-t border-border my-5" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark">Estimated Total</span>
                      <span className="font-heading text-2xl text-dark">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                      <span className="text-sm text-accent font-medium">Deposit (25%)</span>
                      <span className="font-heading text-lg text-accent">${deposit.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted mt-4 italic">Deposit secures your date. Balance due 30 days before event.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
