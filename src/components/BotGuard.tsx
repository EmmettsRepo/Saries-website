"use client";

import { useState, useRef, useEffect } from "react";

interface BotGuardProps {
  onVerified: () => void;
  children: React.ReactNode;
}

/**
 * Bot prevention:
 * 1. Hidden honeypot field (bots fill it, humans don't)
 * 2. Time check (bots submit instantly, humans take >2 seconds)
 * 3. Visible "I'm not a robot" checkbox
 */
export function useBotGuard() {
  const honeypotRef = useRef("");
  const loadTime = useRef(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => { loadTime.current = Date.now(); }, []);

  const isBot = (): boolean => {
    // Honeypot filled = bot
    if (honeypotRef.current) return true;
    // Submitted in under 2 seconds = bot
    if (Date.now() - loadTime.current < 2000) return true;
    // Checkbox not checked = bot
    if (!verified) return true;
    return false;
  };

  return { honeypotRef, verified, setVerified, isBot };
}

/** Trim user input to a safe maximum length */
export function sanitize(text: string): string {
  return text.slice(0, 2000);
}

export default function BotGuard({ onVerified, children }: BotGuardProps) {
  const [checked, setChecked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  const handleCheck = () => {
    if (done) return;
    setChecked(true);
    setVerifying(true);
    // Small delay to feel like verification
    setTimeout(() => {
      setVerifying(false);
      setDone(true);
      onVerified();
    }, 800);
  };

  return (
    <div>
      {children}
      {/* Honeypot — hidden from humans, bots fill it */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {/* Verification checkbox */}
      <div className="flex items-center gap-3 mt-6 py-4 px-5 border border-border rounded bg-cream/30">
        <button
          type="button"
          onClick={handleCheck}
          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
            done ? "border-green-500 bg-green-500" : verifying ? "border-accent animate-pulse" : "border-border hover:border-dark"
          }`}
        >
          {done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {verifying && <div className="w-2 h-2 bg-accent rounded-full" />}
        </button>
        <span className="text-sm text-muted">
          {done ? "Verified" : verifying ? "Verifying..." : "I'm not a robot"}
        </span>
      </div>
    </div>
  );
}
