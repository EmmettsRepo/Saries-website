"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // For now, just show success — can wire to Firebase or Mailchimp later
    setSubscribed(true);
  };

  return (
    <footer className="bg-dark text-white/70">
      {/* Newsletter bar */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="font-heading text-2xl text-white mb-1">Stay Connected</p>
              <p className="text-sm text-white/40">Seasonal updates, event inspiration, and exclusive offers.</p>
            </div>
            {subscribed ? (
              <p className="text-accent text-sm tracking-wide">Thank you — you&apos;re on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/15 text-white text-sm px-5 py-3 w-full md:w-64 focus:outline-none focus:border-accent transition-colors placeholder-white/30"
                />
                <button type="submit" className="text-[10px] tracking-[0.25em] uppercase bg-accent text-white px-6 py-3 hover:bg-accent-light transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-heading text-3xl text-white tracking-[0.2em] mb-6">ANEW</p>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs mb-6">
              Pacific Northwest Retreat &amp; Spa. Where strong foundations begin.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-accent transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-accent transition-colors" aria-label="Pinterest">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0c-6.623 0-12 5.377-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.623 0 12-5.377 12-12 0-6.623-5.377-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-6">Explore</p>
            <div className="flex flex-col gap-3">
              {[
                { label: "The Estate", href: "/venue" },
                { label: "Experiences", href: "/experiences" },
                { label: "Our Team", href: "/team" },
                { label: "Local Area", href: "/local" },
                { label: "Gallery", href: "/gallery" },
                { label: "Boutique", href: "/boutique" },
                { label: "Book", href: "/booking" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-accent transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Gather */}
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-6">Gather</p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Weddings", href: "/booking" },
                { label: "Wellness Retreats", href: "/experiences" },
                { label: "Corporate Retreats", href: "/experiences" },
                { label: "Private Dining", href: "/chefs" },
                { label: "Packages", href: "/packages" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-white/50 hover:text-accent transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-6">Contact</p>
            <div className="flex flex-col gap-3 text-sm text-white/50">
              <p>16527 74th Ave NE</p>
              <p>Kenmore, WA 98028</p>
              <a href="tel:+14255550199" className="hover:text-accent transition-colors">(425) 555-0199</a>
              <a href="mailto:info@anew-estate.com" className="hover:text-accent transition-colors">info@anew-estate.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} ANEW. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
