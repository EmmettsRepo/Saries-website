"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Tilt3D from "@/components/Tilt3D";
import HandDrawnDivider from "@/components/HandDrawnDivider";
import CornerAccent from "@/components/CornerAccent";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useBotGuard } from "@/components/BotGuard";

const FUNCTIONS_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
  "https://us-central1-bakkers-website-847ba.cloudfunctions.net";

export default function HomePage() {
  const router = useRouter();
  const [tourForm, setTourForm] = useState({ firstName: "", lastName: "", email: "", phone: "", date: "", time: "", message: "" });
  const [tourSubmitted, setTourSubmitted] = useState(false);
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourError, setTourError] = useState<string | null>(null);
  const tourBot = useBotGuard();
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourError(null);
    if (!tourForm.firstName || !tourForm.email || !tourForm.date) {
      setTourError("Name, email, and date are required.");
      return;
    }
    if (!tourBot.verified || tourBot.isBot()) {
      setTourError("Please verify you're not a robot.");
      return;
    }
    setTourSubmitting(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/submitTour`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tourForm,
          honeypot: tourBot.honeypotRef.current || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      setTourSubmitted(true);
    } catch (err) {
      console.error(err);
      setTourError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setTourSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden ken-burns">
        <Image
          src="/images/exterior-hero.webp"
          alt="ANEW"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 text-center text-white px-6 max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="text-[10px] sm:text-[12px] tracking-[0.3em] sm:tracking-[0.6em] uppercase mb-8 text-white/60"
          >
            Pacific Northwest Retreat &amp; Spa
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.6 }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[9rem] leading-[0.95] mb-8 font-normal tracking-tight"
          >
            Where Strong
            <br />
            Foundations Begin
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-white/50 text-sm sm:text-base mb-2 max-w-lg mx-auto leading-relaxed"
          >
            Retreats, weddings, wellness, and gatherings — minutes from Seattle.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-white/40 text-xs tracking-[0.2em] uppercase mt-2 mb-8"
          >
            Starting at $5,500 / night
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/booking"
              className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500"
            >
              Plan Your Celebration
            </Link>
            <Link
              href="/venue"
              className="text-[11px] tracking-[0.3em] uppercase text-white/70 hover:text-white transition-colors duration-300"
            >
              Explore the Estate
            </Link>
            <Link
              href="/#contact"
              className="text-[11px] tracking-[0.3em] uppercase text-white/70 hover:text-white transition-colors duration-300"
            >
              Schedule a Tour
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </motion.div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <HandDrawnDivider variant="botanical" className="mb-10" />
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] leading-[1.35] text-dark mb-10 font-normal">
              ANEW is a 5,800 sq ft retreat and spa on two woodland acres with a babbling brook that runs throughout the private estate — a place for private stays, weddings, wellness retreats, corporate escapes, and celebrations.
            </h2>
            <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-3 text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-muted">
              <span>7 bedrooms</span>
              <span className="text-accent">·</span>
              <span>White sandy beach</span>
              <span className="text-accent">·</span>
              <span>Private stream</span>
              <span className="text-accent">·</span>
              <span>Relaxing spa</span>
              <span className="text-accent">·</span>
              <span>Wellness retreats</span>
              <span className="text-accent">·</span>
              <span>Immersions</span>
              <span className="text-accent">·</span>
              <span>Thermal pools</span>
              <span className="text-accent">·</span>
              <span>Wet &amp; dry sauna</span>
              <span className="text-accent">·</span>
              <span>Elevated gym</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TWO-COL: Image Left / Text Right ===== */}
      <section className="px-6 pb-32 sm:pb-44">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          <AnimatedSection direction="left">
            <Tilt3D className="relative aspect-[4/5] lg:aspect-[3/4] max-h-[700px] overflow-hidden">
              <Image
                src="/images/interior-living-wide.webp"
                alt="Grand living space"
                fill
                className="object-cover"
              />
            </Tilt3D>
          </AnimatedSection>
          <AnimatedSection direction="right" className="lg:pl-20 xl:pl-28">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">The Estate</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              Rustic Grandeur,<br />Modern Comfort
            </h3>
            <p className="text-muted leading-relaxed mb-6 text-[15px]">
              Exposed timber beams, a hand-forged iron chandelier, and floor-to-ceiling windows that frame the forest. The Grand Hall seats many for a dinner you&apos;ll never forget — or opens wide for dancing beneath the stars.
            </p>
            <p className="text-muted leading-relaxed mb-8 text-[15px]">
              Every corner of ANEW tells a story through weathered barn wood, forged iron, and the quiet presence of old-growth timber.
            </p>
            <Link
              href="/venue"
              className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
            >
              Explore Spaces
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== FULL-WIDTH IMAGE BREAK ===== */}
      <section className="relative h-[60vh] min-h-[400px] ken-burns overflow-hidden">
        <Image
          src="/images/tall-cedars.jpg"
          alt="Ancient cedars"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedSection>
            <p className="text-white font-heading text-3xl sm:text-4xl md:text-5xl text-center font-normal leading-tight px-6 max-w-3xl">
              Experience the Beating Heart<br className="hidden sm:block" /> of the Northwest
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TWO-COL: Text Left / Image Right ===== */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          <AnimatedSection direction="left" className="lg:pr-20 xl:pr-28 order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Gather</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              Celebrations<br />Under the Canopy
            </h3>
            <p className="text-muted leading-relaxed mb-6 text-[15px]">
              From private stays to boutique weddings on the ceremony lawn, white sandy beach, in the forest, to intimate dinners by the copper fire bowl, ANEW adapts to your vision. String lights drape the courtyard, the stream provides a natural soundtrack, and deer wander the grounds at dusk.
            </p>
            <p className="text-muted leading-relaxed mb-8 text-[15px]">
              Weddings, elopements, vow renewals, corporate retreats, birthday celebrations, graduation parties, 4th of July parties, anniversaries, baby showers, baptisms, girls spa getaways, wellness retreats, and private dinners — every gathering finds its perfect setting here.
            </p>
            <Link
              href="/booking"
              className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
            >
              Plan Your Event
            </Link>
          </AnimatedSection>
          <AnimatedSection direction="right" className="order-1 lg:order-2">
            <Tilt3D className="relative aspect-[4/5] lg:aspect-[3/4] max-h-[700px] overflow-hidden">
              <Image
                src="/images/outdoor-firepit-cabin.webp"
                alt="Outdoor gathering space"
                fill
                className="object-cover"
              />
            </Tilt3D>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== ROOMS SLIDER ===== */}
      <section id="events" className="py-28 sm:py-36 bg-cream relative overflow-hidden">
        <CornerAccent position="top-right" />
        <CornerAccent position="bottom-left" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <AnimatedSection className="text-center mb-16">
            <HandDrawnDivider variant="simple" className="mb-6" />
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Stay</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] text-dark font-normal">
              Welcome to Your Retreat
            </h2>
          </AnimatedSection>
        </div>
        <div className="px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { img: "/images/bedroom-garden.webp", name: "Garden Suite", desc: "King bed with French doors opening to the garden patio and a private en-suite rain shower", position: "calc(100% + 50px) center" },
              { img: "/images/master-bedroom.jpg", name: "Master Suite", desc: "Reclaimed king bed, vaulted beam ceiling, and warm bedside lighting" },
              { img: "/images/bunkbeds.jpg", name: "Bunk Room", desc: "Custom timber bunk beds with ladder, reclaimed wood throughout, and beautiful garden views" },
              { img: "/images/bedroom-master.webp", name: "Queen Suite", desc: "Rope-suspended queen bed that swings, antique chandelier, and vaulted ceilings" },
              { img: "/images/bedroom-hearth.webp", name: "Guest Cottage", desc: "Private guest cottage with a queen bed and three twins, exposed beams, a wood-burning stove, full kitchen, and pebbled rain shower" },
              { img: "/images/bathroom-soaker.webp", name: "Private Bath", desc: "Private soaking bath with exposed beams, wet sauna, and garden views" },
              { img: "/images/bathroom-shower.webp", name: "Rain Shower Suite", desc: "Glass walk-in shower with natural stone and soaking tub, complete with a relaxing wet sauna" },
              { img: "/images/interior-living-wide.webp", name: "Open Living", desc: "Kitchen, dining, and living area flow beneath timber beams with a barn wood coffered ceiling" },
              { img: "/images/hallway-barndoors.webp", name: "Gallery Hallway", desc: "Glass railings, sliding barn doors, and gorgeous woodland views at every turn" },
            ].map((room, i) => (
              <AnimatedSection key={room.name} delay={i * 0.08}>
                <div className="w-full group cursor-pointer card-3d">
                  <div className="relative aspect-[3/4] mb-5 overflow-hidden">
                    <Image
                      src={room.img}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={"position" in room ? { objectPosition: (room as { position: string }).position } : undefined}
                    />
                  </div>
                  <h4 className="font-heading text-xl text-dark mb-1">{room.name}</h4>
                  <p className="text-sm text-muted leading-relaxed">{room.desc}</p>
                  <div className="mt-4 flex gap-4">
                    <Link href="/venue" className="text-[10px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-0.5 hover:text-accent hover:border-accent transition-colors">
                      Explore
                    </Link>
                    <Link href="/booking" className="text-[10px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-0.5 hover:text-accent hover:border-accent transition-colors">
                      Book
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FULL-WIDTH IMAGE: DINING ===== */}
      <section className="relative h-[50vh] min-h-[350px] ken-burns overflow-hidden">
        <Image
          src="/images/catering-spread.jpg"
          alt="Farm to table dining"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedSection>
            <div className="text-center text-white px-6">
              <p className="text-[11px] tracking-[0.4em] uppercase mb-4 text-white/70">A Taste of ANEW</p>
              <p className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal">
                Farm-to-Table Dining
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TWO-COL: Dining ===== */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-6 lg:gap-0 items-center">
          <AnimatedSection direction="left">
            <Tilt3D className="relative aspect-[4/5] max-h-[600px] overflow-hidden">
              <Image
                src="/images/kitchen-sink.webp"
                alt="Chef's kitchen"
                fill
                className="object-cover"
              />
            </Tilt3D>
          </AnimatedSection>
          <AnimatedSection direction="right" className="lg:pl-20 xl:pl-28">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Dine</p>
            <h3 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              From Our Kitchen<br />to Your Table
            </h3>
            <p className="text-muted leading-relaxed mb-6 text-[15px]">
              The estate&apos;s commercial-grade kitchen features a farmhouse sink, copper fixtures, and direct courtyard access — ready for your private chef or preferred caterer.
            </p>
            <p className="text-muted leading-relaxed mb-8 text-[15px]">
              Seasonal, locally sourced menus featuring fresh salmon, garden vegetables, and artisan preparations. From intimate plated dinners to relaxed family-style feasts under the stars. Allergy-specific menus available on request, alongside fresh-pressed juicing and hands-on cooking classes.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/experiences"
                className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-6 py-3 hover:bg-accent transition-colors duration-500"
              >
                Book a Chef
              </Link>
              <Link
                href="/booking"
                className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
              >
                Learn More
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== THREE-COL EVENT CARDS ===== */}
      <section className="py-28 sm:py-36 bg-cream px-6 relative overflow-hidden">
        <CornerAccent position="top-left" variant="watercolor" />
        <CornerAccent position="top-right" variant="watercolor" />
        <CornerAccent position="bottom-left" />
        <CornerAccent position="bottom-right" />
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="text-center mb-16">
            <HandDrawnDivider variant="flourish" className="mb-6" />
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Group & Gather</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] text-dark font-normal">
              Your Occasion, Our Setting
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { img: "/images/exterior-hero.webp", title: "Weddings", desc: "Ceremony lawns flanked by towering trees, fire copper bowl receptions under string lights, and 13 beds for the wedding party." },
              { img: "/images/interior-living-wide.webp", title: "Retreats", desc: "Inspire your team in a setting that sparks creativity. The Grand Hall, breakout spaces, and nature trails await." },
              { img: "/images/outdoor-seating.jpg", title: "Celebrations", desc: "Boutique weddings, vow renewals, anniversaries, birthdays, graduation parties, 4th of July parties, baby showers, girls spa getaways, baptisms, private dinners, s'mores by the fire, etc. — every occasion finds its setting." },
            ].map((card, i) => (
              <AnimatedSection key={card.title} delay={i * 0.12}>
                <div className="group cursor-pointer depth-float">
                  <div className="relative aspect-[4/3] mb-6 overflow-hidden zoom-container">
                    <Image
                      src={card.img}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-heading text-2xl text-dark mb-3">{card.title}</h4>
                  <p className="text-muted text-sm leading-relaxed mb-4">{card.desc}</p>
                  <Link
                    href="/booking"
                    className="text-[10px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-0.5 hover:text-accent hover:border-accent transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AVAILABILITY ===== */}
      <section className="py-28 sm:py-36 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Availability</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-4">
              Find Your Date
            </h2>
            <p className="text-muted text-sm">Click a date to begin planning your event</p>
          </AnimatedSection>
          <AnimatedSection>
            <AvailabilityCalendar
              onSelectDate={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const d = String(date.getDate()).padStart(2, "0");
                router.push(`/booking?date=${y}-${m}-${d}`);
              }}
            />
          </AnimatedSection>
          <AnimatedSection className="text-center mt-14">
            <p className="text-muted text-[15px] leading-relaxed max-w-2xl mx-auto">
              ANEW Retreat &amp; Spa is a distinctive retreat destination in the Pacific Northwest — a property that guests return to, that retreat leaders cultivate programs around, and that the wellness travel community recognizes as something genuinely rare.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== GALLERY — Editorial masonry layout ===== */}
      <section className="py-36 sm:py-48 px-6">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="text-center mb-20">
            <HandDrawnDivider variant="ivy" className="mb-8" />
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Gallery</p>
            <h2 className="font-heading text-4xl sm:text-5xl text-dark font-normal">
              A Glimpse of ANEW
            </h2>
          </AnimatedSection>

          {/* Masonry-style editorial grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
            <AnimatedSection delay={0} className="md:col-span-2 md:row-span-2">
              <Link href="/gallery" className="relative block h-full overflow-hidden group zoom-container">
                <Image src="/images/exterior-wide.jpg" alt="Estate wide view" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={0.08}>
              <Link href="/gallery" className="relative block h-full overflow-hidden group zoom-container">
                <Image src="/images/master-bedroom.jpg" alt="Master suite" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={0.12}>
              <Link href="/gallery" className="relative block h-full overflow-hidden group zoom-container">
                <Image src="/images/creek.jpg" alt="Private stream" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={0.16}>
              <Link href="/gallery" className="relative block h-full overflow-hidden group zoom-container">
                <Image src="/images/bathroom-soaker.webp" alt="Spa bath" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="md:col-span-2">
              <Link href="/gallery" className="relative block h-full overflow-hidden group zoom-container">
                <Image src="/images/deer-garden.jpg" alt="Deer in the garden" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
              </Link>
            </AnimatedSection>
          </div>

          <AnimatedSection className="text-center mt-14">
            <Link
              href="/gallery"
              className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-300"
            >
              View Full Gallery
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative h-[70vh] min-h-[450px] flex items-center justify-center ken-burns overflow-hidden">
        <Image
          src="/images/forest-view.jpg"
          alt="ANEW"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6 max-w-3xl">
          <AnimatedSection>
            <HandDrawnDivider variant="flourish" color="rgba(255,255,255,0.35)" className="mb-8" />
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl mb-6 font-normal leading-tight">
              Begin Your<br />ANEW Story
            </h2>
            <p className="text-white/70 text-base mb-10 max-w-md mx-auto">
              Let us help you craft an event as extraordinary as the setting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="text-[11px] tracking-[0.3em] uppercase border border-white text-white px-8 py-3.5 hover:bg-white hover:text-dark transition-all duration-500"
              >
                Plan Your Celebration
              </Link>
              <Link
                href="/#contact"
                className="text-[11px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-300"
              >
                Schedule a Tour
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-28 sm:py-36 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <AnimatedSection direction="left">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Visit</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark mb-6 font-normal leading-tight">
              Schedule a Tour
            </h2>
            <p className="text-muted leading-relaxed mb-8 text-[15px] max-w-md">
              Nothing compares to experiencing ANEW in person. Walk the grounds, feel the atmosphere, and envision your celebration.
            </p>
            <div className="space-y-3 text-muted text-sm">
              <p>Kenmore, WA</p>
              <p><a href="mailto:hello@anewretreatandspa.com" className="hover:text-accent transition-colors">hello@anewretreatandspa.com</a></p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            {tourSubmitted ? (
              <div className="text-center py-12">
                <p className="font-heading text-2xl text-dark mb-3">Tour Request Received</p>
                <p className="text-muted text-sm">We&apos;ll confirm your tour by email within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleTourSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="text" placeholder="First Name *" required value={tourForm.firstName} onChange={(e) => setTourForm({ ...tourForm, firstName: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors" />
                  <input type="text" placeholder="Last Name" value={tourForm.lastName} onChange={(e) => setTourForm({ ...tourForm, lastName: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors" />
                </div>
                <input type="email" placeholder="Email *" required value={tourForm.email} onChange={(e) => setTourForm({ ...tourForm, email: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors" />
                <input type="tel" placeholder="Phone" value={tourForm.phone} onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors" />
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="tourDate" className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">Preferred Date *</label>
                    <input id="tourDate" type="date" required min={new Date().toISOString().split('T')[0]} value={tourForm.date} onChange={(e) => setTourForm({ ...tourForm, date: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tourTime" className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">Preferred Time</label>
                    <input id="tourTime" type="time" value={tourForm.time} onChange={(e) => setTourForm({ ...tourForm, time: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors" />
                  </div>
                </div>
                <textarea placeholder="Anything we should know? (optional)" rows={3} value={tourForm.message} onChange={(e) => setTourForm({ ...tourForm, message: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none" />
                {/* Bot guard */}
                <div className="flex items-center gap-3 py-3 px-4 border border-border bg-cream/30">
                  <button type="button" onClick={() => tourBot.setVerified(true)}
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${tourBot.verified ? "border-green-500 bg-green-500" : "border-border hover:border-dark"}`}>
                    {tourBot.verified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className="text-sm text-muted">{tourBot.verified ? "Verified" : "I'm not a robot"}</span>
                </div>
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" onChange={(e) => { tourBot.honeypotRef.current = e.target.value; }} />
                </div>
                {tourError && <p className="text-red-500 text-xs">{tourError}</p>}
                <button type="submit" disabled={tourSubmitting} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-10 py-3.5 hover:bg-accent transition-colors duration-500 mt-4 disabled:opacity-50">
                  {tourSubmitting ? "Sending..." : "Request a Tour"}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* ===== STICKY MOBILE CTA BAR ===== */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-500 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-dark/95 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-heading">From $5,500/night</p>
            <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase">Limited dates available</p>
          </div>
          <Link href="/booking" className="text-[10px] tracking-[0.25em] uppercase bg-white text-dark px-5 py-2.5 hover:bg-accent hover:text-white transition-colors">
            Book Now
          </Link>
        </div>
      </div>
    </>
  );
}
