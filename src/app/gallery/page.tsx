"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

type Category = "All" | "Exterior" | "Interior" | "Grounds" | "Dining";

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

const images: GalleryImage[] = [
  { src: "/images/exterior-hero.webp", alt: "Estate with fire pit and lawn", category: "Exterior" },
  { src: "/images/hero-exterior.jpg", alt: "Estate front entrance", category: "Exterior" },
  { src: "/images/exterior-wide.jpg", alt: "Wide view with cedars", category: "Exterior" },
  { src: "/images/exterior-courtyard-new.jpg", alt: "Courtyard fire pit", category: "Exterior" },
  { src: "/images/courtyard-lounge.jpg", alt: "Courtyard lounge", category: "Exterior" },
  { src: "/images/exterior-ferns.jpg", alt: "Through the ferns", category: "Exterior" },
  { src: "/images/exterior-side.webp", alt: "Side angle with stone steps", category: "Exterior" },
  { src: "/images/exterior-creek-rocks.webp", alt: "Creek bed exterior", category: "Exterior" },
  { src: "/images/driveway-approach.webp", alt: "Driveway approach", category: "Exterior" },
  { src: "/images/outdoor-firepit-cabin.webp", alt: "Fire pit and cabin", category: "Exterior" },
  { src: "/images/interior-living.jpg", alt: "Grand hall chandelier", category: "Interior" },
  { src: "/images/interior-wide.jpg", alt: "Living space", category: "Interior" },
  { src: "/images/interior-living-wide.webp", alt: "Open living wide angle", category: "Interior" },
  { src: "/images/interior-openplan.webp", alt: "Open plan interior", category: "Interior" },
  { src: "/images/master-bedroom.jpg", alt: "Master suite", category: "Interior" },
  { src: "/images/bedroom-master.webp", alt: "Queen suite", category: "Interior" },
  { src: "/images/bunkbeds.jpg", alt: "Bunk room", category: "Interior" },
  { src: "/images/bedroom-bunk.webp", alt: "Bunk room loft", category: "Interior" },
  { src: "/images/bathroom-soaker.webp", alt: "Spa bathroom", category: "Interior" },
  { src: "/images/bathroom-shower.webp", alt: "Rain shower suite", category: "Interior" },
  { src: "/images/bathroom-farmhouse.webp", alt: "Farmhouse bathroom", category: "Interior" },
  { src: "/images/hallway-barndoors.webp", alt: "Gallery hallway", category: "Interior" },
  { src: "/images/kitchen-sink.webp", alt: "Kitchen farmhouse sink", category: "Interior" },
  { src: "/images/forest-view.jpg", alt: "Forest view", category: "Grounds" },
  { src: "/images/forest-approach.jpg", alt: "Forest approach", category: "Grounds" },
  { src: "/images/creek.jpg", alt: "Private creek", category: "Grounds" },
  { src: "/images/outdoor-seating.jpg", alt: "Garden seating", category: "Grounds" },
  { src: "/images/deer-garden.jpg", alt: "Deer in the garden", category: "Grounds" },
  { src: "/images/deer-woods.jpg", alt: "Deer among the trees", category: "Grounds" },
  { src: "/images/tall-cedars.jpg", alt: "Ancient cedars", category: "Grounds" },
  { src: "/images/garden-cabin.jpg", alt: "Garden cabin", category: "Grounds" },
  { src: "/images/garden-flowers.webp", alt: "Garden with flowers", category: "Grounds" },
  { src: "/images/catering-salmon.jpg", alt: "Fresh salmon", category: "Dining" },
  { src: "/images/catering-greens.jpg", alt: "Seasonal greens", category: "Dining" },
  { src: "/images/catering-spread.jpg", alt: "Full spread", category: "Dining" },
  { src: "/images/event-hall.jpg", alt: "Event pavilion", category: "Interior" },
  { src: "/images/cabin-entrance.jpg", alt: "Studio cabin entrance", category: "Exterior" },
  { src: "/images/bathroom-curtain.jpg", alt: "Bathroom with curtain", category: "Interior" },
];

const categories: Category[] = ["All", "Exterior", "Interior", "Grounds", "Dining"];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = activeFilter === "All" ? images : images.filter((img) => img.category === activeFilter);

  const lightboxRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const nextImage = useCallback(() => { if (lightbox !== null) setLightbox((lightbox + 1) % filtered.length); }, [lightbox, filtered.length]);
  const prevImage = useCallback(() => { if (lightbox !== null) setLightbox((lightbox - 1 + filtered.length) % filtered.length); }, [lightbox, filtered.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "ArrowLeft":
          prevImage();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, closeLightbox, nextImage, prevImage]);

  // Focus trap: save previous focus, focus lightbox on open, restore on close
  useEffect(() => {
    if (lightbox !== null) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Wait for the lightbox to render before focusing
      requestAnimationFrame(() => {
        if (lightboxRef.current) {
          const firstFocusable = lightboxRef.current.querySelector<HTMLElement>("button");
          if (firstFocusable) firstFocusable.focus();
        }
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [lightbox]);

  // Focus trap: keep Tab inside lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !lightboxRef.current) return;
      const focusable = lightboxRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex]");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [lightbox]);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/deer-woods.jpg" alt="Gallery" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Explore</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Gallery</h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[11px] tracking-[0.3em] uppercase transition-all duration-300 pb-1 ${
                  activeFilter === cat
                    ? "text-dark border-b border-dark"
                    : "text-muted hover:text-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div
                  key={img.src}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.02 }}
                >
                  <button
                    onClick={() => setLightbox(i)}
                    className="relative aspect-square w-full block overflow-hidden group"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Image lightbox: ${filtered[lightbox].alt}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} aria-label="Close lightbox" className="absolute top-6 right-6 text-white/50 hover:text-white z-10">
              <X className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous image" className="absolute left-4 sm:left-8 text-white/50 hover:text-white z-10">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next image" className="absolute right-4 sm:right-8 text-white/50 hover:text-white z-10">
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="relative w-full max-w-5xl h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
              <Image src={filtered[lightbox].src} alt={filtered[lightbox].alt} fill className="object-contain" />
            </div>
            <p className="absolute bottom-6 text-white/40 text-xs tracking-wide">
              {filtered[lightbox].alt} &middot; {lightbox + 1} / {filtered.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <section className="py-20 px-6 bg-cream">
        <div className="text-center max-w-lg mx-auto">
          <AnimatedSection>
            <h2 className="font-heading text-3xl text-dark mb-4 font-normal">Ready to See It in Person?</h2>
            <p className="text-muted text-sm mb-8">Photos only tell half the story.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
                Plan Your Event
              </Link>
              <Link href="/#contact" className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors">
                Schedule a Tour
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
