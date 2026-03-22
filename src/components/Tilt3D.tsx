"use client";

import { useRef, useState, useSyncExternalStore } from "react";

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

function getIsTouch() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none)").matches;
}
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(hover: none)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export default function Tilt3D({ children, className = "", intensity = 8 }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  const isTouch = useSyncExternalStore(subscribe, getIsTouch, () => false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setStyle({
      transform: `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`,
      transition: "transform 0.15s ease-out",
    });
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    setStyle({
      transform: "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)",
      transition: "transform 0.5s ease-out",
    });
  };

  return (
    <div
      ref={ref}
      data-sound="wobble"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isTouch ? {} : style}
      className={className}
    >
      {children}
    </div>
  );
}
