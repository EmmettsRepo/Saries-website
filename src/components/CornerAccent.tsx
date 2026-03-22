"use client";

import Image from "next/image";

interface CornerAccentProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variant?: "vine" | "watercolor";
  className?: string;
}

export default function CornerAccent({ position, variant = "vine", className = "" }: CornerAccentProps) {
  const posClass = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  }[position];

  const rotate = {
    "top-left": "",
    "top-right": "scaleX(-1)",
    "bottom-left": "scaleY(-1)",
    "bottom-right": "scale(-1)",
  }[position];

  const size = variant === "watercolor" ? 200 : 140;

  return (
    <div
      className={`absolute ${posClass} pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        transform: rotate,
        width: size,
        height: size,
      }}
    >
      <Image
        src={variant === "watercolor" ? "/svg/floral-corner-frame.png" : "/svg/floral-corner.png"}
        alt=""
        width={size}
        height={size}
        className={variant === "watercolor" ? "botanical-watercolor" : "botanical-accent"}
      />
    </div>
  );
}
