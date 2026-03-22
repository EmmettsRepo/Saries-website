"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import CornerAccent from "@/components/CornerAccent";
import { Leaf, Star, ShoppingBag } from "lucide-react";

type Category = "All" | "Teas & Treats" | "Spa & Self Care" | "Bedding & Silk" | "Apparel & Lounge" | "Home & Wellness";

interface Product {
  name: string;
  price: string;
  category: Category;
  tag?: string;
  desc?: string;
  featured?: boolean;
}

const products: Product[] = [
  // Teas & Treats
  { name: "Signature Organic Rose Hip Nettle Tea", price: "$20", category: "Teas & Treats", tag: "Signature ANEW Item", desc: "Locally sourced rose hip and nettle with strawberry" },
  { name: "Local Dark Chocolate Truffles", price: "$48", category: "Teas & Treats", tag: "Locally Sourced" },
  { name: "Local Double Chocolate Figs", price: "$64", category: "Teas & Treats", tag: "Locally Sourced" },
  { name: "Dark & Milk Chocolate Hearts", price: "$28", category: "Teas & Treats", tag: "Locally Sourced" },
  { name: "Chocolate Chip Cookie", price: "$10", category: "Teas & Treats", tag: "Locally Sourced", desc: "Oversized artisan cookie" },
  { name: "Glass Mug with Strainer & Lid", price: "$40", category: "Teas & Treats", tag: "Signature ANEW Item" },

  // Spa & Self Care
  { name: "Honey Rose Hip Face Cleanser", price: "$48", category: "Spa & Self Care", tag: "Spa Favorite", featured: true },
  { name: "Goat Milk Oatmeal Exfoliant Soap", price: "$18", category: "Spa & Self Care", tag: "Locally Sourced", desc: "Organic soap on a rope" },
  { name: "Exfoliating Brush", price: "$25", category: "Spa & Self Care", tag: "Signature ANEW Item" },
  { name: "Lavender Sachet", price: "$32", category: "Spa & Self Care", tag: "Organic" },
  { name: "Red Cedar & Lavender Silk Pillows", price: "$75", category: "Spa & Self Care", tag: "Organic" },
  { name: "Raw Organic Selenite Votive", price: "$80", category: "Spa & Self Care" },
  { name: "Raw Organic Selenite Wine Coasters", price: "Price Upon Request", category: "Spa & Self Care", tag: "Limited Selection" },

  // Bedding & Silk
  { name: "100% Silk Sleep Mask", price: "$48", category: "Bedding & Silk", tag: "Spa Favorite", featured: true },
  { name: "100% Silk Hair Cover", price: "$105", category: "Bedding & Silk" },
  { name: "100% Silk Pillow Cover", price: "$70", category: "Bedding & Silk" },
  { name: "Cashmere Blanket", price: "$780", category: "Bedding & Silk", tag: "Limited Selection", featured: true },
  { name: "Baby Alpaca Blanket", price: "$640", category: "Bedding & Silk", tag: "Limited Selection", featured: true },
  { name: "Natural Sheepskin Throw — 4×6", price: "$280", category: "Bedding & Silk" },
  { name: "Natural Sheepskin Throw — 2×3", price: "$180", category: "Bedding & Silk" },

  // Apparel & Lounge
  { name: "Cloud Loom Organic Spa Bathrobe", price: "$200", category: "Apparel & Lounge", tag: "Organic", desc: "Unisex, lightweight cloud-loom weave" },
  { name: "Cashmere Bathrobe", price: "$400", category: "Apparel & Lounge", tag: "Limited Selection" },
  { name: "Cork Slippers", price: "$85", category: "Apparel & Lounge", tag: "Organic" },
  { name: "Lounge Slippers", price: "$70", category: "Apparel & Lounge" },
  { name: "Organic Cotton T-Shirt", price: "$18", category: "Apparel & Lounge", tag: "Signature ANEW Item", desc: "Soft organic cotton, unisex fit" },

  // Home & Wellness
  { name: "Organic Cork Yoga Mat", price: "$65", category: "Home & Wellness", tag: "Organic", featured: true },
  { name: "Clear Water Bottle", price: "Price Upon Request", category: "Home & Wellness", tag: "Signature ANEW Item" },
];

