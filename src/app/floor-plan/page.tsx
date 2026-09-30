"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Grid3X3,
  Users,
  Plus,
  Trash2,
  RotateCw,
  Move,
  Info,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  UserX,
  Search,
  Maximize2,
  CheckCircle2,
  Utensils,
  Compass,
  Printer,
} from "lucide-react";
import { useEventStore, FloorItem, FloorItemType, Guest } from "@/store/useEventStore";
import ExportModal from "@/components/ExportModal";

export default function FloorPlanPage() {
  const {
    activeEventId,
    events,
    assignSeat,
    unseatGuest,
    addFloorItem,
    updateFloorItemPosition,
    updateFloorItemRotation,
    deleteFloorItem,
  } = useEventStore();

  const currentEvent = events[activeEventId] || events["sharma-verma-wedding"] || Object.values(events)[0];

  // Canvas Viewport & Interaction State
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Click-to-seat / Drag-to-seat Accessibility Mode
  // If activeSelectedGuestId is set, empty seats light up and clicking a seat places the guest!
  const [activeSelectedGuestId, setActiveSelectedGuestId] = useState<string | null>(null);
  const [hoveredSeatInfo, setHoveredSeatInfo] = useState<{
    tableId: string;
    seatIndex: number;
    guest: Guest | null;
    x: number;
    y: number;
  } | null>(null);

  const [unseatedSearch, setUnseatedSearch] = useState("");

  // Unseated & Seated Lists
  const unseatedGuests = currentEvent.guests.filter(
    (g) => g.tableId === null && g.status !== "declined"
  );
  const filteredUnseated = unseatedGuests.filter((g) =>
    g.name.toLowerCase().includes(unseatedSearch.toLowerCase()) ||
    g.dietary.toLowerCase().includes(unseatedSearch.toLowerCase())
  );

  const seatedCount = currentEvent.guests.filter((g) => g.tableId !== null).length;
  const totalCapacity = currentEvent.floorPlan.reduce((acc, item) => acc + item.capacity, 0);

  // Furniture Templates for Left Toolbar
  const furnitureTemplates: { type: FloorItemType; label: string; capacity: number; desc: string }[] = [
    { type: "round-table", label: "Round Table", capacity: 8, desc: "8-person banquet round" },
    { type: "rect-table", label: "Imperial Table", capacity: 10, desc: "10-person rectangular" },
    { type: "stage", label: "Main Stage", capacity: 0, desc: "Raised performance riser" },
    { type: "dance-floor", label: "Dance Floor", capacity: 0, desc: "Polished parquet floor" },
    { type: "bar", label: "Cocktail Bar", capacity: 0, desc: "Mixology & lounge counter" },
  ];

  // Add Item to Canvas
  const handleAddTemplate = (tpl: typeof furnitureTemplates[0]) => {
    // Stagger placement around center
    const offset = (currentEvent.floorPlan.length % 5) * 30;
    addFloorItem({
      type: tpl.type,
      label: `${tpl.label} ${currentEvent.floorPlan.length + 1}`,
      x: 260 + offset,
      y: 180 + offset,
      rotation: 0,
      capacity: tpl.capacity,
    });
  };

  // Canvas Mouse Dragging for Floor Items
  const handleItemMouseDown = (e: React.MouseEvent, item: FloorItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setIsDraggingItem(item.id);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - item.x,
        y: e.clientY - rect.top - item.y,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingItem || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let rawX = e.clientX - rect.left - dragOffset.x;
    let rawY = e.clientY - rect.top - dragOffset.y;

    if (gridSnap) {
      rawX = Math.round(rawX / 20) * 20;
      rawY = Math.round(rawY / 20) * 20;
    }

    // Keep within bounds
    const boundedX = Math.max(40, Math.min(rawX, 860));
    const boundedY = Math.max(40, Math.min(rawY, 620));

    updateFloorItemPosition(isDraggingItem, boundedX, boundedY);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingItem(null);
  };

  // Rotate Selected Item
  const handleRotateSelected = () => {
    if (!selectedItemId) return;
    const item = currentEvent.floorPlan.find((i) => i.id === selectedItemId);
    if (!item) return;
    const nextRot = (item.rotation + 45) % 360;
    updateFloorItemRotation(selectedItemId, nextRot);
  };

  // Seat Click Handler
  const handleSeatClick = (tableId: string, seatIndex: number, currentGuest: Guest | null) => {
    if (activeSelectedGuestId) {
      // Assign selected guest to this seat
      assignSeat(activeSelectedGuestId, tableId, seatIndex);
      setActiveSelectedGuestId(null);
    } else if (currentGuest) {
      // Unseat guest on click or show quick action
      unseatGuest(currentGuest.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-porcelain overflow-hidden select-none">
      {/* Sub-Header Studio Bar */}
      <div className="flex h-14 items-center justify-between border-b border-gold-500/20 bg-white/95 px-4 sm:px-6 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold text-teal-900/70 hover:text-teal-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-gold-500/20" />
          <h1 className="font-serif text-lg font-bold text-teal-950">2D Seating Studio</h1>
          <span className="rounded-full bg-gold-50/80 border border-gold-500/25 px-2.5 py-0.5 text-xs font-semibold text-teal-950">
            {currentEvent.title}
          </span>
        </div>

        {/* Live Seating Stats & Canvas Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="text-teal-900/70">
              Assigned: <strong className="text-teal-950">{seatedCount}</strong> / {totalCapacity} seats
            </span>
            <span className="h-3 w-px bg-gold-500/20" />
            <span className="text-gold-700 font-semibold">
              {unseatedGuests.length} unseated
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGridSnap(!gridSnap)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                gridSnap
                  ? "bg-teal-900 text-gold-300 border border-gold-500/30 shadow-sm"
                  : "border border-gold-500/20 text-teal-900 hover:bg-gold-50/50"
              }`}
              title="Snap elements to 20px grid"
            >
              Grid Snap {gridSnap ? "ON" : "OFF"}
            </button>

            {selectedItemId && (
              <>
                <button
                  type="button"
                  onClick={handleRotateSelected}
                  className="rounded-lg border border-gold-500/25 p-1.5 text-teal-900 hover:bg-surface"
                  title="Rotate 45°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteFloorItem(selectedItemId);
                    setSelectedItemId(null);
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100"
                  title="Delete Table / Item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-sm hover:bg-gold-50/70 transition-all active:scale-98"
              title="Print or export seating manifest"
            >
              <Printer className="h-3.5 w-3.5 text-gold-600" />
              <span className="hidden sm:inline">Export Seating</span>
            </button>

            <Link
              href="/venue-tour"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-gold-glow hover:brightness-110 transition-all"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>360° Stager</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio Area: Left Toolbar + Canvas + Right Drawer */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar: Furniture Palette */}
        <div className="w-64 border-r border-gold-500/20 bg-white p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900/80">
              <Grid3X3 className="h-4 w-4 text-gold-600" />
              <span>Furniture Palette</span>
            </div>
            <p className="mt-1 text-[11px] text-teal-900/60 leading-tight">
              Click to insert architectural fixtures onto the canvas.
            </p>

            <div className="mt-4 space-y-2.5">
              {furnitureTemplates.map((tpl) => (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => handleAddTemplate(tpl)}
                  className="w-full text-left rounded-xl border border-gold-500/20 bg-surface/50 p-3 hover:border-gold-500 hover:bg-gold-50/40 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-teal-950 group-hover:text-teal-900">
                      {tpl.label}
                    </div>
                    <div className="text-[11px] text-teal-900/60 mt-0.5">{tpl.desc}</div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gold-500/30 text-teal-900 group-hover:bg-teal-900 group-hover:text-gold-300 transition-colors shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Helper / Instructions */}
          <div className="rounded-xl border border-gold-500/25 bg-gold-50/60 p-3 text-[11px] text-teal-900/80 leading-relaxed">
            <div className="font-semibold text-teal-950 flex items-center gap-1.5 mb-1">
              <Info className="h-3.5 w-3.5 text-gold-600" />
              <span>Seating Instructions</span>
            </div>
            Select an unseated guest from the right drawer, then click any glowing seat dot to assign them. Click an assigned seat to unseat.
          </div>
        </div>

        {/* Center Canvas Area */}
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={() => setSelectedItemId(null)}
          className="relative flex-1 bg-grid-canvas overflow-auto flex items-center justify-center p-8"
        >
          {/* Active Canvas Board: 940px x 680px */}
          <div
            className="relative w-[940px] h-[680px] bg-white rounded-2xl border border-teal-900/15 shadow-card"
            style={{ minWidth: "940px", minHeight: "680px" }}
          >
            {/* Ambient Room Boundary Markers */}
            <div className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-widest text-teal-900/40">
              Rosewood Pavilion — North Terrace Wall
            </div>
            <div className="absolute bottom-3 right-4 text-[10px] font-mono uppercase tracking-widest text-teal-900/40">
              South Garden Entrance
            </div>

            {/* Active Selection / Placement Indicator Banner */}
            {activeSelectedGuestId && (
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white px-3 py-1 text-xs font-semibold shadow-gold-glow animate-bounce">
                <span>Placing: {currentEvent.guests.find((g) => g.id === activeSelectedGuestId)?.name}</span>
                <button
                  type="button"
                  onClick={() => setActiveSelectedGuestId(null)}
                  className="rounded-full bg-white/20 p-0.5 hover:bg-white/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Render Placed Floor Items */}
            {currentEvent.floorPlan.map((item) => {
              const isSelected = selectedItemId === item.id;

              if (item.type === "round-table") {
                const radius = 55;
                const seatRadius = 78;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    className={`absolute cursor-move select-none transition-shadow ${
                      isSelected ? "ring-2 ring-gold-500 shadow-xl rounded-full" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    {/* Table Center Disk */}
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold-500/30 bg-white shadow-md">
                      <div className="text-center">
                        <div className="font-serif text-xs font-bold text-teal-950">{item.label}</div>
                        <div className="text-[10px] text-teal-900/60 font-mono">8 Seats</div>
                      </div>
                    </div>

                    {/* Circular Seats (8) */}
                    {Array.from({ length: 8 }).map((_, seatIdx) => {
                      const angle = (seatIdx / 8) * (2 * Math.PI) - Math.PI / 2;
                      const seatX = 56 + seatRadius * Math.cos(angle);
                      const seatY = 56 + seatRadius * Math.sin(angle);

                      const assignedGuest = currentEvent.guests.find(
                        (g) => g.tableId === item.id && g.seatIndex === seatIdx
                      );

                      const isGlowTarget = activeSelectedGuestId && !assignedGuest;

                      return (
                        <button
                          key={seatIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeatClick(item.id, seatIdx, assignedGuest || null);
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredSeatInfo({
                              tableId: item.label,
                              seatIndex: seatIdx + 1,
                              guest: assignedGuest || null,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredSeatInfo(null)}
                          className={`absolute flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                            assignedGuest
                              ? assignedGuest.vip
                                ? "bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-sm ring-2 ring-gold-400/50"
                                : "bg-teal-900 text-gold-300 shadow-sm"
                              : isGlowTarget
                              ? "border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700 animate-pulse scale-110"
                              : "border border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                          }`}
                          style={{
                            left: `${seatX}px`,
                            top: `${seatY}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                          aria-label={`Seat ${seatIdx + 1} at ${item.label}`}
                        >
                          {assignedGuest
                            ? assignedGuest.name.slice(0, 2).toUpperCase()
                            : seatIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              if (item.type === "rect-table") {
                // Rectangular 10-person table: 4 top, 4 bottom, 1 left, 1 right
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    className={`absolute cursor-move select-none transition-shadow ${
                      isSelected ? "ring-2 ring-gold-500 shadow-xl rounded-xl" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    {/* Rect Table Surface: 220px x 90px */}
                    <div className="relative flex h-24 w-52 items-center justify-center rounded-xl border-2 border-gold-500/30 bg-white shadow-md">
                      <div className="text-center">
                        <div className="font-serif text-xs font-bold text-teal-950">{item.label}</div>
                        <div className="text-[10px] text-teal-900/60 font-mono">10 Seats</div>
                      </div>

                      {/* Top 4 Seats */}
                      <div className="absolute -top-4 left-0 right-0 flex justify-around px-4">
                        {[0, 1, 2, 3].map((seatIdx) => {
                          const guest = currentEvent.guests.find(
                            (g) => g.tableId === item.id && g.seatIndex === seatIdx
                          );
                          const isGlowTarget = activeSelectedGuestId && !guest;
                          return (
                            <button
                              key={seatIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(item.id, seatIdx, guest || null);
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                                guest
                                  ? guest.vip
                                    ? "bg-gradient-to-br from-gold-500 to-gold-600 text-white ring-1 ring-gold-400/50"
                                    : "bg-teal-900 text-gold-300"
                                  : isGlowTarget
                                  ? "border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700 animate-pulse scale-110"
                                  : "border border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                              }`}
                            >
                              {guest ? guest.name.slice(0, 2).toUpperCase() : seatIdx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom 4 Seats */}
                      <div className="absolute -bottom-4 left-0 right-0 flex justify-around px-4">
                        {[4, 5, 6, 7].map((seatIdx) => {
                          const guest = currentEvent.guests.find(
                            (g) => g.tableId === item.id && g.seatIndex === seatIdx
                          );
                          const isGlowTarget = activeSelectedGuestId && !guest;
                          return (
                            <button
                              key={seatIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(item.id, seatIdx, guest || null);
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                                guest
                                  ? guest.vip
                                    ? "bg-gradient-to-br from-gold-500 to-gold-600 text-white ring-1 ring-gold-400/50"
                                    : "bg-teal-900 text-gold-300"
                                  : isGlowTarget
                                  ? "border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700 animate-pulse scale-110"
                                  : "border border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                              }`}
                            >
                              {guest ? guest.name.slice(0, 2).toUpperCase() : seatIdx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Left Seat */}
                      <div className="absolute -left-4">
                        {(() => {
                          const seatIdx = 8;
                          const guest = currentEvent.guests.find(
                            (g) => g.tableId === item.id && g.seatIndex === seatIdx
                          );
                          const isGlowTarget = activeSelectedGuestId && !guest;
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(item.id, seatIdx, guest || null);
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                                guest
                                  ? "bg-teal-900 text-gold-300"
                                  : isGlowTarget
                                  ? "border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700 animate-pulse scale-110"
                                  : "border border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                              }`}
                            >
                              {guest ? guest.name.slice(0, 2).toUpperCase() : 9}
                            </button>
                          );
                        })()}
                      </div>

                      {/* Right Seat */}
                      <div className="absolute -right-4">
                        {(() => {
                          const seatIdx = 9;
                          const guest = currentEvent.guests.find(
                            (g) => g.tableId === item.id && g.seatIndex === seatIdx
                          );
                          const isGlowTarget = activeSelectedGuestId && !guest;
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeatClick(item.id, seatIdx, guest || null);
                              }}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                                guest
                                  ? "bg-teal-900 text-gold-300"
                                  : isGlowTarget
                                  ? "border-2 border-dashed border-gold-500 bg-gold-50 text-gold-700 animate-pulse scale-110"
                                  : "border border-gold-500/20 bg-surface text-teal-900/60 hover:bg-gold-50"
                              }`}
                            >
                              {guest ? guest.name.slice(0, 2).toUpperCase() : 10}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              }

              if (item.type === "stage") {
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    className={`absolute cursor-move select-none rounded-xl border-2 border-gold-500/40 bg-teal-950 text-white shadow-xl ${
                      isSelected ? "ring-2 ring-gold-500" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: "240px",
                      height: "70px",
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div className="flex h-full flex-col items-center justify-center">
                      <span className="font-serif text-xs font-bold tracking-wider uppercase text-gold-400">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-teal-200/60">Acoustic Elevated Stage</span>
                    </div>
                  </div>
                );
              }

              if (item.type === "dance-floor") {
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    className={`absolute cursor-move select-none rounded-xl border-2 border-gold-500/30 bg-gold-50/60 shadow-md ${
                      isSelected ? "ring-2 ring-gold-500" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: "180px",
                      height: "140px",
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div className="flex h-full flex-col items-center justify-center p-2 text-center">
                      <Sparkles className="h-5 w-5 text-gold-600 mb-1" />
                      <span className="font-serif text-xs font-bold text-teal-950">{item.label}</span>
                      <span className="text-[9px] text-gold-700/80">Italian Herringbone Marble</span>
                    </div>
                  </div>
                );
              }

              if (item.type === "bar") {
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                    className={`absolute cursor-move select-none rounded-xl border-2 border-gold-500/30 bg-teal-900 text-white shadow-md ${
                      isSelected ? "ring-2 ring-gold-500" : ""
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: "160px",
                      height: "55px",
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div className="flex h-full flex-col items-center justify-center">
                      <span className="font-serif text-xs font-bold text-white">{item.label}</span>
                      <span className="text-[9px] text-gold-400">Champagne & Cocktail Bar</span>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Seat Info Hover Tooltip */}
          {hoveredSeatInfo && (
            <div
              className="pointer-events-none fixed z-50 rounded-lg bg-teal-950 text-white px-3 py-2 text-xs shadow-2xl border border-gold-500/30"
              style={{
                left: `${hoveredSeatInfo.x}px`,
                top: `${hoveredSeatInfo.y - 12}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <span>{hoveredSeatInfo.guest ? hoveredSeatInfo.guest.name : "Available Seat"}</span>
                {hoveredSeatInfo.guest?.vip && (
                  <span className="rounded bg-gold-500 px-1 text-[9px] font-bold text-white">VIP</span>
                )}
              </div>
              <div className="text-[11px] text-teal-200/80 mt-0.5">
                {hoveredSeatInfo.tableId} • Chair #{hoveredSeatInfo.seatIndex}
              </div>
              {hoveredSeatInfo.guest && (
                <div className="text-[11px] text-gold-300 mt-1 flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  <span>Dietary: {hoveredSeatInfo.guest.dietary}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Drawer: Live Unseated Guests */}
        <div className="w-80 border-l border-gold-500/20 bg-white p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900/70">
                <Users className="h-4 w-4 text-gold-600" />
                <span>Unseated Guests</span>
              </div>
              <span className="rounded-full bg-gold-50 border border-gold-500/30 px-2 py-0.5 text-xs font-bold text-gold-700">
                {unseatedGuests.length} Left
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gold-600/50" />
              <input
                type="text"
                placeholder="Find unseated attendee..."
                value={unseatedSearch}
                onChange={(e) => setUnseatedSearch(e.target.value)}
                className="w-full rounded-lg border border-gold-500/25 bg-surface/70 pl-8 pr-3 py-1.5 text-xs text-teal-950 placeholder-teal-900/40 focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* List of Unseated Guests */}
            <div className="mt-4 space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
              {filteredUnseated.length === 0 ? (
                <div className="py-12 text-center text-xs text-teal-900/50">
                  {unseatedGuests.length === 0 ? "All guests have been seated! 🎉" : "No matches found"}
                </div>
              ) : (
                filteredUnseated.map((guest) => {
                  const isSelected = activeSelectedGuestId === guest.id;
                  return (
                    <div
                      key={guest.id}
                      className={`rounded-xl border p-3 text-xs transition-all ${
                        isSelected
                          ? "border-gold-500 bg-gold-50/70 shadow-sm"
                          : "border-gold-500/15 bg-white hover:border-gold-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-teal-950 flex items-center gap-1.5">
                            <span>{guest.name}</span>
                            {guest.vip && (
                              <span className="rounded bg-gold-500/15 border border-gold-500/30 px-1 text-[9px] font-bold text-gold-800">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[11px] text-teal-900/60">
                            Preference: <span className="font-medium">{guest.dietary}</span>
                          </div>
                        </div>

                        {/* Assign / Select button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setActiveSelectedGuestId(null);
                            } else {
                              setActiveSelectedGuestId(guest.id);
                            }
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-sm"
                              : "bg-teal-900/5 text-teal-900 hover:bg-gold-50 border border-gold-500/20"
                          }`}
                        >
                          {isSelected ? "Placing..." : "Seat Guest"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom helper summary */}
          <div className="border-t border-gold-500/15 pt-3 text-[11px] text-teal-900/60 flex items-center justify-between">
            <span>Synchronized with Dashboard</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-status-attending" />
          </div>
        </div>
      </div>

      {/* Export & Seating Manifest Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTab="seating"
      />
    </div>
  );
}
