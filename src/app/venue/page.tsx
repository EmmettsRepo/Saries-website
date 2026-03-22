"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import HandDrawnDivider from "@/components/HandDrawnDivider";
import CornerAccent from "@/components/CornerAccent";
import { useState } from "react";

const spaces = [
  { name: "Grand Hall", tag: "Indoor", capacity: "75 guests", img: "/images/interior-living-wide.webp", desc: "Refined craftsmanship at its finest — soaring timber beams, a hand-forged iron chandelier, and floor-to-ceiling windows framing the forest canopy." },
  { name: "Courtyard & Fire Pit", tag: "Outdoor", capacity: "60 guests", img: "/images/outdoor-firepit-cabin.webp", desc: "An elegant outdoor lounge with a stone fire pit, plush seating, and twinkling string lights — exceptional for evening gatherings." },
  { name: "Ceremony Lawn", tag: "Outdoor", capacity: "75 guests", img: "/images/exterior-wide.jpg", desc: "A manicured lawn flanked by towering trees, creating a natural cathedral. An elevated setting for life's most cherished moments." },
  { name: "Master Suite", tag: "Indoor", capacity: "Private", img: "/images/master-bedroom.jpg", desc: "Reclaimed timber king bed with backlit headboard, ceiling fan, and a warm tile accent wall — the most private room in the estate." },
  { name: "Queen Suite", tag: "Indoor", capacity: "Private", img: "/images/bedroom-master.webp", desc: "A rope-suspended queen bed beneath a chandelier with vaulted ceilings and exposed beams." },
  { name: "Bunk Room", tag: "Indoor", capacity: "4 guests", img: "/images/bunkbeds.jpg", desc: "Custom-built reclaimed timber bunk beds with ladder access, sheepskin rug, and cozy loft sleeping — perfect for groups and kids." },
  { name: "Chef's Kitchen", tag: "Indoor", capacity: "Catering ready", img: "/images/kitchen-sink.webp", desc: "Refined craftsmanship meets function — farmhouse sink, copper fixtures, and direct courtyard access for private chefs." },
  { name: "Spa & Wellness Center", tag: "Indoor", capacity: "By appointment", img: "/images/spa-sauna.jpg", desc: "An exceptional on-site retreat featuring sauna, massage therapy, IV therapy treatments, and a private soaking tub — elevated wellness in a natural oasis." },
  { name: "Massage & Treatment Room", tag: "Indoor", capacity: "1-2 guests", img: "/images/bathroom-shower.webp", desc: "An exclusive private treatment space for deep tissue, Swedish, and hot stone massages with licensed therapists." },
  { name: "Event Pavilion", tag: "Indoor", capacity: "75 guests", img: "/images/event-hall.jpg", desc: "A versatile open-plan hall with exposed timber beams, polished concrete floors, and French doors opening to the forest. Expandable tables available for dining, workshops, or yoga — designed for any activity you envision." },
  { name: "Studio Cabin", tag: "Indoor/Outdoor", capacity: "Flexible", img: "/images/cabin-entrance.jpg", desc: "A charming standalone cabin with tree-lined approach — ideal for breakout sessions, bridal prep, or intimate gatherings." },
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend 6-12 months for peak season (May-October). Off-season dates may be available with shorter notice." },
  { q: "What is the maximum guest count?", a: "Up to 75 guests for events. The estate sleeps up to 10 overnight across 5 bedrooms." },
  { q: "Are overnight stays included?", a: "Yes — every booking includes an overnight stay. The base rate is $3,000 per night." },
  { q: "What about parking?", a: "On-site parking for up to 20 vehicles. For larger events, we can arrange shuttle service from nearby lots." },
  { q: "Is the venue accessible?", a: "The main floor, Grand Hall, courtyard, and fire pit are all ground-level accessible. Please contact us to discuss specific accessibility needs." },
  { q: "What if it rains?", a: "The Grand Hall and Event Pavilion seat up to 75 indoors. We can transition outdoor ceremonies inside with advance notice." },
  { q: "What about the spa and wellness services?", a: "Our on-site spa features sauna, massage therapy, IV therapy, and soaking tub experiences. Available by appointment for guests and event attendees." },
  { q: "Can I bring my own vendors?", a: "Yes. We welcome approved outside vendors and maintain a preferred vendor list." },
  { q: "What's included in the base price?", a: "Every booking includes the venue, overnight stay, basic setup (tables and chairs), parking, and access to all indoor and outdoor spaces. Catering, photography, and florals are available as add-ons." },
  { q: "Deposit and cancellation?", a: "25% non-refundable deposit secures your date. Cancellations 60+ days out receive 50% refund of remaining balance." },
  { q: "Setup and cleanup?", a: "2-4 hour setup windows included. Cleanup package available for $350." },
  { q: "Noise restrictions?", a: "Amplified music until 10 PM. Acoustic music and conversation may continue." },
];

