"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Grid3X3,
  CheckCircle2,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  QrCode,
  Printer,
} from "lucide-react";
import { useEventStore } from "@/store/useEventStore";

import { formatINR } from "@/lib/formatINR";

export default function LandingPage() {
  const router = useRouter();
  const setActiveEventId = useEventStore((s) => s.setActiveEventId);
  const createEvent = useEventStore((s) => s.createEvent);
  const activeEvent = useEventStore((s) => s.getActiveEvent());

  // Quick-Start Filter State with Budget Allocation
  const [eventName, setEventName] = useState("Kapoor Heritage Gala");
  const [eventType, setEventType] = useState<"Wedding" | "Corporate" | "Gala">("Wedding");
  const [guestCount, setGuestCount] = useState<number>(120);
  const [vibe, setVibe] = useState<"Modern" | "Classic" | "Rustic">("Classic");
  const [budget, setBudget] = useState<number>(8500000); // ₹85 Lakhs default

  const handleLaunchPlanner = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent({
      title: eventName.trim() || "Bespoke Royal Gala",
      eventType,
      targetGuestCount: guestCount,
      vibe,
      totalBudget: budget,
    });
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-porcelain">
      {/* Background Ambient Luxury Accents */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[650px] w-[650px] rounded-full bg-gold-200/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[550px] w-[550px] rounded-full bg-gold-400/15 blur-3xl" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-950 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              <span>Bespoke Hospitality Suite</span>
              <span className="h-1 w-1 rounded-full bg-gold-500/40" />
              <span className="text-gold-700 font-medium">Exclusive & Opulent Event Architecture</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="mt-8 max-w-4xl font-serif text-4xl font-normal tracking-tight text-teal-950 sm:text-6xl lg:text-7xl">
              Effortless Planning for{" "}
              <span className="italic font-serif text-teal-950 underline decoration-gold-400 decoration-2 underline-offset-8">
                Unforgettable
              </span>{" "}
              Moments
            </h1>

            {/* Subheading */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-teal-900/70 font-light leading-relaxed">
              Curate high-stakes celebrations with architectural precision. Intuitive 2D seating canvases,
              immersive 360° venue stagers, and real-time INR (₹) financial telemetry crafted exclusively for discerning organizers.
            </p>

            {/* Quick-Start Event Filter & Budget Allocation Bar */}
            <div className="mt-12 w-full max-w-5xl rounded-2xl border border-gold-500/25 bg-white/95 p-5 shadow-card-hover backdrop-blur-lg sm:p-7">
              <form onSubmit={handleLaunchPlanner} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
                {/* Query Input */}
                <div className="text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900/80">
                    Celebration Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Royal Jaipur Gala"
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 placeholder-teal-900/40 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    required
                  />
                </div>

                {/* Event Type Selector */}
                <div className="text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900/80">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    <option value="Wedding">Royal Wedding</option>
                    <option value="Corporate">Executive Summit</option>
                    <option value="Gala">Charity Gala</option>
                  </select>
                </div>

                {/* Guest Count & Vibe */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900/80">
                      Guests
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      step={10}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-2.5 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900/80">
                      Vibe
                    </label>
                    <select
                      value={vibe}
                      onChange={(e) => setVibe(e.target.value as any)}
                      className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-2 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    >
                      <option value="Classic">Classic</option>
                      <option value="Modern">Modern</option>
                      <option value="Rustic">Heritage</option>
                    </select>
                  </div>
                </div>

                {/* Allocated Budget (₹) */}
                <div className="text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900/80">
                      Allocated Budget (₹)
                    </label>
                    <span className="text-[11px] font-bold text-gold-600">
                      {formatINR(budget, true)}
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-2 text-sm font-bold text-gold-600">₹</span>
                    <input
                      type="number"
                      min={100000}
                      max={500000000}
                      step={50000}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full rounded-lg border border-gold-500/25 bg-surface pl-7 pr-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Launch Button */}
                <div>
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-2.5 text-sm font-semibold text-gold-300 border border-gold-500/30 shadow-md transition-all hover:bg-teal-950 hover:shadow-gold-glow active:scale-98"
                  >
                    <span>Allocate & Launch</span>
                    <ArrowRight className="h-4 w-4 text-gold-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>

              {/* Instant Preset Quick Links */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gold-500/15 pt-3 text-xs text-teal-900/60">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-teal-900/80">Curated Demos:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEventId("sharma-verma-wedding");
                      router.push("/dashboard");
                    }}
                    className="rounded bg-gold-50/80 border border-gold-500/20 px-2 py-0.5 text-teal-900 hover:bg-gold-100/80 transition-colors font-medium"
                  >
                    Sharma-Verma Wedding (₹85L Budget, 14 guests)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEventId("global-tech-summit");
                      router.push("/dashboard");
                    }}
                    className="rounded bg-gold-50/80 border border-gold-500/20 px-2 py-0.5 text-teal-900 hover:bg-gold-100/80 transition-colors font-medium"
                  >
                    Global Tech Summit (₹1.5Cr Budget)
                  </button>
                </div>
                <div className="flex items-center gap-1 text-gold-700 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-status-attending" />
                  <span>Real-time budget telemetry & local persistence</span>
                </div>
              </div>
            </div>

            {/* Social Proof & Metrics Strip */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 max-w-4xl text-left border-y border-gold-500/20 py-6">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-teal-950">1,250+</div>
                <div className="text-xs text-teal-900/70 mt-0.5">High-Stakes Galas Planned</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-gold-600">99.8%</div>
                <div className="text-xs text-teal-900/70 mt-0.5">Guest Seating Accuracy</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-teal-950">₹0 Fee</div>
                <div className="text-xs text-teal-900/70 mt-0.5">Private Local Architecture</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-status-attending">360°</div>
                <div className="text-xs text-teal-900/70 mt-0.5">Photorealistic Staging</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="relative bg-surface py-20 border-t border-gold-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">Core Architecture</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-teal-950">
              Instruments Built for Event Perfectionists
            </h2>
            <p className="mt-3 text-sm sm:text-base text-teal-900/70">
              No generic spreadsheets. Every tool is tailor-engineered for rapid spatial visualization, live INR financial stewardship, and guest harmonization.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Floor Plan */}
            <div className="group rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card-hover flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50/80 border border-gold-500/30 text-gold-700 group-hover:bg-teal-900 group-hover:text-gold-300 transition-colors shadow-sm">
                  <Grid3X3 className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold text-teal-950">
                  2D Seating Canvas
                </h3>
                <p className="mt-2 text-sm text-teal-900/70 leading-relaxed">
                  Interactive seating with circular banquet rounds, rectangular tables, stages, and cocktail bars. Directly place guests with dietary tooltips.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold-500/10">
                <Link
                  href="/floor-plan"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <span>Launch Studio</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Feature 2: 360° Stager */}
            <div className="group rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card-hover flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50/80 border border-gold-500/30 text-gold-700 group-hover:bg-teal-900 group-hover:text-gold-300 transition-colors shadow-sm">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold text-teal-950">
                  360° Venue Stager
                </h3>
                <p className="mt-2 text-sm text-teal-900/70 leading-relaxed">
                  Equirectangular panoramic navigation with drag-to-rotate and zoom. Preview decor themes (Teal Velvet, Classic White, Champagne) and hotspots.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold-500/10">
                <Link
                  href="/venue-tour"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <span>Enter 360° Tour</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Live Command Center */}
            <div className="group rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card-hover flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50/80 border border-gold-500/30 text-gold-700 group-hover:bg-teal-900 group-hover:text-gold-300 transition-colors shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold text-teal-950">
                  RSVP & Telemetry
                </h3>
                <p className="mt-2 text-sm text-teal-900/70 leading-relaxed">
                  Real-time RSVP segmentation, milestone checklist with confetti celebrations, and visual INR (₹) budget gauge with 85% expenditure alerts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold-500/10">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Feature 4: Public RSVP & Creative QR Table Passes */}
            <div className="group rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-card-hover flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50/80 border border-gold-500/30 text-gold-700 group-hover:bg-teal-900 group-hover:text-gold-300 transition-colors shadow-sm">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold text-teal-950">
                  RSVP & QR Passes
                </h3>
                <p className="mt-2 text-sm text-teal-900/70 leading-relaxed">
                  Public RSVP portal for guest meal selections and instant generation of Apple Wallet-style luxury table passes with creative gilded QR codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gold-500/10">
                <Link
                  href="/rsvp"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <span>Open RSVP Portal</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Quote / Showcase Banner */}
      <section className="relative py-16 bg-gradient-to-r from-teal-950 via-teal-900 to-obsidian-950 text-white overflow-hidden border-y border-gold-500/30">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-serif text-2xl sm:text-3xl italic font-light tracking-wide text-porcelain">
            &ldquo;Aura Events transforms chaotic logistical spreadsheets into pure visual choreography. It is the gold standard for high-end hospitality.&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold-500/20 border border-gold-400/50 flex items-center justify-center font-serif text-gold-300 font-bold shadow-gold-glow">
              P
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Pratik Kumar</div>
              <div className="text-xs text-gold-200/70">Creative Director, Aura Events Co. Ltd.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold-500/20 bg-white py-8 text-center text-xs text-teal-900/60">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-teal-950">AURA EVENTS</span>
            <span>— Luxury Event Architecture & Seating Choreography</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gold-600 transition-colors">Dashboard</Link>
            <Link href="/floor-plan" className="hover:text-gold-600 transition-colors">Floor Plan</Link>
            <Link href="/venue-tour" className="hover:text-gold-600 transition-colors">Venue Tour</Link>
            <Link href="/rsvp" className="hover:text-gold-600 transition-colors">RSVP Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
