"use client";

import Image from "next/image";

// Hand-drawn style dividers — organic, imperfect lines that feel sketched

interface HandDrawnDividerProps {
  className?: string;
  variant?: "botanical" | "simple" | "flourish" | "ivy";
  color?: string;
}

export default function HandDrawnDivider({
  className = "",
  variant = "botanical",
  color = "#9AACAB",
}: HandDrawnDividerProps) {
  if (variant === "ivy") {
    return (
      <div className={`flex justify-center ${className}`} aria-hidden="true">
        <Image
          src="/svg/ivy-divider.png"
          alt=""
          width={300}
          height={60}
          className="botanical-divider"
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className={`flex justify-center ${className}`} aria-hidden="true">
        <svg width="120" height="8" viewBox="0 0 120 8" fill="none">
          {/* Slightly wobbly hand-drawn line */}
          <path
            d="M0 4 Q10 3 20 4.5 Q30 5.5 40 4 Q50 2.5 60 4 Q70 5.5 80 4 Q90 2.5 100 4.2 Q110 5 120 4"
            stroke={color}
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
    );
  }

  if (variant === "flourish") {
    return (
      <div className={`flex justify-center ${className}`} aria-hidden="true">
        <svg width="180" height="30" viewBox="0 0 180 30" fill="none">
          {/* Central flourish with curls */}
          <path
            d="M40 15 Q50 15 60 12 Q70 8 80 8 Q85 8 90 12 Q95 8 100 8 Q110 8 120 12 Q130 15 140 15"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Left curl */}
          <path
            d="M40 15 Q35 15 32 12 Q30 8 35 6 Q40 5 42 8"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Right curl */}
          <path
            d="M140 15 Q145 15 148 12 Q150 8 145 6 Q140 5 138 8"
            stroke={color}
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Center diamond */}
          <path
            d="M87 8 L90 5 L93 8 L90 11 Z"
            stroke={color}
            strokeWidth="0.5"
            fill={color}
            opacity="0.2"
          />
        </svg>
      </div>
    );
  }

  // botanical — default
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <svg width="200" height="40" viewBox="0 0 200 40" fill="none">
        {/* Central stem */}
        <path
          d="M60 20 Q80 20 100 20 Q120 20 140 20"
          stroke={color}
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.35"
        />
        {/* Left branch */}
        <path
          d="M80 20 Q72 14 65 10"
          stroke={color}
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Right branch */}
        <path
          d="M120 20 Q128 14 135 10"
          stroke={color}
          strokeWidth="0.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Leaves — left */}
        <path d="M65 10 Q60 5 63 2 Q67 5 65 10Z" fill={color} opacity="0.25" />
        <path d="M73 15 Q68 10 70 6 Q75 10 73 15Z" fill={color} opacity="0.2" />
        {/* Leaves — right */}
        <path d="M135 10 Q140 5 137 2 Q133 5 135 10Z" fill={color} opacity="0.25" />
        <path d="M127 15 Q132 10 130 6 Q125 10 127 15Z" fill={color} opacity="0.2" />
        {/* Center bud */}
        <circle cx="100" cy="20" r="2.5" fill={color} opacity="0.15" />
        <circle cx="100" cy="20" r="1" fill={color} opacity="0.3" />
        {/* Tiny leaves off center */}
        <path d="M95 20 Q92 16 94 13 Q97 16 95 20Z" fill={color} opacity="0.18" />
        <path d="M105 20 Q108 16 106 13 Q103 16 105 20Z" fill={color} opacity="0.18" />
      </svg>
    </div>
  );
}
