import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Estate | ANEW",
  description:
    "Explore the ANEW estate, a 5,800 sq ft woodland property in Kenmore, WA. Discover our indoor and outdoor spaces designed for unforgettable gatherings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
