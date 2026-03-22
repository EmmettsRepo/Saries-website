"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      // Only show after scrolling past the hero (first 100vh)
      const heroHeight = window.innerHeight;
      if (scrollTop < heroHeight) {
        setVisible(false);
        setProgress(0);
        return;
      }

      setVisible(true);

      if (docHeight <= 0) {
        setProgress(0);
        return;
      }

      const pct = Math.min((scrollTop / docHeight) * 100, 100);
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 2,
        zIndex: 51,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "#9AACAB",
          transition: "width 0.15s ease-out",
        }}
      />
    </div>
  );
}