const categories: Category[] = ["All", "Teas & Treats", "Spa & Self Care", "Bedding & Silk", "Apparel & Lounge", "Home & Wellness"];

const featured = products.filter((p) => p.featured);

export default function BoutiquePage() {
  const [activeFilter, setActiveFilter] = useState<Category>("All");

  const filtered = activeFilter === "All" ? products : products.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/interior-living.jpg" alt="Boutique" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-6 max-w-2xl">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">The Boutique</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal mb-5">ANEW Collection</h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
              Curated wellness essentials, spa comforts, and thoughtful boutique pieces inspired by the ANEW retreat experience.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-4 h-4 text-accent" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent">Curated Favorites</p>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Featured Collection</h2>
          </AnimatedSection>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 px-2 min-w-max">
              {featured.map((product, i) => (
                <AnimatedSection key={product.name} delay={i * 0.08}>
                  <div className="w-[280px] group">
                    <div className="relative aspect-square bg-cream rounded-lg mb-4 overflow-hidden flex items-center justify-center shine-hover">
                      <div className="text-center px-6">
                        <Leaf className="w-8 h-8 text-accent/30 mx-auto mb-3" />
                        <p className="text-xs text-muted">ANEW</p>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </div>
                    {product.tag && (
                      <p className="text-[9px] tracking-[0.2em] uppercase text-accent mb-1.5">{product.tag}</p>
                    )}
                    <h4 className="font-heading text-lg text-dark mb-1 group-hover:text-accent transition-colors">{product.name}</h4>
                    <p className="font-heading text-base text-dark/70">{product.price}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="divider mx-auto" />
      </div>

      {/* Full Collection */}
      <section className="py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-3">Shop</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal">Full Collection</h2>
          </AnimatedSection>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[11px] tracking-[0.2em] uppercase pb-1 transition-all duration-300 ${
                  activeFilter === cat
                    ? "text-dark border-b border-dark"
                    : "text-muted hover:text-dark"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map((product, i) => (
              <AnimatedSection key={product.name} delay={i * 0.04}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-cream rounded-lg mb-4 overflow-hidden shine-hover glow-hover flex items-center justify-center">
                    <div className="text-center px-4">
                      <Leaf className="w-6 h-6 text-accent/20 mx-auto mb-2" />
                      <p className="text-[10px] text-muted tracking-wide">ANEW</p>
                    </div>
                    {product.tag && (
                      <span className="absolute top-3 left-3 text-[8px] tracking-[0.15em] uppercase bg-white/90 text-dark px-2.5 py-1 rounded-full">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-accent mb-1">{product.category}</p>
                    <h4 className="text-sm text-dark font-medium leading-snug mb-1.5 group-hover:text-accent transition-colors">{product.name}</h4>
                    {product.desc && (
                      <p className="text-xs text-muted leading-relaxed mb-1.5">{product.desc}</p>
                    )}
                    <p className="font-heading text-base text-dark">{product.price}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Boutique Info */}
      <section className="py-24 bg-cream px-6 relative overflow-hidden">
        <CornerAccent position="top-right" />
        <CornerAccent position="bottom-left" />
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <ShoppingBag className="w-8 h-8 text-accent/40 mx-auto mb-4" />
            <h2 className="font-heading text-3xl text-dark font-normal mb-4">Visit Our Boutique</h2>
            <p className="text-muted text-sm leading-relaxed mb-3 max-w-lg mx-auto">
              All boutique items are available on-site during your stay or event at ANEW. Select items can be shipped upon request.
            </p>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              For purchases or inquiries, contact us directly or ask your event coordinator.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
                Book Your Stay
              </Link>
              <a href="mailto:info@anew-estate.com" className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors">
                Inquire About Items
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
