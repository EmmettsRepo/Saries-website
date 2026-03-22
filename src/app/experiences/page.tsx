"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import HandDrawnDivider from "@/components/HandDrawnDivider";
import CornerAccent from "@/components/CornerAccent";


const experiences = [
  {
    title: "Woodland Wellness Retreat",
    tagline: "Restore",
    desc: "A curated day of guided meditation, forest bathing, yoga among the trees, and restorative bodywork. Designed for groups or individuals seeking stillness and renewal.",
    features: ["Guided forest meditation", "Outdoor yoga session", "Aromatherapy & sound healing", "Farm-to-table wellness lunch"],
    price: "From $250/person",
    image: "/images/creek.jpg",
  },
  {
    title: "Private Chef Experience",
    tagline: "Savor",
    desc: "Book one of our resident chefs for an intimate, multi-course dinner crafted from locally sourced ingredients. Dine fireside, in the Grand Hall, or under the stars.",
    features: ["Choice of 4 resident chefs", "Seasonal tasting menu", "Wine pairing available", "Indoor or outdoor seating"],
    price: "From $125/person",
    image: "/images/catering-spread.jpg",
  },
  {
    title: "Nature & Trail Excursion",
    tagline: "Explore",
    desc: "A guided half-day excursion through the best trails and viewpoints near ANEW. From Rattlesnake Ledge to Snoqualmie Falls, experience the Pacific Northwest with a local guide.",
    features: ["Professional local guide", "Trail snacks & hydration", "Photography stops", "Flexible difficulty levels"],
    price: "From $95/person",
    image: "/images/forest-approach.jpg",
  },
  {
    title: "Spa & Renewal Day",
    tagline: "Unwind",
    desc: "A full day of pampering featuring massage, facials, soaking, and relaxation in our serene woodland setting. Perfect as a bridal party treat or personal escape.",
    features: ["90-min massage treatment", "Custom facial", "Access to soaking tub", "Herbal tea & light bites"],
    price: "From $350/person",
    image: "/images/spa-sauna.jpg",
  },
  {
    title: "Wine Country Tour",
    tagline: "Discover",
    desc: "Woodinville Wine Country is just minutes away — home to over 100 wineries. We'll arrange private tastings, transportation, and a curated itinerary for your group.",
    features: ["3-4 winery visits", "Private tastings", "Shuttle transportation", "Charcuterie included"],
    price: "From $175/person",
    image: "/images/kitchen-sink.webp",
  },
  {
    title: "Fireside Evening",
    tagline: "Gather",
    desc: "As the sun sets, gather around the stone fire pit for s'mores, storytelling, and stargazing. Add live acoustic music or a whiskey tasting for an elevated evening.",
    features: ["Fire pit & blankets", "S'mores bar", "Optional live music", "Whiskey or wine tasting add-on"],
    price: "From $45/person",
    image: "/images/outdoor-firepit-cabin.webp",
  },
];


export default function ExperiencesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <Image src="/images/deer-garden.jpg" alt="Experiences" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Curated & Unforgettable</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Experiences</h1>
            <p className="text-white/60 mt-4 max-w-lg mx-auto text-sm">
              More than an event venue — ANEW offers immersive experiences designed to restore, inspire, and connect.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <HandDrawnDivider variant="botanical" className="mb-8" />
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-6 leading-tight">
              Every Moment,<br />Intentionally Crafted
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
              Whether you&apos;re here for a wedding, a corporate retreat, or a personal escape — we offer experiences that transform a visit into something you carry with you long after you leave.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Experiences — Alternating two-column */}
      <section className="pb-20 px-6">
        <div className="max-w-[1400px] mx-auto space-y-28">
          {experiences.map((exp, i) => (
            <AnimatedSection key={exp.title}>
              <div className={`grid lg:grid-cols-2 gap-6 lg:gap-0 items-center`}>
                <div className={`relative aspect-[4/5] lg:aspect-[3/4] max-h-[600px] zoom-container ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Image src={exp.image} alt={exp.title} fill className="object-cover" />
                </div>
                <div className={`${i % 2 === 1 ? "lg:order-1 lg:pr-20 xl:pr-28" : "lg:pl-20 xl:pl-28"}`}>
                  <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">{exp.tagline}</p>
                  <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-4 font-normal leading-tight">{exp.title}</h3>
                  <p className="text-muted leading-relaxed mb-6 text-[15px]">{exp.desc}</p>
                  <div className="space-y-2 mb-6">
                    {exp.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        <span className="text-sm text-muted">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-heading text-lg text-dark">{exp.price}</span>
                    <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors">
                      Inquire
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Book Now CTA */}
      <section className="py-28 bg-cream px-6 relative overflow-hidden">
        <CornerAccent position="top-left" />
        <CornerAccent position="bottom-right" />
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection>
            <HandDrawnDivider variant="flourish" className="mb-6" />
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Ready?</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-6">Book Your Experience</h2>
            <p className="text-muted text-base leading-relaxed max-w-lg mx-auto mb-10">
              Mix and match any of our experiences to create the perfect visit. We&apos;ll handle every detail.
            </p>
            <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-10 py-4 hover:bg-accent transition-colors duration-500">
              Book Now
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/tall-cedars.jpg" alt="Forest" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <h2 className="font-heading text-4xl sm:text-5xl font-normal mb-4">Begin Anew</h2>
            <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">Where strong foundations begin.</p>
            <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500">
              Plan Your Experience
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
