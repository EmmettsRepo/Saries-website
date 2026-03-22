"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ChefHat, LogOut, Calendar, Users, Clock } from "lucide-react";

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  dietaryNotes: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: unknown;
}

export default function ChefPortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chefName, setChefName] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.email) return;
    setLoadingBookings(true);
    try {
      // Find chef profile by email
      const chefsSnap = await getDocs(collection(db, "chefs"));
      const chef = chefsSnap.docs.find((d) => d.data().email?.toLowerCase() === user.email?.toLowerCase());
      if (chef) {
        setChefName(chef.data().name || "Chef");
      }

      // Get bookings for this chef
      const bookingsSnap = await getDocs(collection(db, "chef_bookings"));
      const myBookings = bookingsSnap.docs
        .filter((d) => d.data().chefEmail?.toLowerCase() === user.email?.toLowerCase() || d.data().chefId === chef?.id)
        .map((d) => ({ id: d.id, ...d.data() } as Booking))
        .sort((a, b) => {
          const at = a.createdAt && typeof a.createdAt === "object" && "seconds" in a.createdAt ? (a.createdAt as { seconds: number }).seconds : 0;
          const bt = b.createdAt && typeof b.createdAt === "object" && "seconds" in b.createdAt ? (b.createdAt as { seconds: number }).seconds : 0;
          return bt - at;
        });
      setBookings(myBookings);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setBookings([]);
    setChefName("");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700";
      case "confirmed": return "bg-green-50 text-green-700";
      case "completed": return "bg-card text-muted";
      case "cancelled": return "bg-red-50 text-red-600";
      default: return "bg-card text-muted";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24"><p className="text-muted text-sm">Loading...</p></div>;
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 bg-warm-white">
        <div className="max-w-sm w-full">
          <div className="text-center mb-10">
            <ChefHat className="w-10 h-10 text-accent mx-auto mb-3" />
            <h1 className="font-heading text-3xl text-dark mb-1">Chef Portal</h1>
            <p className="text-sm text-muted">Sign in to view your bookings at ANEW</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
            <input
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loggingIn}
              className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-3.5 hover:bg-accent transition-colors duration-500 disabled:opacity-50">
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="w-5 h-5 text-accent" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent">Chef Portal</p>
            </div>
            <h1 className="font-heading text-3xl text-dark font-normal">
              Welcome, {chefName || "Chef"}
            </h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted hover:text-dark transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-border p-5 text-center">
            <p className="font-heading text-2xl text-dark">{bookings.length}</p>
            <p className="text-xs text-muted mt-1">Total Bookings</p>
          </div>
          <div className="border border-border p-5 text-center">
            <p className="font-heading text-2xl text-dark">{upcoming.length}</p>
            <p className="text-xs text-muted mt-1">Upcoming</p>
          </div>
          <div className="border border-border p-5 text-center">
            <p className="font-heading text-2xl text-dark">{past.length}</p>
            <p className="text-xs text-muted mt-1">Completed</p>
          </div>
        </div>

        {loadingBookings ? (
          <p className="text-muted text-sm text-center py-12">Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-8 h-8 text-accent/40 mx-auto mb-4" />
            <p className="text-muted text-sm">No bookings yet. You&apos;ll see them here once guests book you.</p>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="font-heading text-xl text-dark mb-4">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.id} className="border border-border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-dark font-medium">{b.userName || "Guest"}</p>
                          <p className="text-xs text-muted">{b.userEmail}</p>
                        </div>
                        <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        {b.scheduledDate ? (
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.scheduledDate}{b.scheduledTime ? ` @ ${b.scheduledTime}` : ""}</span>
                        ) : b.eventDate ? (
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.eventDate}</span>
                        ) : null}
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.guestCount} guests</span>
                        {b.eventType ? <span>{b.eventType}</span> : null}
                      </div>
                      {b.dietaryNotes ? (
                        <p className="text-xs text-muted mt-3 bg-cream/50 p-3 rounded">
                          <span className="font-medium text-dark">Dietary notes:</span> {b.dietaryNotes}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-heading text-xl text-dark mb-4">Past Bookings</h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <div key={b.id} className="border border-border p-5 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-dark font-medium">{b.userName || "Guest"}</p>
                          <p className="text-xs text-muted">{b.eventDate || b.scheduledDate || "No date"} · {b.guestCount} guests</p>
                        </div>
                        <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
