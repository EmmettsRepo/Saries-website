import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | ANEW",
  description:
    "Browse photos of the ANEW estate, event spaces, and past celebrations at our Pacific Northwest woodland retreat.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
