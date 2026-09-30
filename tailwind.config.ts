import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        porcelain: "#FAF8F5", // Warm Ivory Silk
        surface: "#F5F1E9",   // Champagne Silk
        teal: {
          950: "#070A0E",     // Midnight Obsidian
          900: "#0D131C",     // Royal Velvet Noir
          800: "#151E2B",     // Deep Charcoal Velvet
          700: "#223145",     // Regal Slate
          600: "#384B63",
          100: "#EFE9DC",     // Gilded Ivory
          50: "#F9F6F0",      // Silk Alabaster
        },
        coral: {
          700: "#805E16",     // Antique Bronze
          600: "#A47E24",     // Burnished Bronze Gold
          500: "#C5A059",     // Imperial Royal Gold
          400: "#DFBF77",     // Champagne Gold
          300: "#EBD6A2",     // Fine Silk Gold
          100: "#F8F1DC",     // Champagne Shimmer
          50: "#FCFAF2",      // Ivory Gilded Glow
        },
        gold: {
          900: "#4D3A12",
          800: "#73571A",
          700: "#997523",
          600: "#B88E35",
          500: "#C5A059",     // Pure Imperial Gold
          400: "#DFBF77",
          300: "#EBD6A2",
          200: "#F4E6C3",
          100: "#FBF5E5",
          50: "#FDFBF6",
        },
        obsidian: {
          950: "#05070A",
          900: "#0A0F17",
          800: "#121A26",
          700: "#1C283A",
        },
        status: {
          attending: "#059669", // Imperial Emerald
          pending: "#D97706",   // Royal Amber
          declined: "#DC2626",  // Royal Crimson
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(10, 15, 23, 0.05), 0 0 0 1px rgba(197, 160, 89, 0.12)",
        "card-hover": "0 16px 36px -6px rgba(10, 15, 23, 0.1), 0 0 0 1px rgba(197, 160, 89, 0.25), 0 0 20px -5px rgba(197, 160, 89, 0.15)",
        "gold-glow": "0 0 25px -4px rgba(197, 160, 89, 0.35)",
        dropdown: "0 14px 40px -6px rgba(10, 15, 23, 0.18), 0 0 0 1px rgba(197, 160, 89, 0.15)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
