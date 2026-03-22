"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { logOut } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

const navLinks = [
  { label: "About", href: "/venue" },
  { label: "Experiences", href: "/experiences" },
  { label: "Gather", href: "/#events" },
  { label: "Team", href: "/team" },
  { label: "Explore", href: "/local" },
  { label: "Gallery", href: "/gallery" },
  { label: "Boutique", href: "/boutique" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const linkClass = `text-[11px] tracking-[0.25em] uppercase font-light transition-colors duration-300 ${
    scrolled ? "text-dark" : "text-white"
  } hover:opacity-60`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-warm-white/95 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between relative">
          {/* Left nav (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 4).map((link) => (
              <Link key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <span
              className={`font-heading text-[1.7rem] sm:text-[2rem] tracking-[0.35em] transition-colors duration-500 font-light ${
                scrolled ? "text-dark" : "text-white"
              }`}
            >
              ANEW
            </span>
          </Link>

          {/* Right nav (desktop) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(4).map((link) => (
              <Link key={link.label} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-6">
                <Link href="/profile" className={linkClass}>
                  <User className="w-4 h-4 inline mr-1" />
                  Account
                </Link>
                <Link
                  href="/booking"
                  className={`text-[11px] tracking-[0.25em] uppercase font-light border px-5 py-2.5 transition-all duration-300 ${
                    scrolled
                      ? "border-dark text-dark hover:bg-dark hover:text-white"
                      : "border-white text-white hover:bg-white hover:text-dark"
                  }`}
                >
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button onClick={() => setAuthOpen(true)} className={linkClass}>
                  Sign In
                </button>
                <Link
                  href="/booking"
                  className={`text-[11px] tracking-[0.25em] uppercase font-light border px-5 py-2.5 transition-all duration-300 ${
                    scrolled
                      ? "border-dark text-dark hover:bg-dark hover:text-white"
                      : "border-white text-white hover:bg-white hover:text-dark"
                  }`}
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden transition-colors ${scrolled ? "text-dark" : "text-white"}`}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 lg:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div key={link.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={link.href} onClick={() => setMobileOpen(false)} className="text-white text-[13px] tracking-[0.3em] uppercase font-light hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-white text-[13px] tracking-[0.3em] uppercase font-light hover:text-accent transition-colors">Account</Link>
                <button onClick={() => { logOut(); setMobileOpen(false); }} className="text-white/50 text-[13px] tracking-[0.3em] uppercase font-light hover:text-accent transition-colors">Sign Out</button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); setAuthOpen(true); }} className="text-white text-[13px] tracking-[0.3em] uppercase font-light hover:text-accent transition-colors">Sign In</button>
            )}
            <Link href="/booking" onClick={() => setMobileOpen(false)} className="text-[13px] tracking-[0.3em] uppercase font-light border border-white text-white px-8 py-3 hover:bg-white hover:text-dark transition-all">
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
