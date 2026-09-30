import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Aura Events | Luxury Event Planning & Spatial Staging",
  description: "Bespoke event planning suite featuring interactive 2D seating floor plans, 360° venue stager, and live RSVP tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-porcelain text-teal-900 selection:bg-gold-100 selection:text-gold-900 antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
