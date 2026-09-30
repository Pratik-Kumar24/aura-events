"use client";

import React, { useState } from "react";
import {
  Printer,
  Download,
  FileText,
  Utensils,
  Users,
  IndianRupee,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useEventStore, Guest, FloorItem } from "@/store/useEventStore";
import { formatINR } from "@/lib/formatINR";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "catering" | "seating" | "budget";
}

export default function ExportModal({
  isOpen,
  onClose,
  defaultTab = "catering",
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"catering" | "seating" | "budget">(defaultTab);
  const activeEvent = useEventStore((s) => s.getActiveEvent());

  if (!isOpen || !activeEvent) return null;

  // 1. Dietary Calculations
  const attendingGuests = activeEvent.guests.filter((g) => g.status === "attending");
  const dietaryCounts: Record<string, number> = {};
  attendingGuests.forEach((g) => {
    const diet = g.dietary || "Standard";
    dietaryCounts[diet] = (dietaryCounts[diet] || 0) + 1;
  });

  // Critical allergy alerts
  const criticalAllergies = attendingGuests.filter((g) =>
    ["nut allergy", "peanut", "shellfish", "severe", "celiac"].some((a) =>
      g.dietary.toLowerCase().includes(a)
    )
  );

  // 2. Seating Map (Table -> Guests)
  const tables = activeEvent.floorPlan.filter((f) => f.capacity > 0);
  const tableSeatingMap: Record<string, { table: FloorItem; guests: Guest[] }> = {};
  tables.forEach((t) => {
    tableSeatingMap[t.id] = {
      table: t,
      guests: activeEvent.guests.filter((g) => g.tableId === t.id),
    };
  });

  // Alphabetical Guest List
  const alphabetizedGuests = [...activeEvent.guests].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // 3. Financial calculations
  const totalBudget = activeEvent.budget.totalBudget;
  const totalActual = activeEvent.budget.expenses.reduce((s, e) => s + e.actual, 0);
  const totalEstimated = activeEvent.budget.expenses.reduce((s, e) => s + e.estimated, 0);
  const totalVariance = totalActual - totalEstimated;

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel

    if (activeTab === "catering") {
      csvContent += `AURA EVENTS - CATERING & DIETARY MANIFEST\n`;
      csvContent += `Event: "${activeEvent.title}",Date: "${activeEvent.date}",Venue: "${activeEvent.venueName}"\n\n`;
      csvContent += `DIETARY SUMMARY\nRequirement,Count,Percentage\n`;
      Object.entries(dietaryCounts).forEach(([diet, count]) => {
        const pct = Math.round((count / (attendingGuests.length || 1)) * 100);
        csvContent += `"${diet}",${count},"${pct}%"\n`;
      });
      csvContent += `\nTABLE-BY-TABLE BREAKDOWN\nTable,Seat,Guest Name,Dietary Requirement,VIP Status,Checked In\n`;
      tables.forEach((tbl) => {
        const seated = tableSeatingMap[tbl.id]?.guests || [];
        seated.forEach((g) => {
          csvContent += `"${tbl.label}",Seat ${(g.seatIndex ?? 0) + 1},"${g.name}","${g.dietary}","${g.vip ? "VIP" : "Standard"}","${g.checkedIn ? "Yes" : "No"}"\n`;
        });
      });
    } else if (activeTab === "seating") {
      csvContent += `AURA EVENTS - MASTER GUEST SEATING DIRECTORY\n`;
      csvContent += `Event: "${activeEvent.title}",Date: "${activeEvent.date}",Venue: "${activeEvent.venueName}"\n\n`;
      csvContent += `Guest Name,RSVP Status,Table Assignment,Seat #,Dietary Requirement,VIP,Checked In,Arrival Time\n`;
      alphabetizedGuests.forEach((g) => {
        const tbl = activeEvent.floorPlan.find((f) => f.id === g.tableId);
        const tableName = tbl ? tbl.label : "Unseated";
        const seatNo = g.seatIndex !== null ? (g.seatIndex + 1).toString() : "-";
        csvContent += `"${g.name}","${g.status}","${tableName}","${seatNo}","${g.dietary}","${g.vip ? "YES" : "NO"}","${g.checkedIn ? "YES" : "NO"}","${g.checkInTime || "-"}"\n`;
      });
    } else {
      csvContent += `AURA EVENTS - FINANCIAL EXPENSE LEDGER (INR)\n`;
      csvContent += `Event: "${activeEvent.title}",Total Budget Cap: "${formatINR(totalBudget)}",Total Spent: "${formatINR(totalActual)}"\n\n`;
      csvContent += `Line Item Name,Category,Estimated (INR),Committed Actual (INR),Variance (INR),Variance %\n`;
      activeEvent.budget.expenses.forEach((e) => {
        const diff = e.actual - e.estimated;
        const diffPct = e.estimated > 0 ? Math.round((diff / e.estimated) * 100) : 0;
        csvContent += `"${e.name}","${e.category}",${e.estimated},${e.actual},${diff},"${diffPct}%"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `aura-${activeEvent.id}-${activeTab}-manifest-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-gold-500/30 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Header */}
        <div className="flex items-center justify-between border-b border-gold-500/20 bg-porcelain px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-950 to-teal-900 border border-gold-500/40 text-gold-400 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
                  Executive Suite
                </span>
                <span className="rounded bg-gold-50 border border-gold-500/30 px-1.5 py-0.2 text-[10px] font-semibold text-teal-950">
                  Print & PDF Ready
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-teal-950">
                Official Manifests & Creative Exports
              </h2>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-sm hover:bg-gold-50/70 transition-all"
              title="Download formatted CSV spreadsheet"
            >
              <Download className="h-3.5 w-3.5 text-gold-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-900 px-3.5 py-1.5 text-xs font-semibold text-gold-300 border border-gold-500/30 shadow-md hover:bg-teal-950 hover:shadow-gold-glow transition-all"
              title="Open print view or save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-gold-400" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-teal-900/50 hover:bg-teal-50 hover:text-teal-950 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gold-500/15 bg-white px-6">
          {[
            { id: "catering" as const, label: "Catering & Dietary Manifest", icon: Utensils },
            { id: "seating" as const, label: "Master Seating Directory", icon: Users },
            { id: "budget" as const, label: "Financial Ledger (INR ₹)", icon: IndianRupee },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3.5 px-4 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-gold-600 text-teal-950 font-bold"
                    : "border-transparent text-teal-900/60 hover:text-teal-950 hover:border-gold-300"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-gold-600" : "text-teal-900/40"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-surface/30">
          {/* Printable Document Sheet Frame */}
          <div
            id="printable-manifest"
            className="mx-auto max-w-4xl bg-white p-8 sm:p-10 rounded-2xl border border-gold-500/30 shadow-card"
          >
            {/* Editorial Letterhead */}
            <div className="border-b-2 border-gold-500/30 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-950 flex items-center justify-center font-serif text-sm font-bold text-gold-400 border border-gold-500/40">
                    A
                  </div>
                  <span className="font-serif text-base font-bold tracking-widest text-teal-950 uppercase">
                    Aura Events
                  </span>
                  <span className="text-[10px] tracking-widest text-gold-600 uppercase font-sans">
                    • Official Dispatch
                  </span>
                </div>
                <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-teal-950">
                  {activeEvent.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-teal-900/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold-600" />
                    {activeEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-gold-600" />
                    {activeEvent.venueName}
                  </span>
                  <span className="flex items-center gap-1.5 text-status-attending font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Confirmed Manifest
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="font-serif text-xs font-bold text-gold-700 uppercase tracking-widest">
                  {activeTab === "catering"
                    ? "Kitchen & Banqueting Manifest"
                    : activeTab === "seating"
                    ? "Concierge Door Directory"
                    : "Audited Financial Telemetry"}
                </div>
                <div className="text-[11px] text-teal-900/60 mt-0.5">
                  Generated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
                </div>
                <div className="mt-1 text-[10px] font-mono text-gold-700 bg-gold-50 border border-gold-500/20 px-2 py-0.5 rounded inline-block">
                  REF: AURA-{activeEvent.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>

            {/* TAB 1: Catering & Dietary Manifest */}
            {activeTab === "catering" && (
              <div className="mt-6 space-y-6">
                {/* Critical Allergy Warning Box if present */}
                {criticalAllergies.length > 0 && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Critical Food Allergy Alerts — Immediate Kitchen Notice</span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950">
                      {criticalAllergies.map((g) => (
                        <div key={g.id} className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-amber-200">
                          <span className="font-bold">{g.name}:</span>
                          <span className="font-semibold text-rose-700">{g.dietary}</span>
                          <span className="text-[11px] text-teal-900/60">
                            ({g.tableId ? `Table: ${g.tableId}` : "Unseated"})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Distribution Grid */}
                <div>
                  <h3 className="font-serif text-sm font-bold text-teal-950 uppercase tracking-wider mb-3">
                    Master Dietary Distribution ({attendingGuests.length} Confirmed Covers)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(dietaryCounts).map(([diet, count]) => {
                      const pct = Math.round((count / (attendingGuests.length || 1)) * 100);
                      return (
                        <div
                          key={diet}
                          className="rounded-xl border border-gold-500/25 bg-porcelain p-3 text-center"
                        >
                          <div className="font-serif text-2xl font-bold text-teal-950">{count}</div>
                          <div className="text-xs font-semibold text-gold-700 mt-0.5">{diet}</div>
                          <div className="text-[10px] text-teal-900/50 mt-1">{pct}% of covers</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Table-by-Table Meal Requirements */}
                <div className="mt-8">
                  <h3 className="font-serif text-sm font-bold text-teal-950 uppercase tracking-wider mb-3">
                    Table-by-Table Plating Manifest
                  </h3>
                  <div className="space-y-4">
                    {tables.map((table) => {
                      const seated = tableSeatingMap[table.id]?.guests || [];
                      return (
                        <div
                          key={table.id}
                          className="rounded-xl border border-gold-500/20 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between border-b border-gold-500/15 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-bold text-teal-950">
                                {table.label}
                              </span>
                              <span className="text-[11px] text-gold-600 font-mono">
                                ({table.type} • {seated.length}/{table.capacity} seated)
                              </span>
                            </div>
                            <span className="text-xs font-bold text-teal-900/70">
                              Plating Covers: {seated.length}
                            </span>
                          </div>

                          {seated.length === 0 ? (
                            <div className="py-2 text-xs italic text-teal-900/40">
                              No guests seated at this table yet.
                            </div>
                          ) : (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {seated.map((guest) => (
                                <div
                                  key={guest.id}
                                  className="flex items-center justify-between rounded-lg bg-surface/50 border border-gold-500/10 p-2 text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-teal-950 flex items-center gap-1">
                                      <span>Seat {(guest.seatIndex ?? 0) + 1}: {guest.name}</span>
                                      {guest.vip && (
                                        <span className="rounded bg-gold-500 text-white text-[9px] font-bold px-1">
                                          VIP
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-medium text-gold-700 mt-0.5">
                                      {guest.dietary}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sign-off & Verification Section */}
                <div className="mt-10 pt-6 border-t border-gold-500/25 grid grid-cols-2 gap-8 text-xs text-teal-900/70">
                  <div>
                    <div className="font-semibold text-teal-950">Executive Chef Signature:</div>
                    <div className="mt-8 border-b border-dashed border-teal-900/40 w-48" />
                    <div className="mt-1 text-[11px]">Rosewood Culinary Director</div>
                  </div>
                  <div>
                    <div className="font-semibold text-teal-950">Banqueting Captain Signature:</div>
                    <div className="mt-8 border-b border-dashed border-teal-900/40 w-48" />
                    <div className="mt-1 text-[11px]">Head of Floor Hospitality</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Master Guest Seating Directory */}
            {activeTab === "seating" && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between text-xs text-teal-900/70 border-b border-gold-500/15 pb-2">
                  <span>
                    Total Guests: <strong>{alphabetizedGuests.length}</strong> ({attendingGuests.length} Confirmed,{" "}
                    {alphabetizedGuests.filter((g) => g.status === "pending").length} Pending)
                  </span>
                  <span>Alphabetical Concierge Roster</span>
                </div>

                {/* Table Roster */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gold-500/30 text-teal-900 font-bold uppercase text-[10px] tracking-wider bg-gold-50/60">
                        <th className="py-2.5 px-3">Guest Name</th>
                        <th className="py-2.5 px-2">RSVP</th>
                        <th className="py-2.5 px-3">Assigned Table</th>
                        <th className="py-2.5 px-2">Seat #</th>
                        <th className="py-2.5 px-3">Dietary</th>
                        <th className="py-2.5 px-2">VIP</th>
                        <th className="py-2.5 px-2">Door Check-In</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {alphabetizedGuests.map((guest) => {
                        const table = activeEvent.floorPlan.find((f) => f.id === guest.tableId);
                        return (
                          <tr key={guest.id} className="hover:bg-gold-50/40 transition-colors">
                            <td className="py-2 px-3 font-semibold text-teal-950">
                              {guest.name}
                            </td>
                            <td className="py-2 px-2 capitalize">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  guest.status === "attending"
                                    ? "bg-emerald-50 text-status-attending"
                                    : guest.status === "pending"
                                    ? "bg-amber-50 text-status-pending"
                                    : "bg-rose-50 text-status-declined"
                                }`}
                              >
                                {guest.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-medium text-teal-900">
                              {table ? table.label : <span className="text-coral-500 italic">Unseated</span>}
                            </td>
                            <td className="py-2 px-2 font-mono">
                              {guest.seatIndex !== null ? guest.seatIndex + 1 : "-"}
                            </td>
                            <td className="py-2 px-3 text-gold-700 font-medium">
                              {guest.dietary}
                            </td>
                            <td className="py-2 px-2">
                              {guest.vip ? (
                                <span className="rounded bg-gold-500 text-white px-1.5 py-0.5 text-[9px] font-bold">
                                  VIP
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {guest.checkedIn ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-attending">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>{guest.checkInTime || "Arrived"}</span>
                                </span>
                              ) : (
                                <span className="text-teal-900/40 italic">Awaiting</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Financial Telemetry & Expense Ledger */}
            {activeTab === "budget" && (
              <div className="mt-6 space-y-6">
                {/* Financial KPI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gold-500/25 bg-porcelain p-4 text-center">
                    <span className="text-[10px] font-bold text-teal-900/70 uppercase tracking-wider">
                      Total Allocated Budget
                    </span>
                    <div className="font-serif text-2xl font-bold text-teal-950 mt-1">
                      {formatINR(totalBudget)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gold-500/25 bg-porcelain p-4 text-center">
                    <span className="text-[10px] font-bold text-teal-900/70 uppercase tracking-wider">
                      Committed Actual Outlay
                    </span>
                    <div className="font-serif text-2xl font-bold text-teal-950 mt-1">
                      {formatINR(totalActual)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gold-500/25 bg-porcelain p-4 text-center">
                    <span className="text-[10px] font-bold text-teal-900/70 uppercase tracking-wider">
                      Remaining Capital Reserve
                    </span>
                    <div className="font-serif text-2xl font-bold text-emerald-700 mt-1">
                      {formatINR(Math.max(0, totalBudget - totalActual))}
                    </div>
                  </div>
                </div>

                {/* Expense Ledger Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gold-500/30 text-teal-900 font-bold uppercase text-[10px] tracking-wider bg-gold-50/60">
                        <th className="py-2.5 px-3">Expense Item</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Estimated (₹)</th>
                        <th className="py-2.5 px-3 text-right">Committed Actual (₹)</th>
                        <th className="py-2.5 px-3 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {activeEvent.budget.expenses.map((item) => {
                        const variance = item.actual - item.estimated;
                        const isOver = variance > 0;
                        return (
                          <tr key={item.id} className="hover:bg-gold-50/40 transition-colors">
                            <td className="py-2 px-3 font-semibold text-teal-950">
                              {item.name}
                            </td>
                            <td className="py-2 px-3 text-gold-700 font-medium">
                              {item.category}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-teal-900/70">
                              {formatINR(item.estimated)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-teal-950">
                              {formatINR(item.actual)}
                            </td>
                            <td className={`py-2 px-3 text-right font-mono font-semibold ${isOver ? "text-rose-600" : "text-emerald-700"}`}>
                              {isOver ? `+${formatINR(variance)}` : `-${formatINR(Math.abs(variance))}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gold-500/30 font-bold bg-gold-50/60 text-teal-950">
                        <td className="py-3 px-3" colSpan={2}>
                          Total Consolidated Expenditure
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {formatINR(totalEstimated)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {formatINR(totalActual)}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono ${totalVariance > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                          {totalVariance > 0 ? `+${formatINR(totalVariance)}` : `-${formatINR(Math.abs(totalVariance))}`}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="mt-8 pt-4 border-t border-gold-500/20 text-[11px] text-teal-900/60 flex items-center justify-between">
                  <span>Audited against Reserve Thresholds (85% Trigger Warning)</span>
                  <span className="font-semibold text-gold-700">Financial Integrity Verified</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
