import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiences | ANEW",
  description:
    "Discover curated experiences at ANEW, from wellness retreats and chef-led dinners to corporate escapes in the Pacific Northwest.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
