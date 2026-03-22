import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique | ANEW",
  description:
    "Shop the ANEW boutique for curated goods, gifts, and keepsakes inspired by the Pacific Northwest.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
