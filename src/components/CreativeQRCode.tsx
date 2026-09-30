"use client";

import React, { useMemo } from "react";
import { generateQRCodeMatrix } from "@/lib/qrCode";

export interface CreativeQRCodeProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  theme?: "gold" | "emerald" | "noir";
  showCenterCrest?: boolean;
}

export default function CreativeQRCode({
  value,
  size = 240,
  label = "AURA CONCIERGE PASS",
  sublabel = "Scan for Door Entry & Table Escort",
  theme = "gold",
  showCenterCrest = true,
}: CreativeQRCodeProps) {
  const matrix = useMemo(() => generateQRCodeMatrix(value), [value]);
  const N = matrix.length;
  const padding = 4;
  const totalUnits = N + padding * 2;
  const centerStart = Math.floor(N / 2) - 1.5;
  const centerEnd = Math.floor(N / 2) + 1.5;

  // Colors based on luxury theme
  const colors = useMemo(() => {
    switch (theme) {
      case "emerald":
        return {
          bg: "#071714",
          cardBorder: "#C5A059",
          dotGradStart: "#DFBF77",
          dotGradEnd: "#997523",
          finderOuter: "#DFBF77",
          finderInner: "#C5A059",
          textGold: "#DFBF77",
        };
      case "noir":
        return {
          bg: "#0D131C",
          cardBorder: "#C5A059",
          dotGradStart: "#EBD6A2",
          dotGradEnd: "#B88E35",
          finderOuter: "#DFBF77",
          finderInner: "#C5A059",
          textGold: "#DFBF77",
        };
      case "gold":
      default:
        return {
          bg: "#FAF8F5",
          cardBorder: "rgba(197, 160, 89, 0.4)",
          dotGradStart: "#805E16",
          dotGradEnd: "#1A1407",
          finderOuter: "#997523",
          finderInner: "#B88E35",
          textGold: "#997523",
        };
    }
  }, [theme]);

  // Is within corner finder pattern (7x7)
  const isFinder = (r: number, c: number) => {
    return (
      (r < 7 && c < 7) ||
      (r < 7 && c >= N - 7) ||
      (r >= N - 7 && c < 7)
    );
  };

  // Center crest zone (avoid dots in center to preserve clean emblem look)
  const isCenterCrest = (r: number, c: number) => {
    if (!showCenterCrest) return false;
    return r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Luxury QR Container */}
      <div
        className="relative rounded-2xl p-4 transition-all duration-300 shadow-xl"
        style={{
          backgroundColor: colors.bg,
          border: `1.5px solid ${colors.cardBorder}`,
        }}
      >
        {/* Ornate Corner Accents */}
        <div className="pointer-events-none absolute -top-1 -left-1 h-3.5 w-3.5 border-t-2 border-l-2 border-gold-500" />
        <div className="pointer-events-none absolute -top-1 -right-1 h-3.5 w-3.5 border-t-2 border-r-2 border-gold-500" />
        <div className="pointer-events-none absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-gold-500" />
        <div className="pointer-events-none absolute -bottom-1 -right-1 h-3.5 w-3.5 border-b-2 border-r-2 border-gold-500" />

        {/* SVG Drawing */}
        <svg
          viewBox={`0 0 ${totalUnits} ${totalUnits}`}
          width={size}
          height={size}
          className="select-none"
        >
          <defs>
            {/* Linear Metallic Gold Gradient */}
            <linearGradient id="qrGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.dotGradStart} />
              <stop offset="50%" stopColor="#C5A059" />
              <stop offset="100%" stopColor={colors.dotGradEnd} />
            </linearGradient>

            {/* Finder Radial Gradient */}
            <radialGradient id="finderGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DFBF77" />
              <stop offset="80%" stopColor="#C5A059" />
              <stop offset="100%" stopColor="#73571A" />
            </radialGradient>

            {/* Crest Gradient */}
            <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBF77" />
              <stop offset="100%" stopColor="#997523" />
            </linearGradient>
          </defs>

          {/* Background Plate */}
          <rect
            x={0}
            y={0}
            width={totalUnits}
            height={totalUnits}
            fill={colors.bg}
            rx={2}
          />

          {/* Regular Data Modules: Rendered as Rounded Capsules / Dots */}
          {matrix.map((row, r) =>
            row.map((active, c) => {
              if (!active || isFinder(r, c) || isCenterCrest(r, c)) return null;
              const x = c + padding;
              const y = r + padding;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x + 0.08}
                  y={y + 0.08}
                  width={0.84}
                  height={0.84}
                  rx={0.3}
                  fill="url(#qrGoldGrad)"
                />
              );
            })
          )}

          {/* Custom Luxury Finder Eyes: (0,0), (0, N-7), (N-7, 0) */}
          {[
            { r: 0, c: 0 },
            { r: 0, c: N - 7 },
            { r: N - 7, c: 0 },
          ].map((pos, idx) => {
            const x = pos.c + padding;
            const y = pos.r + padding;
            return (
              <g key={idx}>
                {/* Outer Ring */}
                <rect
                  x={x}
                  y={y}
                  width={7}
                  height={7}
                  rx={1.6}
                  fill="none"
                  stroke="url(#finderGrad)"
                  strokeWidth={0.9}
                />
                {/* Inner Separator Space */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={5}
                  height={5}
                  rx={1}
                  fill={colors.bg}
                />
                {/* Center Core Eye */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={3}
                  height={3}
                  rx={0.8}
                  fill="url(#finderGrad)"
                />
              </g>
            );
          })}

          {/* Central Monogram Crest */}
          {showCenterCrest && (
            <g>
              {/* Crest Backdrop Disc */}
              <circle
                cx={totalUnits / 2}
                cy={totalUnits / 2}
                r={2.8}
                fill={colors.bg}
                stroke="url(#crestGold)"
                strokeWidth={0.4}
              />
              <circle
                cx={totalUnits / 2}
                cy={totalUnits / 2}
                r={2.4}
                fill="#070A0E"
              />
              {/* Monogram A */}
              <text
                x={totalUnits / 2}
                y={totalUnits / 2 + 1.1}
                textAnchor="middle"
                fontSize={3.0}
                fontFamily="Playfair Display, Georgia, serif"
                fontWeight="bold"
                fill="url(#crestGold)"
              >
                A
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Label and Subtext */}
      {label && (
        <div className="mt-3 text-center">
          <div
            className="font-serif text-xs font-bold uppercase tracking-wider"
            style={{ color: colors.textGold }}
          >
            {label}
          </div>
          {sublabel && (
            <div className="text-[10px] text-teal-900/60 mt-0.5 max-w-[220px]">
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { CreativeQRCode };
