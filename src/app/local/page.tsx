"use client";

import Image from "next/image";
import { Mountain, TreePine, ShoppingBag, Landmark, CircleDot, Waves } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const categories = [
  {
    title: "Hiking & Trails",
    icon: Mountain,
    items: [
      { name: "Mount Si Trail", desc: "Classic 8-mile round trip with stunning summit views. One of the most popular hikes in the state.", link: "https://www.wta.org/go-hiking/hikes/mount-si" },
      { name: "Little Si Trail", desc: "A gentler 5-mile hike perfect for all skill levels, with beautiful forest canopy and open views.", link: "https://www.wta.org/go-hiking/hikes/little-si" },
      { name: "Mt Teneriffe Trail", desc: "A challenging 14-mile trek with panoramic views of the Cascades and surrounding valleys.", link: "https://www.wta.org/go-hiking/hikes/mount-teneriffe" },
      { name: "Rattlesnake Ledge", desc: "Short but rewarding 5-mile hike ending at a dramatic cliff overlook above Rattlesnake Lake.", link: "https://www.wta.org/go-hiking/hikes/rattlesnake-ledge" },
    ],
  },
  {
    title: "Attractions",
    icon: Landmark,
    items: [
      { name: "Snoqualmie Falls", desc: "A breathtaking 268-foot waterfall just 20 minutes away. One of Washington's most iconic landmarks.", link: "https://www.snoqualmiefalls.com" },
      { name: "Northwest Railway Museum", desc: "Step back in time with vintage train rides through the scenic Snoqualmie Valley.", link: "https://www.trainmuseum.org" },
      { name: "North Bend Premium Outlets", desc: "Over 50 designer and name-brand stores nestled against a stunning mountain backdrop.", link: "https://www.premiumoutlets.com/outlet/north-bend" },
    ],
  },
  {
    title: "Golf",
    icon: CircleDot,
    items: [
      { name: "TPC Snoqualmie Ridge", desc: "A championship course designed by Jack Nicklaus, consistently rated among the best in the Pacific Northwest.", link: "https://www.tpc.com/snoqualmie-ridge" },
      { name: "Mt Si Golf Course", desc: "A scenic 18-hole public course with mountain views and a relaxed, welcoming atmosphere.", link: "https://www.mtsigolf.com" },
    ],
  },
  {
    title: "Parks & Nature",
    icon: TreePine,
    items: [
      { name: "Saint Edward State Park", desc: "A 316-acre park on the shores of Lake Washington featuring trails, a historic seminary, and a swimming pool.", link: "https://parks.wa.gov/find-parks/state-parks/saint-edward-state-park" },
      { name: "Bridle Trails State Park", desc: "28 miles of forested trails popular for walking, running, and horseback riding.", link: "https://parks.wa.gov/find-parks/state-parks/bridle-trails-state-park" },
      { name: "Burke-Gilman Trail", desc: "A paved multi-use trail stretching over 27 miles from Seattle to Kenmore and beyond.", link: "https://www.seattle.gov/parks/allparks/burke-gilman-trail" },
    ],
  },
  {
    title: "On the Water",
    icon: Waves,
    items: [
      { name: "Log Boom Park", desc: "A waterfront park in Kenmore with kayak launches, picnic areas, and views of Lake Washington.", link: "https://www.kenmorewa.gov/logboompark" },
      { name: "Kenmore Air Harbor", desc: "Watch seaplanes take off and land, or book a scenic flight over the Puget Sound and San Juan Islands.", link: "https://www.kenmoreair.com" },
    ],
  },
  {
    title: "Shopping & Dining",
    icon: ShoppingBag,
    items: [
      { name: "Bothell Country Village", desc: "A charming collection of local shops, boutiques, and eateries with a village feel.", link: "https://www.countryvillagebothell.com" },
      { name: "Downtown Kenmore", desc: "Local restaurants, cafes, and shops within minutes of the estate.", link: "https://www.kenmorewa.gov" },
      { name: "Woodinville Wine Country", desc: "Over 100 wineries and tasting rooms just a short drive away. Perfect for group outings.", link: "https://woodinvillewinecountry.com" },
    ],
  },
];

export default function LocalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/forest-view.jpg" alt="Local area" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Explore the Area</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Things To Do</h1>
            <p className="text-white/60 mt-4 max-w-lg mx-auto text-sm">The Pacific Northwest at your doorstep — from mountain trails to wine country, all within reach of ANEW.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <div className="divider mx-auto mb-8" />
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-6 leading-tight">
              More Than a Venue —<br />A Destination
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
              Located in Kenmore, WA — just minutes from Seattle — ANEW is surrounded by world-class hiking, stunning waterfalls, championship golf, and wine country. Your guests will never run out of things to explore.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-28 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          {categories.map((cat, ci) => (
            <AnimatedSection key={cat.title} delay={ci * 0.05}>
              <div className="flex items-center gap-3 mb-8">
                <cat.icon className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-2xl text-dark">{cat.title}</h3>
              </div>
              <div className="space-y-0">
                {cat.items.map((item, i) => (
                  <a
                    key={item.name}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block py-5 border-b border-border hover:bg-cream/50 transition-colors -mx-4 px-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-dark font-medium group-hover:text-accent transition-colors">{item.name}</h4>
                        <p className="text-sm text-muted leading-relaxed mt-1">{item.desc}</p>
                      </div>
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted group-hover:text-accent transition-colors shrink-0 mt-1">
                        Visit →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/creek.jpg" alt="Nature" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <h2 className="font-heading text-4xl sm:text-5xl font-normal mb-4">Plan Your Retreat</h2>
            <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">Combine the beauty of the estate with everything the Pacific Northwest has to offer.</p>
            <a href="/booking" className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500">
              Book Your Stay
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
