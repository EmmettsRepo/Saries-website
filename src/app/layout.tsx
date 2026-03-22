import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import SoundEngine from "@/components/SoundEngine";
import FallingLeaves from "@/components/FallingLeaves";
import ScrollProgress from "@/components/ScrollProgress";
import PageTransition from "@/components/PageTransition";

// TODO: Update to custom domain when ready
const SITE_URL = "https://bakkers-website-847ba.web.app";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ANEW | Pacific Northwest Retreat & Spa",
  description:
    "ANEW is a Pacific Northwest retreat and spa in Kenmore, WA. A 5,800 sq ft woodland estate for weddings, wellness retreats, corporate escapes, and celebrations. Where strong foundations begin.",
  openGraph: {
    title: "ANEW | Pacific Northwest Retreat & Spa",
    description: "A 5,800 sq ft woodland estate for weddings, wellness retreats, and celebrations. Elevated, exclusive, elegant. Where strong foundations begin.",
    url: SITE_URL,
    siteName: "ANEW",
    images: [{ url: "/images/exterior-hero.webp", width: 1536, height: 1152, alt: "ANEW Estate" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANEW | Pacific Northwest Retreat & Spa",
    description: "A woodland estate for weddings, wellness retreats, and celebrations near Seattle.",
    images: ["/images/exterior-hero.webp"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${lato.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <SoundEngine />
          <FallingLeaves />
          <ScrollProgress />
          <PageTransition />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
