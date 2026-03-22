import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team | ANEW",
  description:
    "Meet the team at ANEW dedicated to making your Pacific Northwest event seamless and memorable.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
