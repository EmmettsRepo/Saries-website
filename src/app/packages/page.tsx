"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

const packages = [
  {
    name: "Elopement",
    price: "$3,000",
    capacity: "Up to 15 guests",
    duration: "1 night",
    includes: ["Ceremony lawn access", "Basic setup (arch + chairs)", "1-hour venue prep", "Parking", "Overnight stay"],
    best: "Intimate elopements & micro-weddings",
    details: "The perfect package for couples who want a meaningful ceremony in nature. Includes the most scenic spots on the property and one night's stay.",
  },
  {
    name: "Gathering",
    price: "$3,000",
    capacity: "Up to 40 guests",
    duration: "1 night",
    includes: ["Indoor or outdoor space", "Tables & chairs", "Basic lighting", "2-hour setup", "Parking", "Overnight stay"],
    best: "Birthday parties, small gatherings",
    details: "An approachable package for smaller celebrations. Choose between the Grand Hall or Courtyard. Includes one night's stay.",
  },
  {
    name: "Corporate",
    price: "$3,000",
    capacity: "Up to 50 guests",
    duration: "1 night",
    includes: ["Grand Hall + breakout spaces", "AV equipment", "High-speed Wi-Fi", "Coffee & tea all day", "Courtyard access", "Overnight stay"],
    best: "Team retreats, strategy sessions",
    details: "Break out of the office and into nature. The property's calm setting fosters creativity and connection. Includes one night's stay.",
  },
  {
    name: "Signature",
    price: "$6,000",
    capacity: "Up to 75 guests",
    duration: "2 nights",
    featured: true,
    includes: ["Full venue access", "Catering kitchen", "Fire pit lounge", "String lights", "Bridal suite", "Event coordinator", "Tables, chairs & linens", "2-night stay"],
    best: "Weddings, milestone celebrations",
    details: "Our most popular package. From ceremony to reception, every space is yours. A dedicated coordinator ensures every detail is handled. Includes two nights.",
  },
  {
    name: "Weekend Retreat",
    price: "$9,000",
    capacity: "Up to 75 guests",
    duration: "Full weekend (3 nights)",
    includes: ["Everything in Signature", "5 bedrooms (all 3 nights)", "Private chef — all meals", "Guided nature walk", "Welcome reception", "Farewell brunch", "Full cleanup"],
    best: "Destination weddings, multi-day celebrations",
    details: "The ultimate ANEW experience. Guests arrive Friday, celebrate all weekend, and gather for farewell brunch Sunday. Three nights at $3,000/night.",
  },
  {
    name: "Custom",
    price: "Let's Talk",
    capacity: "Up to 75 guests",
    duration: "Any duration",
    includes: ["Fully customizable", "Mix & match spaces", "Custom catering", "Personalized add-ons", "Dedicated planning"],
    best: "Unique celebrations",
    details: "Have something specific in mind? Tell us your vision and we'll build a custom proposal. Base rate is $3,000/night.",
  },
];

const addOns = [
  { name: "Catering", price: "$45/person" },
  { name: "Photography", price: "$800" },
  { name: "DJ / Music", price: "$600" },
  { name: "Floral & Decor", price: "$1,200" },
  { name: "Fire Pit Evening", price: "$300" },
  { name: "Ceremony Setup", price: "$500" },
  { name: "Nature Walk", price: "$200" },
  { name: "Extended Hours", price: "$400/hr" },
  { name: "Cleanup", price: "$350" },
  { name: "Shuttle", price: "$250" },
  { name: "Overnight Rooms", price: "$150/room" },
];

const pricingFaqs = [
  { q: "What deposit is required?", a: "25% non-refundable deposit to secure your date. Remaining balance due 30 days before." },
  { q: "Cancellation policy?", a: "60+ days out: 50% refund of balance. Under 60 days: non-refundable. Date changes subject to availability." },
  { q: "Can packages be customized?", a: "Every package is a starting point. We're happy to adjust features to match your vision." },
  { q: "What's not included?", a: "Catering, photography, florals, and entertainment are available as add-ons or through your own vendors." },
  { q: "Payment methods?", a: "Credit cards, bank transfers, and checks. Payment plans available for events 6+ months out." },
];

export default function PackagesPage() {
  // Auto-expand Signature (index 3) by default
  const [expandedPkg, setExpandedPkg] = useState<number | null>(3);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/courtyard-lounge.jpg" alt="Packages" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Invest in Unforgettable</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Packages</h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Packages */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="divider mx-auto mb-8" />
            <p className="text-muted text-base leading-relaxed max-w-lg mx-auto">
              Every package can be tailored to your vision. Choose a starting point, then make it yours.
            </p>
          </AnimatedSection>

          <div className="space-y-0">
            {packages.map((pkg, i) => (
              <AnimatedSection key={pkg.name} delay={i * 0.05}>
                <div className={`border-b border-border ${pkg.featured ? "bg-cream -mx-6 px-6 py-2 rounded-sm" : ""}`}>
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedPkg(expandedPkg === i ? null : i)}
                    className="w-full py-8 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <h3 className="font-heading text-2xl text-dark group-hover:text-accent transition-colors">{pkg.name}</h3>
                      {pkg.featured && (
                        <span className="text-[9px] tracking-[0.2em] uppercase bg-accent text-white px-2.5 py-1">Popular</span>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-heading text-2xl text-dark">{pkg.price}</span>
                      <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${expandedPkg === i ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedPkg === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8">
                          <div className="flex flex-wrap gap-4 text-[11px] tracking-[0.2em] uppercase text-muted mb-6">
                            <span>{pkg.capacity}</span>
                            <span>&middot;</span>
                            <span>{pkg.duration}</span>
                            <span>&middot;</span>
                            <span>Best for: {pkg.best}</span>
                          </div>
                          <p className="text-muted text-sm leading-relaxed mb-6">{pkg.details}</p>
                          <div className="grid sm:grid-cols-2 gap-2 mb-6">
                            {pkg.includes.map((item) => (
                              <div key={item} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                                <span className="text-sm text-muted">{item}</span>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/booking"
                            className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors"
                          >
                            {pkg.price === "Let's Talk" ? "Inquire" : "Select Package"}
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-28 sm:py-36 bg-cream px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Enhance</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Add-ons</h2>
          </AnimatedSection>
          <div className="space-y-0">
            {addOns.map((addon, i) => (
              <AnimatedSection key={addon.name} delay={i * 0.03}>
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <span className="text-[15px] text-dark">{addon.name}</span>
                  <span className="text-[15px] text-muted font-heading">{addon.price}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Pricing</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Questions</h2>
          </AnimatedSection>
          <div className="space-y-0">
            {pricingFaqs.map((faq, i) => (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="text-dark text-[15px] pr-4 group-hover:text-accent transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted leading-relaxed pb-5">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/forest-approach.jpg" alt="Forest" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <h2 className="font-heading text-4xl sm:text-5xl font-normal mb-6">Ready to Book?</h2>
            <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500">
              Start Your Inquiry
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
