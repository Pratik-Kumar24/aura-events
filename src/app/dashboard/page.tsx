"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Users,
  IndianRupee,
  Plus,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Search,
  Filter,
  Check,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  Building,
  Calendar,
  X,
  Trash2,
  Pencil,
  Wallet,
  Printer,
  QrCode,
  FileText,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useEventStore, Guest, GuestStatus, ChecklistTask, BudgetItem } from "@/store/useEventStore";
import { formatINR } from "@/lib/formatINR";
import ExportModal from "@/components/ExportModal";
import DigitalTablePass from "@/components/DigitalTablePass";

export default function DashboardPage() {
  const {
    activeEventId,
    events,
    setActiveEventId,
    resetToDefaults,
    toggleTask,
    addTask,
    deleteTask,
    addGuest,
    updateGuestStatus,
    toggleCheckIn,
    updateTotalBudget,
    addBudgetItem,
    deleteBudgetItem,
    createEvent,
  } = useEventStore();

  const currentEvent = events[activeEventId] || events["sharma-verma-wedding"] || Object.values(events)[0];

  // Export & Digital Pass Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalTab, setExportModalTab] = useState<"catering" | "seating" | "budget">("catering");
  const [viewingPassGuest, setViewingPassGuest] = useState<Guest | null>(null);

  // Search & Filter state for guests
  const [guestSearch, setGuestSearch] = useState("");
  const [guestTab, setGuestTab] = useState<"all" | GuestStatus>("all");

  // Add Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<ChecklistTask["category"]>("Venue & Catering");

  // Add Guest Modal State
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestDietary, setNewGuestDietary] = useState("Standard");
  const [newGuestStatus, setNewGuestStatus] = useState<GuestStatus>("pending");
  const [newGuestVip, setNewGuestVip] = useState(false);

  // Budget Adjustment Modal State (Update budget while planning)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState<number>(currentEvent.budget.totalBudget);

  // Add Expense Modal State (Add custom expense line items while planning)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("Royal Catering & Bar");
  const [newExpenseEstimated, setNewExpenseEstimated] = useState<number>(1000000);
  const [newExpenseActual, setNewExpenseActual] = useState<number>(1000000);

  // New Event Creation Modal State (Allocate budget to each new event)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState<"Wedding" | "Corporate" | "Gala">("Wedding");
  const [newEventDate, setNewEventDate] = useState("November 28, 2026");
  const [newEventVenue, setNewEventVenue] = useState("The Leela Palace, Udaipur");
  const [newEventGuests, setNewEventGuests] = useState<number>(150);
  const [newEventBudget, setNewEventBudget] = useState<number>(10000000); // ₹1 Crore default

  // Filtered Guests
  const filteredGuests = currentEvent.guests.filter((g) => {
    const matchesTab = guestTab === "all" ? true : g.status === guestTab;
    const matchesSearch =
      g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.dietary.toLowerCase().includes(guestSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Guest Metrics
  const totalGuests = currentEvent.guests.length;
  const attendingGuests = currentEvent.guests.filter((g) => g.status === "attending").length;
  const pendingGuests = currentEvent.guests.filter((g) => g.status === "pending").length;
  const declinedGuests = currentEvent.guests.filter((g) => g.status === "declined").length;
  const seatedGuests = currentEvent.guests.filter((g) => g.tableId !== null).length;
  const checkedInGuests = currentEvent.guests.filter((g) => g.checkedIn).length;

  // Checklist Metrics
  const totalTasks = currentEvent.checklist.length;
  const completedTasks = currentEvent.checklist.filter((t) => t.completed).length;
  const overallTaskProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Budget Metrics
  const totalBudget = currentEvent.budget.totalBudget;
  const totalActualExpense = currentEvent.budget.expenses.reduce(
    (sum, exp) => sum + exp.actual,
    0
  );
  const totalEstimatedExpense = currentEvent.budget.expenses.reduce(
    (sum, exp) => sum + exp.estimated,
    0
  );
  const budgetSpentPercent = Math.round((totalActualExpense / totalBudget) * 100);
  const isBudgetWarning = budgetSpentPercent >= 85;

  // Task Toggle with Confetti
  const handleToggleTask = (id: string) => {
    toggleTask(id);
    const task = currentEvent.checklist.find((t) => t.id === id);
    if (task && !task.completed && completedTasks + 1 === totalTasks) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0D3B3A", "#E07A5F", "#10B981"],
      });
    }
  };

  React.useEffect(() => {
    if (currentEvent?.budget?.totalBudget) {
      setBudgetInput(currentEvent.budget.totalBudget);
    }
  }, [activeEventId, currentEvent?.budget?.totalBudget]);

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetInput <= 0) return;
    updateTotalBudget(budgetInput);
    setIsBudgetModalOpen(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName.trim()) return;
    addBudgetItem({
      name: newExpenseName.trim(),
      category: newExpenseCategory,
      estimated: Number(newExpenseEstimated) || 0,
      actual: Number(newExpenseActual) || 0,
    });
    setNewExpenseName("");
    setIsExpenseModalOpen(false);
  };

  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    createEvent({
      title: newEventTitle.trim(),
      eventType: newEventType,
      date: newEventDate.trim(),
      venueName: newEventVenue.trim(),
      targetGuestCount: newEventGuests,
      totalBudget: Number(newEventBudget) || 10000000,
    });
    setNewEventTitle("");
    setIsNewEventModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
    });
    setNewTaskTitle("");
    setIsTaskModalOpen(false);
  };

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    addGuest({
      name: newGuestName.trim(),
      dietary: newGuestDietary.trim(),
      status: newGuestStatus,
      vip: newGuestVip,
    });
    setNewGuestName("");
    setIsGuestModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-porcelain pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-gold-500/20 bg-white/90 backdrop-blur-md sticky top-16 z-40 shadow-sm">
        <div className="mx-auto flex flex-col gap-4 max-w-7xl px-4 py-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                Organizer Command Center
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-50/80 border border-gold-500/20 px-2 py-0.5 text-[11px] font-medium text-teal-950">
                <span className="h-1.5 w-1.5 rounded-full bg-status-attending" />
                State Auto-Persists (INR ₹)
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-teal-950">
              {currentEvent.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-teal-900/70">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gold-600" />
                {currentEvent.date}
              </span>
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-gold-600" />
                {currentEvent.venueName}
              </span>
            </div>
          </div>

          {/* Action Bar / Event Switcher & New Event Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-lg border border-gold-500/25 bg-surface px-2.5 py-1.5 shadow-sm">
              <label htmlFor="event-select" className="text-xs font-semibold text-teal-900/80 mr-2">
                Active:
              </label>
              <select
                id="event-select"
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-teal-950 focus:outline-none cursor-pointer"
              >
                {Object.values(events).map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Creative Export & Manifests Trigger */}
            <button
              type="button"
              onClick={() => {
                setExportModalTab("catering");
                setIsExportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-sm hover:bg-gold-50 transition-all active:scale-98"
              title="Generate printable luxury manifests and CSV spreadsheets"
            >
              <Printer className="h-3.5 w-3.5 text-gold-600" />
              <span>Manifests & Export</span>
            </button>

            {/* Public Guest RSVP Portal Link */}
            <Link
              href={`/rsvp?event=${activeEventId}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-gold-50/70 px-3 py-1.5 text-xs font-semibold text-teal-950 shadow-sm hover:bg-gold-100 transition-all active:scale-98"
              title="Open the guest-facing RSVP and table pass portal"
            >
              <QrCode className="h-3.5 w-3.5 text-gold-600" />
              <span>Guest RSVP Link</span>
              <ExternalLink className="h-3 w-3 text-gold-600/70" />
            </Link>

            {/* Allocate Budget to New Event Button */}
            <button
              type="button"
              onClick={() => setIsNewEventModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-gold-glow hover:brightness-110 transition-all active:scale-98"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Plan New Event</span>
            </button>

            <button
              onClick={resetToDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/20 bg-white px-3 py-1.5 text-xs font-medium text-teal-900 shadow-sm hover:bg-gold-50/60 transition-colors"
              title="Reset state to pristine initial mock data"
            >
              <RotateCcw className="h-3.5 w-3.5 text-teal-700" />
              <span>Reset</span>
            </button>

            <Link
              href="/floor-plan"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-900 px-4 py-1.5 text-xs font-semibold text-gold-300 border border-gold-500/30 shadow-sm hover:bg-teal-950 transition-all"
            >
              <span>Floor Plan</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-gold-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Grid */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Highlights Top Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gold-500/20 bg-white p-5 shadow-card hover:border-gold-500/35 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900/70 uppercase tracking-wider">
                Confirmed RSVPs
              </span>
              <UserCheck className="h-4 w-4 text-status-attending" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-teal-950">{attendingGuests}</span>
              <span className="text-xs text-teal-900/60">/ {totalGuests} guests</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-status-attending">{Math.round((attendingGuests / (totalGuests || 1)) * 100)}% confirmed</span>
              <span className="text-gold-700 bg-gold-50 border border-gold-500/20 px-1.5 py-0.5 rounded text-[11px] font-mono">{checkedInGuests} arrived</span>
            </div>
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-white p-5 shadow-card hover:border-gold-500/35 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900/70 uppercase tracking-wider">
                Seated Guests
              </span>
              <Users className="h-4 w-4 text-gold-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-teal-950">{seatedGuests}</span>
              <span className="text-xs text-teal-900/60">assigned</span>
            </div>
            <div className="mt-2 text-xs text-gold-600 font-semibold">
              {attendingGuests - seatedGuests} attending need seats
            </div>
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-white p-5 shadow-card hover:border-gold-500/35 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900/70 uppercase tracking-wider">
                Checklist Tasks
              </span>
              <CheckSquare className="h-4 w-4 text-gold-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-teal-950">{completedTasks}</span>
              <span className="text-xs text-teal-900/60">/ {totalTasks} finished</span>
            </div>
            <div className="mt-2 text-xs text-teal-700 font-semibold">
              {overallTaskProgress}% overall progress
            </div>
          </div>

          <div className="rounded-xl border border-gold-500/20 bg-white p-5 shadow-card hover:border-gold-500/35 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900/70 uppercase tracking-wider">
                Allocated Budget (₹)
              </span>
              <div className="h-7 w-7 rounded-lg bg-gold-50/80 border border-gold-500/30 flex items-center justify-center text-gold-600">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-teal-950">
                {formatINR(totalActualExpense, true)}
              </span>
              <span className="text-xs text-teal-900/60">/ {formatINR(totalBudget, true)}</span>
            </div>
            <div className={`mt-2 text-xs font-bold ${isBudgetWarning ? "text-rose-600" : "text-status-attending"}`}>
              {budgetSpentPercent}% used {isBudgetWarning && "— Threshold Alert"}
            </div>
          </div>
        </div>

        {/* 3 Core Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Widget 1: Interactive Checklist */}
          <div className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-teal-950">Milestone Checklist</h2>
                  <p className="text-xs text-teal-900/60 mt-0.5">Critical path logistics</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-coral-500" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-teal-900/70">Completion Velocity</span>
                  <span className="text-teal-950 font-bold">{overallTaskProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-900 transition-all duration-500"
                    style={{ width: `${overallTaskProgress}%` }}
                  />
                </div>
              </div>

              {/* Task Items */}
              <div className="mt-6 space-y-3">
                {currentEvent.checklist.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-start justify-between rounded-xl border p-3 transition-all ${
                      task.completed
                        ? "border-teal-900/5 bg-surface/60 opacity-80"
                        : "border-teal-900/10 bg-white hover:border-teal-900/20"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer flex-1 mr-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-0.5 h-4 w-4 rounded border-teal-900/30 text-teal-900 focus:ring-teal-900 cursor-pointer"
                      />
                      <div>
                        <p
                          className={`text-sm font-medium leading-snug ${
                            task.completed
                              ? "line-through text-teal-900/50"
                              : "text-teal-950"
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-coral-500">
                          {task.category}
                        </span>
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-teal-900/40 hover:text-coral-500 transition-opacity p-1"
                      title="Remove task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-teal-900/5 text-xs text-teal-900/60 flex items-center justify-between">
              <span>Auto-calculates schedule milestones</span>
              <Sparkles className="h-3.5 w-3.5 text-coral-400" />
            </div>
          </div>

          {/* Widget 2: Live RSVP & Guest Tracker */}
          <div className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-teal-950">Guest Roster</h2>
                  <p className="text-xs text-teal-900/60 mt-0.5">Real-time RSVP & table assignments</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-coral-500" />
                  <span>Add Guest</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="mt-5 flex gap-1 rounded-lg bg-surface p-1 text-xs font-medium">
                {(["all", "attending", "pending", "declined"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGuestTab(tab)}
                    className={`flex-1 py-1.5 rounded-md capitalize transition-all ${
                      guestTab === tab
                        ? "bg-white text-teal-950 shadow-sm font-semibold"
                        : "text-teal-900/60 hover:text-teal-950"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-teal-900/40" />
                <input
                  type="text"
                  placeholder="Search guest or dietary..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full rounded-lg border border-teal-900/10 bg-surface pl-8 pr-3 py-1.5 text-xs text-teal-950 placeholder-teal-900/40 focus:border-teal-900 focus:outline-none"
                />
              </div>

              {/* Guest Roster List */}
              <div className="mt-4 max-h-[360px] overflow-y-auto space-y-2 pr-1">
                {filteredGuests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-teal-900/50">
                    No guests matching criteria
                  </div>
                ) : (
                  filteredGuests.map((guest) => {
                    const isSeated = guest.tableId !== null;
                    return (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between rounded-lg border border-teal-900/5 bg-surface/40 p-2.5 text-xs hover:bg-surface transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-teal-950 truncate">{guest.name}</span>
                            {guest.vip && (
                              <span className="rounded bg-coral-100 px-1 py-0.2 text-[10px] font-bold text-coral-600 uppercase">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-teal-900/60">
                            <span>{guest.dietary}</span>
                            <span>•</span>
                            <span className={isSeated ? "text-teal-800 font-medium" : "text-coral-500 italic"}>
                              {isSeated ? `Table: ${guest.tableId}` : "Unseated"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Door Check-In Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleCheckIn(guest.id)}
                            className={`rounded-md px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition-all ${
                              guest.checkedIn
                                ? "bg-emerald-100 text-status-attending border border-emerald-300"
                                : "bg-white border border-gold-500/25 text-teal-900/60 hover:bg-gold-50"
                            }`}
                            title={guest.checkedIn ? `Checked in at ${guest.checkInTime || "venue"}. Click to toggle.` : "Click to mark arrived at venue"}
                          >
                            <CheckCircle2 className={`h-3 w-3 ${guest.checkedIn ? "text-status-attending" : "text-teal-900/40"}`} />
                            <span>{guest.checkedIn ? guest.checkInTime || "Arrived" : "Check In"}</span>
                          </button>

                          {/* Digital Pass & Creative QR Trigger */}
                          <button
                            type="button"
                            onClick={() => setViewingPassGuest(guest)}
                            className="rounded-md border border-gold-500/25 bg-gold-50/70 p-1 text-gold-700 hover:bg-gold-100 hover:text-gold-800 transition-colors shadow-xs"
                            title="View guest's luxury Digital Table Pass & Creative QR Code"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>

                          {/* Status Toggle Dropdown */}
                          <select
                            value={guest.status}
                            onChange={(e) => updateGuestStatus(guest.id, e.target.value as GuestStatus)}
                            className={`rounded border-0 text-[11px] font-semibold py-1 px-1.5 cursor-pointer ${
                              guest.status === "attending"
                                ? "bg-emerald-50 text-status-attending"
                                : guest.status === "pending"
                                ? "bg-amber-50 text-status-pending"
                                : "bg-rose-50 text-status-declined"
                            }`}
                          >
                            <option value="attending">Attending</option>
                            <option value="pending">Pending</option>
                            <option value="declined">Declined</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-teal-900/5 flex items-center justify-between text-xs text-teal-900/60">
              <span>{seatedGuests} seated on floor plan</span>
              <Link href="/floor-plan" className="font-semibold text-coral-500 hover:underline">
                Open Floor Plan &rarr;
              </Link>
            </div>
          </div>

          {/* Widget 3: Visual Budget Gauge (Interactive Budget Planning) */}
          <div className="rounded-2xl border border-gold-500/20 bg-white p-6 shadow-card flex flex-col justify-between hover:border-gold-500/35 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-teal-950">Visual Budget Gauge</h2>
                  <p className="text-xs text-teal-900/60 mt-0.5">Estimated vs. committed invoices in INR (₹)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      isBudgetWarning
                        ? "bg-rose-50 text-rose-600 animate-pulse border border-rose-200"
                        : "bg-emerald-50 text-status-attending border border-emerald-200"
                    }`}
                  >
                    {isBudgetWarning ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    <span>{isBudgetWarning ? "> 85% Alert" : "Healthy Range"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Budget Planning */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBudgetInput(currentEvent.budget.totalBudget);
                    setIsBudgetModalOpen(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gold-500/30 bg-gold-50/70 px-3 py-1.5 text-xs font-semibold text-teal-950 hover:bg-gold-100 transition-colors shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5 text-gold-600" />
                  <span>Update Budget Cap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-900 px-3 py-1.5 text-xs font-semibold text-gold-300 border border-gold-500/30 hover:bg-teal-950 transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 text-gold-400" />
                  <span>Add Expense</span>
                </button>
              </div>

              {/* Gauge Meter */}
              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-teal-900/70 font-semibold">Total Cap: {formatINR(totalBudget)}</span>
                  <span className="text-teal-950 font-bold">{formatINR(totalActualExpense)} spent</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-surface overflow-hidden p-0.5 border border-gold-500/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBudgetWarning ? "bg-rose-500" : "bg-gradient-to-r from-teal-900 via-gold-600 to-gold-500"
                    }`}
                    style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-teal-900/60">
                  <span>0%</span>
                  <span className="font-semibold text-gold-700">85% Alert Line</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-teal-900/70">
                  <span>Committed Expenses</span>
                  <span className="text-[11px] font-normal normal-case text-gold-700">
                    {currentEvent.budget.expenses.length} Line Items
                  </span>
                </div>
                <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                  {currentEvent.budget.expenses.map((expense) => {
                    const percentOfBudget = Math.round((expense.actual / totalBudget) * 100);
                    const isOver = expense.actual > expense.estimated;
                    return (
                      <div key={expense.id} className="group rounded-lg border border-gold-500/15 bg-surface/50 p-2 text-xs hover:border-gold-500/30 transition-all">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-teal-950 font-semibold truncate mr-2">{expense.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-teal-950 font-bold">{formatINR(expense.actual)}</span>
                            <button
                              type="button"
                              onClick={() => deleteBudgetItem(expense.id)}
                              className="opacity-0 group-hover:opacity-100 text-teal-900/40 hover:text-rose-600 transition-opacity p-0.5"
                              title="Delete expense"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-teal-900/60">
                          <span className="font-medium text-gold-700">{expense.category}</span>
                          <span className={isOver ? "text-rose-600 font-semibold" : "text-emerald-700"}>
                            Est: {formatINR(expense.estimated)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/80 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                            style={{ width: `${Math.min(percentOfBudget * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gold-500/15 flex items-center justify-between text-xs text-teal-900/70">
              <span className="font-medium">Remaining reserve:</span>
              <span className="font-serif text-sm font-bold text-teal-950">
                {formatINR(Math.max(totalBudget - totalActualExpense, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-teal-900/10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-teal-900/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-teal-950">Add Custom Milestone</h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-teal-900/50 hover:text-teal-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teal-900/70 uppercase">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Review Champagne Toast Vintage"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-teal-900/15 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-teal-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900/70 uppercase">
                  Category
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-teal-900/15 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-teal-900 focus:outline-none"
                >
                  <option value="Venue & Catering">Venue & Catering</option>
                  <option value="Florals & Decor">Florals & Decor</option>
                  <option value="Audio & Lighting">Audio & Lighting</option>
                  <option value="Guest Experience">Guest Experience</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Creation Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-teal-900/10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-teal-900/10 pb-3">
              <h3 className="font-serif text-lg font-bold text-teal-950">Add Guest</h3>
              <button
                type="button"
                onClick={() => setIsGuestModalOpen(false)}
                className="text-teal-900/50 hover:text-teal-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGuest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teal-900/70 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shalini Singhania"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-teal-900/15 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-teal-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900/70 uppercase">
                  Dietary Requirements
                </label>
                <input
                  type="text"
                  placeholder="e.g., Vegetarian, Nut Allergy, Kosher"
                  value={newGuestDietary}
                  onChange={(e) => setNewGuestDietary(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-teal-900/15 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-teal-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teal-900/70 uppercase">
                    RSVP Status
                  </label>
                  <select
                    value={newGuestStatus}
                    onChange={(e) => setNewGuestStatus(e.target.value as GuestStatus)}
                    className="mt-1.5 w-full rounded-lg border border-teal-900/15 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-teal-900 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-teal-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGuestVip}
                      onChange={(e) => setNewGuestVip(e.target.checked)}
                      className="h-4 w-4 rounded border-gold-500/40 text-gold-600 focus:ring-gold-500"
                    />
                    <span>VIP Designation</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-gold-300 border border-gold-500/30 hover:bg-teal-950 transition-colors shadow-sm"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Update Budget Allocation Modal (Update budget while planning) */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gold-500/30 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">Financial Telemetry</span>
                <h3 className="font-serif text-lg font-bold text-teal-950">Update Allocated Budget</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-teal-900/50 hover:text-teal-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBudget} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Total Event Budget (₹)
                  </label>
                  <span className="text-xs font-bold text-gold-600">
                    {formatINR(Number(budgetInput) || 0, true)}
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-gold-600">₹</span>
                  <input
                    type="number"
                    required
                    min={50000}
                    max={1000000000}
                    step={50000}
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-gold-500/25 bg-surface pl-8 pr-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none font-semibold"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-teal-900/60 leading-normal">
                  Adjusting the total budget dynamically recalibrates the visual threshold gauge, reserve liquidity, and category percentages for <strong>{currentEvent.title}</strong>.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] font-medium text-teal-900/70 mb-1.5">
                  Quick Amount Presets:
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[2500000, 5000000, 8500000, 10000000, 15000000, 25000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudgetInput(preset)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
                        budgetInput === preset
                          ? "bg-teal-900 text-gold-300 border-gold-500/50 shadow-sm"
                          : "border-gold-500/20 bg-gold-50/50 text-teal-900 hover:bg-gold-100/60"
                      }`}
                    >
                      {formatINR(preset, true)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-gold-500/10">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-900 px-5 py-2 text-xs font-semibold text-gold-300 border border-gold-500/30 hover:bg-teal-950 transition-colors shadow-sm"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Expense Item Modal (Add expenses while planning) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gold-500/30 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">Cost Accounting</span>
                <h3 className="font-serif text-lg font-bold text-teal-950">Add Expense Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-teal-900/50 hover:text-teal-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                  Expense Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Palace Courtyard & Mandap Decor"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                  Category
                </label>
                <select
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                >
                  <option value="Venue & Heritage Rental">Venue & Heritage Rental</option>
                  <option value="Royal Catering & Bar">Royal Catering & Bar</option>
                  <option value="Floral Architecture & Mandap">Floral Architecture & Mandap</option>
                  <option value="Lighting & Sangeet AV">Lighting & Sangeet AV</option>
                  <option value="Photography & Cinema">Photography & Cinema</option>
                  <option value="Entertainment & Artists">Entertainment & Artists</option>
                  <option value="Logistics & Valet Fleet">Logistics & Valet Fleet</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Estimated (₹)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-gold-600">₹</span>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={5000}
                      value={newExpenseEstimated}
                      onChange={(e) => setNewExpenseEstimated(Number(e.target.value))}
                      className="w-full rounded-lg border border-gold-500/25 bg-surface pl-6 pr-2 py-1.5 text-xs text-teal-950 focus:border-gold-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Committed / Actual (₹)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-gold-600">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={5000}
                      value={newExpenseActual}
                      onChange={(e) => setNewExpenseActual(Number(e.target.value))}
                      className="w-full rounded-lg border border-gold-500/25 bg-surface pl-6 pr-2 py-1.5 text-xs text-teal-950 focus:border-gold-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-gold-500/10">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-900 px-5 py-2 text-xs font-semibold text-gold-300 border border-gold-500/30 hover:bg-teal-950 transition-colors shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Plan New Event Modal (Allocate budget to each new event planned) */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gold-500/30 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">Bespoke Suite</span>
                <h3 className="font-serif text-lg font-bold text-teal-950">Plan New Event & Allocate Budget</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-teal-900/50 hover:text-teal-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNewEvent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Singhania Royal Palace Wedding"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                  >
                    <option value="Wedding">Royal Wedding</option>
                    <option value="Corporate">Corporate Summit</option>
                    <option value="Gala">Charity Gala</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Target Guests
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={newEventGuests}
                    onChange={(e) => setNewEventGuests(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="e.g., December 18, 2026"
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teal-900/80 uppercase">
                    Venue Location
                  </label>
                  <input
                    type="text"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    placeholder="e.g., Taj Lake Palace, Udaipur"
                    className="mt-1.5 w-full rounded-lg border border-gold-500/25 bg-surface px-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dedicated Budget Allocation Field */}
              <div className="rounded-xl border border-gold-500/30 bg-gold-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider">
                    Allocated Total Budget (₹)
                  </label>
                  <span className="font-serif text-sm font-bold text-gold-700">
                    {formatINR(Number(newEventBudget) || 0, true)}
                  </span>
                </div>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-gold-600">₹</span>
                  <input
                    type="number"
                    required
                    min={100000}
                    max={1000000000}
                    step={100000}
                    value={newEventBudget}
                    onChange={(e) => setNewEventBudget(Number(e.target.value))}
                    className="w-full rounded-lg border border-gold-500/40 bg-white pl-8 pr-3 py-2 text-sm text-teal-950 focus:border-gold-500 focus:outline-none font-semibold shadow-inner"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-teal-900/70">
                  This allocates the initial capital cap for <strong>{newEventTitle || "this new event"}</strong>. You can fine-tune or adjust this budget anytime from the dashboard.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-gold-500/10">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-teal-900 hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 px-5 py-2 text-xs font-semibold text-white shadow-gold-glow hover:brightness-110 transition-all"
                >
                  Create & Allocate Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export & Manifests Creative Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTab={exportModalTab}
      />

      {/* Guest Digital Table Pass Modal */}
      {viewingPassGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              type="button"
              onClick={() => setViewingPassGuest(null)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-teal-950 border border-gold-400 text-gold-300 p-1.5 shadow-lg hover:bg-teal-900 transition-colors"
              title="Close pass"
            >
              <X className="h-4 w-4" />
            </button>
            <DigitalTablePass
              guest={viewingPassGuest}
              event={currentEvent}
              table={currentEvent.floorPlan.find((f) => f.id === viewingPassGuest.tableId)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
