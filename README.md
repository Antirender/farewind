# FareWind

**A speculative data visualization prototype for ride-hailing fare timing.**  
Built with React · TypeScript · Vite · Recharts · Leaflet · Scrollama

---

## Overview

FareWind is a client-side web application that helps users understand when ride-hailing prices are lowest on their regular routes. By logging each ride's fare, time, and surge multiplier, the app builds a personal price history that drives interactive charts, heatmaps, and rule-based recommendations — all without any backend or account requirement.

This repository documents three development stages: an initial MVP, a portfolio-grade prototype, and a final polish pass.

---

## Stage 1 — MVP

The initial build established the core product flow:

| Page | Purpose |
|---|---|
| Onboarding | Introduce the concept and walk the user through the app |
| Saved Routes | List tracked routes with entry counts |
| Add Ride Entry | Log a new fare with date, price, and surge |
| Route Insights | Price trend chart, weekly/hourly heatmap, percentile card |
| Recommendations | Rule-based advice derived from ride history |

**What was built:**
- Application scaffold (React + TypeScript + Vite, CSS Modules)
- Typed data model — `Route`, `RideEntry`, `Recommendation`
- Deterministic seed data (seeded random, reproducible across reloads)
- Shared state via React Context (`AppProvider`)
- Reusable UI primitives — `Button`, `Card`, `Badge`
- Core analysis: price trend area chart (Recharts), day × hour heatmap, percentile comparison, rule-based recommendation logic

The MVP objective was to prove the core concept: FareWind can surface meaningful price patterns from user-supplied ride data alone.

---

## Stage 2 — Portfolio Prototype

The second iteration transformed the MVP into a more realistic, responsive, and interpretable product prototype.

### Pages (6 total)

| Page | Route | Purpose |
|---|---|---|
| Onboarding | `/onboarding` | Scrollama scroll-driven walkthrough |
| Saved Routes | `/` | Route cards with nicknames, avg fare, ride count |
| Add Ride Entry | `/add` | Log a new fare with date, price, surge |
| Route Insights | `/insights/:routeId` | Interactive charts, heatmap, stats breakdown |
| Route Map | `/map` | Full-page Leaflet map with sidebar, colour-coded routes |
| Recommendations | `/recommendation` | Rule-based advice with estimated savings |

### Data & Types
- `Route` extended with `name` (user-friendly nickname e.g. "Home → School"), `provider`, `rideType`, and geographic coordinates (`originCoords`, `destCoords`)
- `Recommendation` redesigned with `id`, `type`, `title`, `body`, `reasoning`, and `estimatedSaving` — structured as a product-facing decision object rather than a raw string
- Seed data built around real Oakville, ON addresses (home ↔ school, home ↔ Pearson Airport, home ↔ downtown) with bidirectional route pairs, natural gaps in ride history, and realistic weekday/weekend surge patterns

### State & Persistence
- `localStorage` persistence for theme preference (`fw_theme`) and onboarding completion (`fw_onboarded`)
- Full route and entry persistence (`fw_routes`, `fw_entries`) — user-added data survives reloads
- Refresh experience is now stable — theme and onboarding state survive page reloads
- Added `resetOnboarding()`, `toggleTheme()`, and `resetToDemo()` to context

### Visual System
- **4 colour themes** — Dark, Light, Pink, Blue — via CSS custom properties on `[data-theme]`
- Design tokens: colour, spacing, radius, typography (`Inter` + `JetBrains Mono`)
- Responsive breakpoints (mobile-first, tablet ≥ 640 px, desktop ≥ 1024 px)
- Polished component set: `Button` (4 variants, 3 sizes), `Card` (3 styles), `Badge` (5 colours), `Tooltip` with `InfoIcon`
- Accessible `:focus-visible` outlines, `::selection` styling, WCAG AAA contrast across all themes

### Page Details

**Onboarding**  
Redesigned with Scrollama scroll-driven steps, a sticky visual panel (emoji + animated pop-in), progress dots, step counter, and a skip button. On mobile the layout stacks vertically. A replay button in the header lets users revisit the flow at any time.

**Saved Routes**  
Route cards show nickname (e.g. "Home → School") with full addresses as grey subtitles. Cards surface average fare, ride count, last ride date, and provider alongside a coloured badge. Demo routes are labelled with a "Demo" badge. A "Reset Demo" button restores original data. A responsive grid adapts from 1 → 2 → 3 columns.

