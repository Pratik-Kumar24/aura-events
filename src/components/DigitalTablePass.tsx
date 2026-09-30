"use client";

import React, { useRef } from "react";
import {
  Sparkles,
  Printer,
  Share2,
  Calendar,
  Building,
  CheckCircle2,
  ShieldCheck,
  Utensils,
  Armchair,
  Check,
} from "lucide-react";
import { Guest, EventData, FloorItem } from "@/store/useEventStore";
import { CreativeQRCode } from "@/components/CreativeQRCode";

interface DigitalTablePassProps {
  guest: Guest;
  event: EventData;
  table?: FloorItem | null;
  onPrint?: () => void;
}

export default function DigitalTablePass({
  guest,
  event,
  table,
  onPrint,
}: DigitalTablePassProps) {
  const [copied, setCopied] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const qrPayload = `AURA-PASS:${event.id}:${guest.id}:${guest.name}:${table ? table.label : "UNSEATED"}`;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintCard = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Outer Card Body: Ultra Luxury VIP Credential Pass */}
      <div
        ref={cardRef}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-gold-500/40 bg-gradient-to-b from-[#0B1514] via-[#08100F] to-[#040707] text-white p-6 sm:p-7 select-none"
        style={{
          boxShadow: "0 25px 50px -12px rgba(10, 20, 18, 0.8), 0 0 35px -5px rgba(197, 160, 89, 0.35)",
        }}
      >
        {/* Subtle Watermark Texture & Corner Gold Filigree */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gold-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gold-400/10 blur-2xl" />
        
        {/* Ornate Gold Corner Notches */}
        <div className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-gold-400/60" />
        <div className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-gold-400/60" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-gold-400/60" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-gold-400/60" />

        {/* Card Header: Brand Monogram & Classification */}
        <div className="flex items-center justify-between border-b border-gold-500/25 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-950 border border-gold-400/60 font-serif text-sm font-bold text-gold-400 shadow-gold-glow">
              A
            </div>
            <div>
              <div className="font-serif text-xs font-bold tracking-widest text-gold-300 uppercase">
                AURA EVENTS
              </div>
              <div className="text-[9px] tracking-wider text-teal-200/50 uppercase font-mono">
                Official Concierge Pass
              </div>
            </div>
          </div>

          {guest.vip ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold-400 bg-gold-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-gold-300 uppercase shadow-sm">
              <Sparkles className="h-2.5 w-2.5 text-gold-400" />
              <span>VIP HONORED</span>
            </span>
          ) : (
            <span className="rounded-full border border-gold-500/30 bg-teal-900/60 px-2.5 py-0.5 text-[9px] font-medium tracking-wider text-gold-300/80 uppercase">
              CONFIRMED
            </span>
          )}
        </div>

        {/* Event Title & Metadata */}
        <div className="mt-4 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gold-400/80">
            {event.eventType} Gala Reception
          </div>
          <h3 className="mt-1 font-serif text-lg sm:text-xl font-bold text-white leading-snug">
            {event.title}
          </h3>
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-teal-200/70">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gold-400" />
              {event.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <Building className="h-3 w-3 text-gold-400" />
              {event.venueName}
            </span>
          </div>
        </div>

        {/* Guest Identification Section */}
        <div className="mt-5 rounded-2xl border border-gold-500/30 bg-white/5 p-4 backdrop-blur-md text-center">
          <div className="text-[10px] uppercase tracking-widest text-gold-400/70">
            Distinguished Guest
          </div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold gold-text-gradient">
            {guest.name}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 px-3 py-1 text-xs text-gold-200 font-medium">
            <Utensils className="h-3 w-3 text-gold-400" />
            <span>Menu: {guest.dietary}</span>
          </div>
        </div>

        {/* Spatial Seating Details: Table & Chair Number */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-gold-500/25 bg-teal-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gold-400/70 font-semibold">
              Table Assignment
            </div>
            <div className="mt-1 font-serif text-sm font-bold text-white truncate">
              {table ? table.label : "Concierge Placement"}
            </div>
          </div>
          <div className="rounded-xl border border-gold-500/25 bg-teal-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gold-400/70 font-semibold">
              Assigned Seat
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-gold-300 flex items-center justify-center gap-1">
              <Armchair className="h-3.5 w-3.5 text-gold-400" />
              <span>
                {guest.seatIndex !== null ? `Chair #${guest.seatIndex + 1}` : "Host Escort"}
              </span>
            </div>
          </div>
        </div>

        {/* Creative QR Code Area */}
        <div className="mt-6 flex flex-col items-center">
          <CreativeQRCode
            value={qrPayload}
            size={180}
            label="CONCIERGE CHECK-IN"
            sublabel="Present at entrance for expedited escort"
            theme="noir"
            showCenterCrest={true}
          />
        </div>

        {/* Pass Verification Footer */}
        <div className="mt-5 border-t border-gold-500/20 pt-4 flex items-center justify-between text-[10px] text-teal-200/60 font-mono">
          <span>PASS ID: {guest.id.toUpperCase()}</span>
          {guest.checkedIn ? (
            <span className="flex items-center gap-1 text-status-attending font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              <span>Checked In ({guest.checkInTime || "Venue"})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gold-400">
              <ShieldCheck className="h-3 w-3" />
              <span>Valid for Admission</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Controls Below Card */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrintCard}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal-900 px-4 py-2 text-xs font-semibold text-gold-300 border border-gold-500/30 shadow-md hover:bg-teal-950 hover:shadow-gold-glow transition-all"
        >
          <Printer className="h-3.5 w-3.5 text-gold-400" />
          <span>Print / Save Pass</span>
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-white px-4 py-2 text-xs font-semibold text-teal-900 shadow-sm hover:bg-gold-50/70 transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-status-attending" /> : <Share2 className="h-3.5 w-3.5 text-gold-600" />}
          <span>{copied ? "Link Copied!" : "Share Pass"}</span>
        </button>
      </div>
    </div>
  );
}
