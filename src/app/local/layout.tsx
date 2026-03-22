import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Things To Do | ANEW",
  description:
    "Explore local attractions, dining, and activities near ANEW in Kenmore, WA and the greater Pacific Northwest.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
