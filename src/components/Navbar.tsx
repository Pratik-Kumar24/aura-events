"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Grid3X3, Eye, Menu, X, QrCode } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeEvent = useEventStore((state) => state.getActiveEvent());

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Overview", icon: Sparkles },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/floor-plan", label: "Floor Plan", icon: Grid3X3 },
    { href: "/venue-tour", label: "360° Stager", icon: Eye },
    { href: "/rsvp", label: "RSVP & Passes", icon: QrCode },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold-500/20 bg-white/90 backdrop-blur-md transition-all shadow-[0_2px_15px_-3px_rgba(197,160,89,0.08)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-950 to-teal-900 border border-gold-500/40 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <span className="font-serif text-lg font-bold tracking-tight text-gold-400">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-teal-950">
              AURA <span className="font-sans text-[11px] font-semibold tracking-widest text-gold-600 uppercase">Events</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-900 text-gold-300 border border-gold-500/35 shadow-sm"
                    : "text-teal-900/70 hover:bg-gold-50/70 hover:text-teal-950"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-gold-400" : "text-gold-600"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status Pill */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-gold-500/25 bg-surface px-3 py-1.5 text-xs text-teal-950 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-status-attending animate-pulse" />
            <span className="font-medium truncate max-w-[160px]">
              {mounted ? activeEvent.title : "Sharma-Verma Wedding Gala"}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 px-4 py-1.5 text-xs font-semibold text-white shadow-gold-glow hover:brightness-110 transition-all active:scale-98"
          >
            Manage
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-teal-900 hover:bg-teal-50"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-teal-900/10 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-teal-900 text-white" : "text-teal-900/75 hover:bg-teal-50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-coral-400" : "text-teal-700"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
