"use client";

interface CornerAccentProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variant?: "vine" | "watercolor";
  className?: string;
}

// Floral corner accents disabled site-wide per design update.
export default function CornerAccent(_props: CornerAccentProps) {
  void _props;
  return null;
}
