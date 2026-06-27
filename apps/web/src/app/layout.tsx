import type { Metadata, Viewport } from "next";
import { Fredoka, Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { TopNav } from "@/components/layout/TopNav";
import { RouteTransition } from "@/components/transition/RouteTransition";
import { ScrollBackground } from "@/components/hero/ScrollBackground";

const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Beerio Kart World Cup",
  description:
    "RSVP for the annual Beerio Kart World Cup — get your seed.",
  openGraph: {
    title: "Beerio Kart World Cup",
    description: "RSVP, claim your tournament seed.",
    images: ["/assets/title.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility, but keep games tap-friendly.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${lilita.variable} ${fredoka.variable} ${inter.variable}`}
    >
      <body className="min-h-[100dvh] antialiased">
        {/* Persistent transition overlay — must live here, not in template.tsx */}
        <RouteTransition />
        <TopNav />
        <div className="relative">
            <ScrollBackground />
            <div className="min-h-[100dvh]">{children}</div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
