"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { signUp, logIn } from "@/lib/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setPhone(""); setError(""); setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Password reset email sent. Check your inbox.");
        setLoading(false);
        return;
      }
      if (mode === "signup") {
        if (!firstName || !email || !password) { setError("Please fill in all required fields."); setLoading(false); return; }
        await signUp(email, password, firstName, lastName, phone);
      } else {
        await logIn(email, password);
      }
      reset();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("email-already-in-use")) setError("This email is already registered.");
      else if (msg.includes("wrong-password") || msg.includes("invalid-credential")) setError("Invalid email or password.");
      else if (msg.includes("weak-password")) setError("Password must be at least 6 characters.");
      else if (msg.includes("invalid-email")) setError("Please enter a valid email.");
      else if (msg.includes("user-not-found")) setError("No account found with this email.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border-b border-border bg-transparent py-3 text-sm text-dark placeholder-muted focus:outline-none focus:border-accent transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-warm-white rounded-sm max-w-md w-full p-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-dark transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-heading text-2xl text-dark mb-2 text-center">
              {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
            </h2>
            <p className="text-sm text-muted text-center mb-8">
              {mode === "login" ? "Sign in to manage your bookings" : mode === "signup" ? "Join ANEW to book events and chefs" : "Enter your email to receive a reset link"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
              )}
              {mode === "signup" && (
                <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              )}
              <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              {mode !== "reset" && (
                <input type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={6} />
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}
              {success && <p className="text-green-600 text-xs">{success}</p>}

              <button type="submit" disabled={loading} className="w-full text-[11px] tracking-[0.3em] uppercase bg-dark text-white py-3.5 hover:bg-accent transition-colors duration-500 disabled:opacity-50">
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center text-sm text-muted mt-6 space-y-2">
              {mode === "login" && (
                <p>
                  <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} className="text-dark underline hover:text-accent transition-colors">
                    Forgot password?
                  </button>
                </p>
              )}
              <p>
                {mode === "login" ? "Don't have an account? " : mode === "signup" ? "Already have an account? " : "Remember your password? "}
                <button
                  onClick={() => { setMode(mode === "signup" ? "login" : mode === "reset" ? "login" : "signup"); setError(""); setSuccess(""); }}
                  className="text-dark underline hover:text-accent transition-colors"
                >
                  {mode === "signup" ? "Sign In" : mode === "reset" ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
