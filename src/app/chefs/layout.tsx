import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Chefs | ANEW",
  description:
    "Meet the talented chefs behind ANEW's culinary experiences, crafting seasonal Pacific Northwest cuisine for your event.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
