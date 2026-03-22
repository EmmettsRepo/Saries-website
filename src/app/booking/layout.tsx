import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Event | ANEW",
  description:
    "Reserve your date at ANEW. Book weddings, retreats, corporate events, and private celebrations at our Pacific Northwest estate.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
