"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function PageTransition() {
  const pathname = usePathname();
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => false);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Trigger CSS animation directly instead of setState
    const el = transitionRef.current;
    if (!el) return;
    el.style.display = "flex";
    el.style.animation = "page-wipe 0.6s cubic-bezier(0.76, 0, 0.24, 1) forwards";

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (el) {
        el.style.display = "none";
        el.style.animation = "";
      }
    }, 600);
  }, [pathname, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <style>{`
        @keyframes page-wipe {
          0% { transform: scaleY(0); opacity: 1; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0); opacity: 0; }
        }
      `}</style>
      <div
        ref={transitionRef}
        className="fixed inset-0 z-[55] bg-dark pointer-events-none items-center justify-center"
        style={{ display: "none", transformOrigin: "top" }}
      >
        <p className="font-heading text-3xl text-white/15 tracking-[0.3em]">
          ANEW
        </p>
      </div>
    </>
  );
}
