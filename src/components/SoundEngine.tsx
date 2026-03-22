"use client";

import { useEffect, useRef, useCallback } from "react";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ===== SLIDE — wind gust on page switch =====
function playSlide() {
  if (prefersReducedMotion()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.8;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(100, t);
  filter.frequency.linearRampToValueAtTime(800, t + 0.2);
  filter.frequency.linearRampToValueAtTime(400, t + 0.5);
  filter.frequency.linearRampToValueAtTime(80, t + 0.75);
  filter.Q.setValueAtTime(0.4, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.02, t + 0.08);
  gain.gain.linearRampToValueAtTime(0.015, t + 0.3);
  gain.gain.linearRampToValueAtTime(0.005, t + 0.55);
  gain.gain.linearRampToValueAtTime(0, t + 0.75);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
  source.stop(t + 0.8);

  if (typeof window !== "undefined" && window.__blowLeavesAway) {
    window.__blowLeavesAway();
  }
}

export default function SoundEngine() {
  const currentPath = useRef("");

  const resumeCtx = useCallback(() => { getCtx(); }, []);

  useEffect(() => {
    document.addEventListener("click", resumeCtx, { once: true });
    document.addEventListener("touchstart", resumeCtx, { once: true });
    currentPath.current = window.location.pathname;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button");
      if (!clickable) return;

      const href = clickable.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("/#") && href !== currentPath.current) {
        playSlide();
        currentPath.current = href;
      }
    };

    const handlePopState = () => {
      if (window.location.pathname !== currentPath.current) {
        playSlide();
        currentPath.current = window.location.pathname;
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("click", resumeCtx);
      document.removeEventListener("touchstart", resumeCtx);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [resumeCtx]);

  return null;
}
