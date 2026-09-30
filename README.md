# ✨ AURA EVENTS — Luxury Event Management & Floor Plan Studio

<div align="center">

![Next.js 14](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React 18](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443e38?style=for-the-badge&logo=react&logoColor=white)

**A bespoke, full-suite digital platform for planning, orchestrating, and experiencing high-end galas, weddings, and corporate summits.**

[Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [GitHub Upload Guide](#-pushing-to-github)

</div>

---

## 🌟 Overview

**Aura Events** is an enterprise-grade luxury event management and design studio. Designed with an editorial aesthetic—combining warm ivory silk, obsidian velvet, and imperial gold accents—it offers event organizers, production managers, and guests a seamless, high-touch experience.

From **interactive 2D drag-and-drop floor planning** and **immersive 3D venue walkthroughs** to **VIP door check-in**, **budget tracking in INR (₹)**, and **instant digital table passes with custom QR codes**, Aura Events streamlines every stage of event production.

---

## 🚀 Key Features

### 🏛️ 1. Immersive 3D Venue Tour (`/venue-tour`)
- Interactive **Three.js** 3D virtual ballroom & palace environment.
- Orbit camera controls, realistic ambient lighting, chandeliers, dance floor, banquet tables, and staging.
- Visual ambiance testing for lighting and decor before physical setup.

### 📐 2. Drag & Drop Floor Plan Designer (`/floor-plan`)
- Powered by `@dnd-kit/core` with smooth physics and collision detection.
- Add, move, and rotate banquet tables (round & rectangular), stages, dance floors, and cocktail bars.
- Live capacity counters, seat-by-seat guest placement, and tablecloth theme customization (Classic White, Noir Velvet, Gold Silk, etc.).

### 👥 3. Comprehensive Dashboard & Guest Operations (`/dashboard`)
- **Guest Roster**: Search, filter, and assign guests to tables in real time.
- **VIP Designation & Door Check-In**: Instant status toggles with timestamped door security logs.
- **Dietary & Culinary Intelligence**: Track preferences and requirements across all guests (**Standard**, **Vegetarian**, **Vegan**, **Gluten-Free**, **Sattvic**, **Kosher**, **Jain**, **Nut Allergy**).
- **Catering & Security Export Suite**: Export Master Catering summaries, Table Seating Manifests, and Door Check-In logs to CSV or print-ready format.

### 🎫 4. Digital Table Pass & Custom QR Engine
- Generates elegant, luxury digital boarding passes for confirmed guests.
- Custom vector QR code generation (`/components/CreativeQRCode.tsx`) for fast at-the-door credential scanning.
- Includes guest seat number, table assignment, dietary meal tag, and event schedule.

### 💌 5. Interactive RSVP Portal (`/rsvp`)
- Personalized guest response flow with attending/declined status toggles.
- Culinary preference selector, dietary restriction inputs, and special accommodation notes.
- Celebration confetti animation powered by `canvas-confetti` upon RSVP confirmation.

### 💰 6. Budget & Production Management
- Category-level expense tracking with estimated vs. actual cost comparisons.
- Native Indian Rupee formatting (`₹` Lakhs/Crores) via custom `formatINR` utility.
- Production checklist tracker with multi-category progress milestones.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **3D Rendering** | [Three.js](https://threejs.org/) |
| **Drag & Drop** | [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/utilities` |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), `@tailwindcss/forms` |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) (with local storage persistence) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown, Slider, Tabs, Tooltip) |
| **Icons & Effects** | [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [Framer Motion](https://www.framer.com/motion/) |

---

## 📁 Project Structure

```text
Event_organizer_website/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Event management dashboard, guest roster & budget
│   │   ├── floor-plan/         # Interactive 2D drag-and-drop table & seating editor
│   │   ├── rsvp/               # Guest RSVP portal with dietary selection
│   │   ├── venue-tour/         # Three.js 3D ballroom & venue walkthrough
│   │   ├── globals.css         # Global styling and Tailwind directives
│   │   ├── layout.tsx          # Root layout with navigation & font definitions
│   │   └── page.tsx            # High-conversion landing page
│   ├── components/
│   │   ├── CreativeQRCode.tsx  # Dynamic SVG QR code generator
│   │   ├── DigitalTablePass.tsx# Printable/digital guest boarding pass
│   │   ├── ExportModal.tsx     # Catering, seating & security CSV/print exporter
│   │   └── Navbar.tsx          # Global responsive navigation bar
│   ├── lib/
│   │   ├── formatINR.ts        # Currency formatting for Indian Rupee (₹)
│   │   └── qrCode.ts           # QR code matrix calculation algorithm
│   └── store/
│       └── useEventStore.ts    # Global Zustand store for events, guests & budget
├── .gitignore                  # Git ignore rules (node_modules, .next, etc.)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies & scripts
├── tailwind.config.ts          # Luxury theme palette & typography extensions
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🏁 Quick Start

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)

### 2. Installation

Clone or open your repository folder, then install dependencies:

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 📤 Pushing to GitHub

Follow these steps to initialize and push your project to GitHub:

### Step 1: Initialize Git
Open your terminal in the project root directory and run:

```bash
git init
```

### Step 2: Add Files & Commit
The included `.gitignore` ensures that `node_modules` and `.next` build files are excluded:

```bash
git add .
git commit -m "feat: initial commit for Aura Events luxury event management platform"
```

### Step 3: Link to Your GitHub Repository
1. Create a new repository on [GitHub](https://github.com/new) (e.g., `aura-events` or `event-organizer-website`).
2. Run the following commands (replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub repository details):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

---

## 📜 Available Scripts

- `npm run dev`: Runs the development server on `localhost:3000`.
- `npm run build`: Compiles and creates an optimized production build.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint checks across the codebase.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