export default function VenuePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[450px] flex items-center justify-center">
        <Image src="/images/driveway-approach.webp" alt="ANEW" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Elevated &amp; Exclusive</p>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-normal">The Estate</h1>
            <p className="text-white/60 mt-4 max-w-lg mx-auto text-sm">A natural oasis amidst the city — refined craftsmanship, rustic charm, and exceptional experiences.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro + Stats */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <div className="flex justify-center gap-16 mb-12">
              <div>
                <span className="font-heading text-4xl text-dark">5</span>
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted mt-1">Bedrooms</p>
              </div>
              <div>
                <span className="font-heading text-4xl text-dark">4</span>
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted mt-1">Bathrooms</p>
              </div>
              <div>
                <span className="font-heading text-4xl text-dark">5,800</span>
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted mt-1">Sq Ft</p>
              </div>
            </div>
            <HandDrawnDivider variant="botanical" className="mb-8" />
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto mb-6">
              ANEW is a natural oasis amidst the city — a 5,800 sq ft estate of refined craftsmanship and rustic charm, set on two wooded acres just minutes from Seattle.
            </p>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto mb-6">
              The estate features an elevated on-site spa and wellness center with sauna, massage therapy, IV therapy treatments, and a private soaking tub retreat — an exceptional space designed to restore mind and body.
            </p>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
              Every detail reflects elegant, intentional design — from the hand-forged ironwork to the weathered timber facades. An exclusive setting for celebrations, retreats, and experiences that feel truly exceptional.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Two-col: Grounds */}
      <section className="px-6 pb-28 sm:pb-36">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          <AnimatedSection direction="left">
            <div className="relative aspect-[4/5] max-h-[700px]">
              <Image src="/images/exterior-side.webp" alt="Exterior" fill className="object-cover" />
            </div>
          </AnimatedSection>
          <AnimatedSection direction="right" className="lg:pl-20 xl:pl-28">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">The Grounds</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              Rustic Charm,<br />Refined Craftsmanship
            </h3>
            <p className="text-muted leading-relaxed mb-6 text-[15px]">
              Weathered barn wood facades, stone pathways winding through the grounds, and a private creek where deer come to drink at dawn. A natural oasis amidst the city where every detail tells a story.
            </p>
            <p className="text-muted leading-relaxed text-[15px]">
              The property features a ceremony lawn, an elegant courtyard with fire pit and string lights, a creek-side garden terrace, and nature trails through the surrounding forest.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Spa Feature Section */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          <AnimatedSection direction="left" className="lg:pr-20 xl:pr-28 order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Wellness</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              Elevated Spa<br />&amp; Wellness
            </h3>
            <p className="text-muted leading-relaxed mb-6 text-[15px]">
              An exceptional on-site spa experience unlike anything else in the area. Our wellness center features a cedar-lined sauna, private massage and treatment rooms, IV therapy services, and a serene soaking tub retreat.
            </p>
            <p className="text-muted leading-relaxed mb-8 text-[15px]">
              Whether you&apos;re preparing for your wedding day, unwinding after a corporate retreat, or simply seeking restoration — our exclusive wellness offerings elevate every visit into something truly exceptional.
            </p>
            <Link href="/experiences" className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-300">
              View Spa Experiences
            </Link>
          </AnimatedSection>
          <AnimatedSection direction="right" className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] max-h-[700px]">
              <Image src="/images/spa-sauna.jpg" alt="ANEW Spa & Sauna" fill className="object-cover" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Cold Plunge */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">New Addition</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal">Cold Plunge Therapy</h3>
            <p className="text-muted text-[15px] leading-relaxed mb-4">
              Our on-site Renu Therapy cold plunge brings clinical-grade cold water immersion to the estate. A handcrafted cedar and hardwood tub with precision temperature control, designed for recovery, stress relief, and mental clarity.
            </p>
            <p className="text-muted text-[15px] leading-relaxed mb-4">
              Pair it with our cedar-lined sauna for a full contrast therapy circuit — alternating between heat and cold to reduce inflammation, boost circulation, and leave you feeling completely reset.
            </p>
            <p className="text-muted text-[15px] leading-relaxed">
              Available to all overnight guests and as an add-on for day events. No appointment needed.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Spaces — horizontal scroll */}
      <section id="spaces" className="py-28 sm:py-36 bg-cream relative overflow-hidden">
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <AnimatedSection className="text-center mb-16">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Exclusive Spaces</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Elegant by Design</h2>
          </AnimatedSection>
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-5 px-6 lg:px-12 min-w-max">
            {spaces.map((space, i) => (
              <AnimatedSection key={space.name} delay={i * 0.08}>
                <div className="w-[340px] sm:w-[400px] group">
                  <div className="relative aspect-[3/4] mb-5 overflow-hidden">
                    <Image src={space.img} alt={space.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase bg-white/90 text-dark px-3 py-1">
                      {space.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-heading text-xl text-dark">{space.name}</h4>
                    <span className="text-[11px] text-muted">{space.capacity}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{space.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width break */}
      <section className="relative h-[50vh] min-h-[350px]">
        <Image src="/images/hallway-barndoors.webp" alt="Interior hallway" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* Seasonal */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Year-Round</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-12">Every Season, Exceptional</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-10 text-left max-w-2xl mx-auto">
            {[
              { name: "Spring", desc: "Wildflowers bloom along the trails, the creek runs full, and mild temperatures create an elegant backdrop for outdoor ceremonies." },
              { name: "Summer", desc: "Long golden evenings and warm breezes — exceptional conditions for al fresco dining and celebrations under the stars." },
              { name: "Autumn", desc: "A tapestry of gold, amber, and crimson. Crisp air and stunning foliage create an elevated, unforgettable setting." },
              { name: "Winter", desc: "Cozy fireside receptions, frost-covered grounds, and the quiet beauty of a natural oasis in winter. Intimate and elegant." },
            ].map((s, i) => (
              <AnimatedSection key={s.name} delay={i * 0.1}>
                <h4 className="font-heading text-xl text-dark mb-2">{s.name}</h4>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 sm:py-36 bg-cream px-6 relative overflow-hidden">
        <CornerAccent position="top-right" />
        <CornerAccent position="bottom-left" />
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <HandDrawnDivider variant="simple" className="mb-6" />
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">FAQ</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Common Questions</h2>
          </AnimatedSection>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
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
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <Image src="/images/garden-flowers.webp" alt="Garden" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <h2 className="font-heading text-4xl sm:text-5xl font-normal mb-6">Experience It For Yourself</h2>
            <p className="text-white/70 text-base mb-8 max-w-md mx-auto">Schedule a private tour and discover this exceptional natural oasis in person.</p>
            <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500">
              Book a Tour
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
