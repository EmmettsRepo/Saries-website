"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile, updateUserProfile, logOut } from "@/lib/auth";
import { getUserChefBookings } from "@/lib/chefs";
import { collection, getDocs } from "firebase/firestore";
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db } from "@/lib/firebase";
import AnimatedSection from "@/components/AnimatedSection";
import { CheckCircle2, LogOut, ChefHat, Calendar, Eye, AlertTriangle, User, Lock, Trash2 } from "lucide-react";

type Tab = "overview" | "profile" | "security";

interface BookingItem {
  id: string;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [chefBookings, setChefBookings] = useState<BookingItem[]>([]);
  const [eventBookings, setEventBookings] = useState<BookingItem[]>([]);
  const [tourRequests, setTourRequests] = useState<BookingItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await getUserProfile(user.uid);
      if (p) setProfile({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone });

      const cb = await getUserChefBookings(user.uid);
      setChefBookings(cb as BookingItem[]);

      // Get event bookings for this user's email
      const bSnap = await getDocs(collection(db, "booking_inquiries"));
      const userEmail = user.email?.toLowerCase() || "";
      setEventBookings(
        bSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as BookingItem))
          .filter((b) => (b.email as string)?.toLowerCase() === userEmail)
      );

      const tSnap = await getDocs(collection(db, "tour_requests"));
      setTourRequests(
        tSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as BookingItem))
          .filter((t) => (t.email as string)?.toLowerCase() === userEmail)
      );

      setLoadingData(false);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setPasswordMsg("");
    if (newPassword.length < 6) { setPasswordMsg("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg("Passwords don't match."); return; }
    setChangingPassword(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setPasswordMsg("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      setPasswordMsg("Current password is incorrect.");
    } finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    setDeleting(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, cred);
      await deleteUser(user);
      router.push("/");
    } catch {
      alert("Incorrect password. Account not deleted.");
    } finally { setDeleting(false); }
  };

  const handleLogout = async () => { await logOut(); router.push("/"); };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-50 text-blue-700";
      case "contacted": return "bg-amber-50 text-amber-700";
      case "confirmed": return "bg-green-50 text-green-700";
      case "completed": return "bg-card text-muted";
      case "pending": return "bg-amber-50 text-amber-700";
      default: return "bg-card text-muted";
    }
  };

  const formatDate = (val: unknown): string => {
    if (!val) return "";
    if (typeof val === "object" && val !== null && "seconds" in val)
      return new Date((val as { seconds: number }).seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (typeof val === "string") return val;
    return "";
  };

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center pt-24"><p className="text-muted text-sm">Loading...</p></div>;
  if (!user) return null;

  const inputClass = "w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors";
  const totalBookings = eventBookings.length + chefBookings.length + tourRequests.length;
  const upcomingEvents = [...eventBookings, ...chefBookings].filter((b) => (b.status as string) !== "completed" && (b.status as string) !== "cancelled");

  return (
    <div className="pt-32 pb-28 px-6">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-2">Account</p>
              <h1 className="font-heading text-3xl sm:text-4xl text-dark font-normal">
                Welcome, {profile.firstName || "there"}
              </h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted hover:text-dark transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
          <p className="text-muted text-sm mb-10">{user.email}</p>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-10">
            {[
              { key: "overview" as Tab, label: "Overview", icon: Calendar },
              { key: "profile" as Tab, label: "Profile", icon: User },
              { key: "security" as Tab, label: "Security", icon: Lock },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors border-b-2 -mb-[2px] ${
                  tab === t.key ? "border-dark text-dark" : "border-transparent text-muted hover:text-dark"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* === OVERVIEW TAB === */}
          {tab === "overview" && (
            <div className="space-y-10">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-border p-5 text-center">
                  <p className="font-heading text-2xl text-dark">{totalBookings}</p>
                  <p className="text-xs text-muted mt-1">Total Bookings</p>
                </div>
                <div className="border border-border p-5 text-center">
                  <p className="font-heading text-2xl text-dark">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted mt-1">Upcoming</p>
                </div>
                <div className="border border-border p-5 text-center">
                  <p className="font-heading text-2xl text-dark">{chefBookings.length}</p>
                  <p className="text-xs text-muted mt-1">Chef Bookings</p>
                </div>
              </div>

              {/* Event Bookings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-accent" />
                  <h2 className="font-heading text-xl text-dark">Event Inquiries</h2>
                </div>
                {eventBookings.length === 0 ? (
                  <p className="text-muted text-sm py-4">No event inquiries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {eventBookings.map((b) => (
                      <div key={b.id} className="border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-dark font-medium">{(b.eventType as string) || "Event Inquiry"}</p>
                          <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${statusColor((b.status as string) || "new")}`}>
                            {(b.status as string) || "new"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted">
                          {b.date ? <span>Date: {b.date as string}</span> : null}
                          {b.guestCount ? <span>{b.guestCount as number} guests</span> : null}
                          {b.selectedPackage ? <span>Package: {b.selectedPackage as string}</span> : null}
                          {b.estimatedTotal ? <span>Est: ${(b.estimatedTotal as number).toLocaleString()}</span> : null}
                        </div>
                        <p className="text-[10px] text-muted mt-2">Submitted {formatDate(b.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chef Bookings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="w-4 h-4 text-accent" />
                  <h2 className="font-heading text-xl text-dark">Chef Bookings</h2>
                </div>
                {chefBookings.length === 0 ? (
                  <p className="text-muted text-sm py-4">No chef bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {chefBookings.map((b) => (
                      <div key={b.id} className="border border-border p-5 flex items-center justify-between">
                        <div>
                          <p className="text-dark font-medium">{b.chefName as string}</p>
                          <p className="text-xs text-muted mt-1">{b.eventDate as string} &middot; {b.guestCount as number} guests</p>
                          {b.eventType ? <p className="text-xs text-muted">{b.eventType as string}</p> : null}
                        </div>
                        <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${statusColor((b.status as string) || "pending")}`}>
                          {(b.status as string) || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tour Requests */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-accent" />
                  <h2 className="font-heading text-xl text-dark">Tour Requests</h2>
                </div>
                {tourRequests.length === 0 ? (
                  <p className="text-muted text-sm py-4">No tour requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tourRequests.map((t) => (
                      <div key={t.id} className="border border-border p-5 flex items-center justify-between">
                        <div>
                          <p className="text-dark font-medium">Property Tour</p>
                          <p className="text-xs text-muted mt-1">
                            {t.date ? `Requested: ${t.date as string}` : "No date specified"}
                          </p>
                          {t.message ? <p className="text-xs text-muted mt-1 max-w-md truncate">{t.message as string}</p> : null}
                        </div>
                        <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full ${statusColor((t.status as string) || "new")}`}>
                          {(t.status as string) || "new"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === PROFILE TAB === */}
          {tab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">First Name</label>
                  <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Last Name</label>
                  <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Email</label>
                <input type="email" value={profile.email} disabled className={inputClass + " opacity-50"} />
                <p className="text-[10px] text-muted mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} placeholder="(555) 000-0000" />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button type="submit" disabled={saving} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors duration-500 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saved && <span className="flex items-center gap-1 text-accent text-sm"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
              </div>
            </form>
          )}

          {/* === SECURITY TAB === */}
          {tab === "security" && (
            <div className="space-y-12">
              {/* Change Password */}
              <div>
                <h2 className="font-heading text-xl text-dark mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-sm">
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[11px] tracking-[0.2em] uppercase text-muted block mb-2">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
                  </div>
                  {passwordMsg && (
                    <p className={`text-xs ${passwordMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>{passwordMsg}</p>
                  )}
                  <button type="submit" disabled={changingPassword} className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3 hover:bg-accent transition-colors duration-500 disabled:opacity-50">
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Delete Account */}
              <div className="border-t border-border pt-10">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h2 className="font-heading text-xl text-dark">Delete Account</h2>
                </div>
                <p className="text-muted text-sm mb-4">This action is permanent. All your data will be removed and cannot be recovered.</p>
                {!showDelete ? (
                  <button onClick={() => setShowDelete(true)} className="text-[11px] tracking-[0.3em] uppercase text-red-500 border border-red-300 px-6 py-2.5 hover:bg-red-50 transition-colors">
                    Delete My Account
                  </button>
                ) : (
                  <div className="max-w-sm space-y-4">
                    <p className="text-sm text-red-500">Enter your password to confirm deletion:</p>
                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password" className={inputClass} />
                    <div className="flex gap-3">
                      <button onClick={handleDeleteAccount} disabled={deleting || !deletePassword}
                        className="text-[11px] tracking-[0.3em] uppercase bg-red-500 text-white px-6 py-2.5 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button onClick={() => { setShowDelete(false); setDeletePassword(""); }}
                        className="text-[11px] tracking-[0.3em] uppercase text-muted hover:text-dark transition-colors px-4">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
