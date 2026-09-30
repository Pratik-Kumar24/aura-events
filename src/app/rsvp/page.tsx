"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Building,
  Utensils,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  Clock,
  Heart,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useEventStore, Guest, GuestStatus } from "@/store/useEventStore";
import DigitalTablePass from "@/components/DigitalTablePass";

function RSVPContent() {
  const searchParams = useSearchParams();
  const guestParam = searchParams.get("guest");
  const eventParam = searchParams.get("event");

  const {
    activeEventId,
    events,
    setActiveEventId,
    updateGuestDetails,
    addGuest,
  } = useEventStore();

  // Pick target event from param or store
  const targetEventId = eventParam && events[eventParam] ? eventParam : activeEventId;
  const currentEvent = events[targetEventId] || Object.values(events)[0];

  // Selected Guest State
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(guestParam || null);
  const [guestSearch, setGuestSearch] = useState("");
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);

  // Form State
  const [rsvpStatus, setRsvpStatus] = useState<GuestStatus>("attending");
  const [dietary, setDietary] = useState("Standard");
  const [notes, setNotes] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync with URL or currentEvent changes
  useEffect(() => {
    if (eventParam && events[eventParam]) {
      setActiveEventId(eventParam);
    }
  }, [eventParam, events, setActiveEventId]);

  const activeGuest = currentEvent?.guests.find((g) => g.id === selectedGuestId);

  // Populate form when activeGuest changes
  useEffect(() => {
    if (activeGuest) {
      setRsvpStatus(activeGuest.status === "declined" ? "declined" : "attending");
      setDietary(activeGuest.dietary || "Standard");
      setNotes(activeGuest.notes || "");
      if (activeGuest.status === "attending") {
        setIsSubmitted(true);
      }
    }
  }, [activeGuest]);

  // Filtered Guests for Lookup
  const filteredGuests = currentEvent?.guests.filter((g) =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase())
  ) || [];

  // Submit RSVP
  const handleConfirmRSVP = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegisteringNew) {
      if (!newName.trim()) return;
      const newGuestId = `guest-${Date.now()}`;
      addGuest({
        name: newName.trim(),
        status: rsvpStatus,
        dietary,
        vip: false,
      });
      setSelectedGuestId(newGuestId);
      setIsRegisteringNew(false);
    } else if (selectedGuestId) {
      updateGuestDetails(selectedGuestId, {
        status: rsvpStatus,
        dietary,
        notes,
      });
    }

    if (rsvpStatus === "attending") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#C5A059", "#0D3B3A", "#DFBF77"],
      });
    }

    setIsSubmitted(true);
  };

  // Find Table for Guest
  const assignedTable = activeGuest?.tableId
    ? currentEvent?.floorPlan.find((f) => f.id === activeGuest.tableId)
    : null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-porcelain py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient Luxury Glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-gold-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-900/70 hover:text-teal-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Organizer Command</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-white/90 px-3 py-1 text-xs font-semibold text-teal-950 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-status-attending" />
            <span>Official Guest Portal</span>
          </div>
        </div>

        {/* Hero Invitation Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-700 shadow-sm">
            <Sparkles className="h-3 w-3 text-gold-500" />
            <span>You Are Cordially Invited</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl sm:text-5xl font-normal text-teal-950">
            {currentEvent?.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-teal-900/70 font-light">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold-600" />
              {currentEvent?.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building className="h-4 w-4 text-gold-600" />
              {currentEvent?.venueName}
            </span>
          </div>
        </div>

        {/* STEP 1: Search / Select Guest if not yet selected */}
        {!selectedGuestId && !isRegisteringNew ? (
          <div className="mt-10 rounded-3xl border border-gold-500/25 bg-white p-6 sm:p-10 shadow-card">
            <div className="text-center max-w-md mx-auto">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-teal-950">
                Find Your Invitation
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-teal-900/70">
                Please search your name below to RSVP and receive your bespoke digital table pass.
              </p>

              {/* Guest Search Input */}
              <div className="relative mt-6">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gold-600" />
                <input
                  type="text"
                  placeholder="Enter your first or last name..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full rounded-xl border border-gold-500/30 bg-surface pl-10 pr-4 py-3 text-sm text-teal-950 placeholder-teal-900/40 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                  autoFocus
                />
              </div>

              {/* Guest Result List */}
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2 text-left">
                {filteredGuests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => setSelectedGuestId(guest.id)}
                    className="w-full flex items-center justify-between rounded-xl border border-gold-500/20 bg-surface/50 p-3 hover:bg-gold-50/70 hover:border-gold-500 transition-all text-xs group"
                  >
                    <div>
                      <div className="font-semibold text-teal-950 text-sm group-hover:text-gold-700 transition-colors flex items-center gap-1.5">
                        <span>{guest.name}</span>
                        {guest.vip && (
                          <span className="rounded bg-gold-500 text-white px-1.5 py-0.2 text-[9px] font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-teal-900/60 mt-0.5">
                        Status: <span className="capitalize font-medium">{guest.status}</span> • Menu: {guest.dietary}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gold-700 font-semibold">
                      <span>RSVP</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}

                {filteredGuests.length === 0 && (
                  <div className="py-6 text-center text-xs text-teal-900/50">
                    No matching invitation found.
                  </div>
                )}
              </div>

              {/* Or Register New Attendee */}
              <div className="mt-6 pt-4 border-t border-gold-500/15">
                <button
                  type="button"
                  onClick={() => setIsRegisteringNew(true)}
                  className="text-xs font-semibold text-gold-700 hover:text-gold-800 underline"
                >
                  Not listed? Register an attendee invitation &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2 & 3: RSVP Form and Digital Table Pass */
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: RSVP Form & Customization */}
            <div className="lg:col-span-7 rounded-3xl border border-gold-500/25 bg-white p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between border-b border-gold-500/15 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
                    Guest Credentials
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-teal-950">
                    {isRegisteringNew ? "Register Your Attendance" : activeGuest?.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGuestId(null);
                    setIsRegisteringNew(false);
                    setIsSubmitted(false);
                  }}
                  className="text-xs font-semibold text-teal-900/60 hover:text-teal-950 transition-colors"
                >
                  Change Guest
                </button>
              </div>

              <form onSubmit={handleConfirmRSVP} className="mt-6 space-y-6">
                {isRegisteringNew && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-teal-900/80">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shalini Singhania"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gold-500/30 bg-surface px-3.5 py-2.5 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* RSVP Attendance Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-900/80 mb-2">
                    Will you be joining us?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRsvpStatus("attending")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                        rsvpStatus === "attending"
                          ? "border-emerald-600 bg-emerald-50 text-status-attending ring-2 ring-emerald-500/30 shadow-sm"
                          : "border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Attending with Pleasure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpStatus("declined")}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                        rsvpStatus === "declined"
                          ? "border-rose-600 bg-rose-50 text-status-declined ring-2 ring-rose-500/30 shadow-sm"
                          : "border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Regretfully Decline</span>
                    </button>
                  </div>
                </div>

                {rsvpStatus === "attending" && (
                  <>
                    {/* Dietary Requirement Options */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-teal-900/80 mb-2">
                        Dietary & Culinary Preferences
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          "Standard",
                          "Vegetarian",
                          "Vegan",
                          "Gluten-Free",
                          "Sattvic",
                          "Kosher",
                          "Jain",
                          "Nut Allergy",
                        ].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setDietary(option)}
                            className={`rounded-lg border px-3 py-2 text-center font-medium transition-all ${
                              dietary === option
                                ? "border-gold-600 bg-teal-900 text-gold-300 shadow-sm"
                                : "border-gold-500/20 bg-surface text-teal-900/80 hover:bg-gold-50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Special Accommodations / Notes */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-teal-900/80">
                        Special Requests or Allergies
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Severe peanut allergy, wheelchair assistance required, arrival at 19:30"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/30 bg-surface px-3.5 py-2 text-xs text-teal-950 placeholder-teal-900/40 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 py-3 text-sm font-semibold text-white shadow-gold-glow hover:brightness-110 transition-all active:scale-98"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isSubmitted ? "Update My Confirmation" : "Confirm RSVP & Generate Pass"}
                    </span>
                  </button>
                </div>
              </form>

              {isSubmitted && (
                <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 flex items-center gap-2.5 text-xs text-emerald-950">
                  <CheckCircle2 className="h-4 w-4 text-status-attending shrink-0" />
                  <span>
                    RSVP confirmed! Your digital table pass on the right is ready for entry.
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Digital Table Pass with Creative QR Code */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {activeGuest && rsvpStatus === "attending" ? (
                <DigitalTablePass
                  guest={{
                    ...activeGuest,
                    dietary,
                    status: rsvpStatus,
                  }}
                  event={currentEvent}
                  table={assignedTable}
                />
              ) : (
                <div className="w-full rounded-3xl border-2 border-dashed border-gold-500/30 bg-white/70 p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <QrCode className="h-12 w-12 text-gold-600 mb-3 opacity-60" />
                  <h3 className="font-serif text-lg font-bold text-teal-950">
                    Digital Table Pass Preview
                  </h3>
                  <p className="mt-1 text-xs text-teal-900/60 max-w-xs">
                    Confirm your attendance to unlock your gilded pass and scannable QR credential.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RSVPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-porcelain">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        </div>
      }
    >
      <RSVPContent />
    </Suspense>
  );
}
