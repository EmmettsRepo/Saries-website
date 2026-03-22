import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages & Pricing | ANEW",
  description:
    "View packages and pricing for weddings, retreats, and private events at ANEW. Flexible options tailored to your celebration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