**Add (tabbed)**  
Two tabs in a single page: **Log a Ride** (price, date, route) and **New Route** (origin/destination with auto-geocoding, live OSRM map preview). A green success animation plays on save before redirecting.

**Route Insights**  
- Route-switcher pill row to jump between routes
- 7-day / 30-day / All time-range filter
- **Overview / Weekday vs Weekend** view toggle with comparison cards
- Semantic section labels ("📊 Your Numbers", "📈 Price Over Time", "🗓 When to Ride")
- `StatsBar` with insight-oriented title, mini range bar (P25–P75 fill + average marker)
- `PriceTrendChart` with Brush zoom, surge toggle, ReferenceLine for avg, yellow dots for surged rides, and annotation footer explaining what to notice
- `HeatmapChart` rebuilt as CSS Grid — day × hour click/hover interactive cells, explicit colour legend (green → yellow → red with labelled swatches), footer annotation highlighting cheapest/peak windows

**Route Map**  
Full-page Leaflet map with sidebar route list, OSRM real-road geometry, colour-coded polylines, route selection, and stats overlay.

**Smart Advice**  
Baseline analysis per route: total spent, average fare, cheapest hour, overspend estimate. Three rule types — *cheapest time*, *surge avoidance*, *weekday vs weekend* — each backed by a `reasoning` string and an `estimatedSaving` value in CAD.

**About**  
Overview of what FareWind does, key features, tech stack badges, and project context.

---

## Stage 3 — Polish & Realistic Data

### Realistic seed data
- Personal travel schedule: Tue/Wed/Fri school commute, Thu/Sat/Sun downtown trips, Monday off
- GTA Uber fare model (base + per-km + per-min + booking fee) with ±20% natural variance
- Dramatic surge factors: morning rush 1.2–2.1×, evening rush 1.3–2.3×, late night 1.4–2.5×
- Airport routes: only 2 round-trips (Aug 2025, Jan 2026) — 4 entries total
- 3 complete gap days with zero records for realism
- ~25% of school return trips skipped (ride from a friend), ~15% of downtown days skipped

### Code cleanup
- Fixed `useMemo` misuse for map side effect → `useEffect`
- Moved `THEME_CYCLE` outside component to satisfy React exhaustive-deps
- Removed dead `RouteMap` component (map is self-contained in `RouteMapPage`)
- Removed unused type exports (`HeatmapCell`, `UserPreferences`, `OnboardingStep`)
- Removed unused `onboardingSteps` seed export
- Deleted 5 empty page subdirectories

### Deployment

Deployed on Vercel. A `vercel.json` rewrite rule ensures SPA client-side routing works on page refresh.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 6 |
| Routing | react-router-dom 7 |
| Charts | Recharts 2 |
| Map | Leaflet 1.9 + react-leaflet 5 |
| Scroll storytelling | Scrollama 3 |
| Styling | CSS Modules + custom properties |
| State | React Context + localStorage |

---

## Pages (7 total)

| Page | Route | Purpose |
|---|---|---|
| Onboarding | — | Scroll-driven intro walkthrough |
| Saved Routes | `/` | Route cards with avg fare, ride count, Demo badge |
| Add | `/add` | Tabbed: Log a Ride / New Route |
| Route Insights | `/insights/:routeId` | Charts, heatmap, stats breakdown |
| Route Map | `/map` | Leaflet map with OSRM road geometry |
| Smart Advice | `/recommendation` | Baseline analysis + rule-based tips |
| About | `/about` | App overview, features, tech stack |

---

## Running Locally

```bash
npm install
npm run dev      # starts dev server at localhost:5173
npm run build    # production build → dist/
```

> **Note:** npm scripts invoke Vite via `node ./node_modules/vite/bin/vite.js` to avoid PATH issues on some macOS setups.

---

## Project Structure

```
src/
├── types/          # Shared TypeScript interfaces
├── data/           # Deterministic seed routes + entries
├── context/        # AppContext — state, theme, onboarding
├── styles/         # global.css (design tokens, reset)
├── components/
│   ├── ui/         # Button, Card, Badge, Tooltip
│   ├── layout/     # AppShell (header + bottom nav)
│   └── charts/     # PriceTrendChart, HeatmapChart, StatsBar
└── pages/          # Onboarding, SavedRoutes, AddRideEntry,
                    # RouteInsights, RouteMapPage, Recommendation, About
```

---

## Context

Developed as part of **VDES 39915** at Sheridan College.  
FareWind is a speculative design project — it does not connect to any live ride-hailing API. All data is user-supplied and stored locally in the browser.
