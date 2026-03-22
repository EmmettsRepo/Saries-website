"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChefHat } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { getChefs, submitChefBooking, type Chef } from "@/lib/chefs";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";

export default function ChefsPage() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingChef, setBookingChef] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ eventDate: "", guestCount: 20, eventType: "", dietaryNotes: "" });

  useEffect(() => {
    getChefs().then((c) => { setChefs(c); setLoading(false); });
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bookingChef) return;
    const chef = chefs.find((c) => c.id === bookingChef);
    if (!chef) return;
    setSubmitting(true);
    try {
      await submitChefBooking({
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        chefId: chef.id,
        chefName: chef.name,
        chefEmail: chef.email || "",
        eventDate: form.eventDate,
        guestCount: form.guestCount,
        eventType: form.eventType,
        dietaryNotes: form.dietaryNotes,
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/catering-spread.jpg" alt="Chefs" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">Farm to Table</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Our Chefs</h1>
            <p className="text-white/60 mt-4 max-w-md mx-auto text-sm">Book a private chef for your event and experience exceptional cuisine crafted on-site.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Chef Profiles */}
      <section className="py-28 px-6">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <p className="text-muted text-sm text-center py-12">Loading chefs...</p>
          ) : chefs.length === 0 ? (
            <div className="text-center py-20">
              <ChefHat className="w-10 h-10 text-accent mx-auto mb-4" />
              <h2 className="font-heading text-2xl text-dark mb-3">Chefs Coming Soon</h2>
              <p className="text-muted text-sm max-w-md mx-auto mb-8">We&apos;re curating an exceptional roster of private chefs. Check back soon or inquire about our dining experiences.</p>
              <Link href="/booking" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors duration-500">
                Inquire About Dining
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-16">
              {chefs.map((chef, i) => (
                <AnimatedSection key={chef.id} delay={i * 0.1}>
                  <div className="group">
                    <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-cream">
                      {chef.imageUrl ? (
                        <Image src={chef.imageUrl} alt={chef.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="w-16 h-16 text-border" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading text-2xl text-dark">{chef.name}</h3>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-accent mt-1">{chef.specialty}</p>
                      </div>
                      <div className="text-right">
                        {chef.rating > 0 && (
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <span className="text-sm text-dark">{chef.rating}</span>
                          </div>
                        )}
                        <p className="font-heading text-lg text-dark">${chef.price}<span className="text-xs text-muted">/person</span></p>
                      </div>
                    </div>
                    <p className="text-muted text-sm leading-relaxed mb-4">{chef.bio}</p>
                    {chef.cuisines && chef.cuisines.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {chef.cuisines.map((c) => (
                          <span key={c} className="text-[10px] tracking-[0.15em] uppercase border border-border px-3 py-1 text-muted">{c}</span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (!user) { setAuthOpen(true); return; }
                        setBookingChef(chef.id);
                        setSubmitted(false);
                        setForm({ eventDate: "", guestCount: 20, eventType: "", dietaryNotes: "" });
                      }}
                      className="text-[11px] tracking-[0.3em] uppercase text-dark border-b border-dark pb-1 hover:text-accent hover:border-accent transition-colors"
                    >
                      Book This Chef
                    </button>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookingChef && (() => {
        const chef = chefs.find((c) => c.id === bookingChef);
        if (!chef) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setBookingChef(null)}>
            <div className="bg-warm-white max-w-md w-full p-10 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setBookingChef(null)} className="absolute top-4 right-4 text-muted hover:text-dark"><span className="text-xl">&times;</span></button>
              {submitted ? (
                <div className="text-center py-8">
                  <ChefHat className="w-10 h-10 text-accent mx-auto mb-4" />
                  <h3 className="font-heading text-2xl text-dark mb-2">Chef Booked!</h3>
                  <p className="text-muted text-sm mb-4">We&apos;ll confirm your booking with {chef.name} shortly via email.</p>
                  <button onClick={() => setBookingChef(null)} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors">Done</button>
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-2xl text-dark mb-1">Book {chef.name}</h3>
                  <p className="text-sm text-muted mb-6">${chef.price}/person</p>
                  <form onSubmit={handleBook} className="space-y-5">
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Event Date *</label>
                      <input type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Guest Count *</label>
                      <input type="number" required min={2} max={75} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors" />
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Event Type</label>
                      <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="w-full border-b border-border bg-transparent py-3 text-sm text-dark focus:outline-none focus:border-accent transition-colors">
                        <option value="">Select...</option>
                        <option>Wedding</option><option>Corporate Retreat</option><option>Private Dinner</option><option>Birthday</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Dietary Notes</label>
                      <textarea value={form.dietaryNotes} onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })} rows={3} placeholder="Allergies, preferences..." className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none" />
                    </div>
                    <p className="text-xs text-muted">Estimated: <span className="text-dark font-medium">${(chef.price * form.guestCount).toLocaleString()}</span> for {form.guestCount} guests</p>
                    <button type="submit" disabled={submitting} className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-3.5 hover:bg-accent transition-colors duration-500 disabled:opacity-50">
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        );
      })()}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
