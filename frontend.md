# Frontend Design Document -- Branch Changeset

This document describes every frontend change made on this branch relative to `main`. It is intended as a complete reference for an AI or developer to transpose these changes onto the main branch, resolving conflicts and merging features accurately.

---

## Table of Contents

1. [Overview](#overview)
2. [Dependency Changes](#dependency-changes)
3. [Architecture Changes](#architecture-changes)
4. [CSS Variable Mapping (Main -> Branch)](#css-variable-mapping)
5. [globals.css -- Full Changeset](#globalscss)
6. [page.tsx -- Routing & Persona System](#pagetsx)
7. [New Component: LandingHero.tsx](#landinghero)
8. [New Component: MarketPreview.tsx](#marketpreview)
9. [New Component: GridStrainVisualizer.tsx](#gridstrainvisualizer)
10. [Modified: Dashboard.tsx](#dashboard)
11. [Modified: MetricCard.tsx](#metriccard)
12. [Modified: PriceChart.tsx](#pricechart)
13. [Modified: PnlChart.tsx](#pnlchart)
14. [Animation & Effects System](#animations)
15. [Merge Strategy](#merge-strategy)

---

## Overview

The branch transforms the frontend from a simple data dashboard into a full product prototype with:

- **Landing page** with hero, market preview, and persona-specific infographic sections
- **Dual persona system** (Industry / Consumer) with tailored UI per role
- **Market preview** component with fake futures, sparkline, and sentiment data
- **Grid strain visualizer** showing live network capacity with stabilization simulation
- **Dark brutalist redesign** replacing the original blue-gradient theme with a black + semantic color palette
- **Animation system** with 15+ keyframe animations, glow effects, shimmer overlays, and staggered reveals

---

## Dependency Changes

**Added to `package.json`:**
```json
"lucide-react": "^0.575.0"
```

This provides all iconography (Zap, TrendingUp, Factory, Wallet, ShieldAlert, Activity, BarChart3, etc). The original branch had no icon library.

---

## Architecture Changes

### Main branch architecture:
```
page.tsx -> Dashboard (direct render, no routing)
```

### Branch architecture:
```
page.tsx -> LandingHero (persona selection)
         -> Dashboard (with persona prop + logout callback)
```

The `page.tsx` now manages state for:
- `entered: boolean` -- whether the user has entered the dashboard
- `persona: "industry" | "consumer"` -- which portal the user selected

---

## CSS Variable Mapping

The entire color system was replaced. When merging, any component referencing old variables must be updated.

| Main Branch Variable | Branch Variable | Notes |
|---|---|---|
| `--bg: #0b1221` | `--bg: #000000` | Pure black background |
| `--card: #111a2f` | `--card: #0a0a0a` | Near-black card |
| (none) | `--card-border: #333333` | New: structural borders |
| `--muted: #8ea0c2` | `--muted: #888888` | Neutral gray |
| `--accent: #5dd6ff` | `--accent: #ffffff` | White as primary accent |
| `--accent-2: #90f0c5` | `--accent-2: #e0e0e0` | Off-white |
| (none) | `--accent-3: #bbbbbb` | New: light grey |
| `--text: #e7edf8` | `--text: #ffffff` | Pure white text |
| `--danger: #ff7f7f` | `--negative: #ff5c5c` | Renamed + recolored |
| `--success: #7bffb3` | `--positive: #00d4aa` | Renamed: teal-green |
| (none) | `--info: #4ea8de` | New: soft blue |
| (none) | `--warning: #f59e0b` | New: amber |
| (none) | `--accent-glow: rgba(0,212,170,0.15)` | New: green glow |
| `font-family: "Inter"...` | `--font-sans: "Geist"...` | Font change + variable |

**Critical for merge:** Any main-branch code using `var(--danger)` must become `var(--negative)`. Any code using `var(--success)` must become `var(--positive)`. The `.card` class is replaced by `.glass-panel`.

---

## globals.css

### Removed from main
- `.card` class (gradient background, rounded corners, box-shadow)
- `.grid` class
- `.chart-container` (rounded, translucent)
- `.metrics-row` layout
- `.metric-title`, `.metric-value`, `.metric-sub` typography classes
- Generic `button` styles (gradient blue buttons)
- Radial gradient body background

### Replaced with
- `.glass-panel` -- flat black card with border, no border-radius, hover glow transitions
- `.glass-panel-hover-green` / `.glass-panel-hover-blue` / `.glass-panel-hover-lift` -- colored glow on hover
- `.btn-primary` -- green-accented button with glow on hover
- `.btn-outline` -- border-only button with white glow on hover
- `.badge` / `.tag-ok` / `.tag-warn` / `.tag-info` / `.tag-neutral` -- status badge system
- `.live-indicator` -- pulsing green dot with ring animation
- `.dashboard-grid` / `.dashboard-columns` -- responsive grid layout (2.5fr 1fr at 1024px+)
- Dot-pattern body background (`radial-gradient` at 30px grid)
- Custom scrollbar styling

### New utility classes added
- `.glow-top-green` / `.glow-top-blue` -- top border + box-shadow glow
- `.glow-left-green` / `.glow-left-blue` -- left border accent + box-shadow
- `.stat-card` / `.stat-card-green` / `.stat-card-blue` -- stat display cards with hover lift
- `.step-flow` / `.step-flow-item` -- horizontal process flow layout
- `.callout-box` -- quoted callout with decorative quotation mark
- `.ambient-glow-green` / `.ambient-glow-blue` -- persistent soft glow halos
- `.gradient-border` -- animated gradient border via `::before`

### Keyframe animations (15 total)
| Name | Purpose | Duration |
|---|---|---|
| `pulse-ring` | Live indicator ring expansion | 2s infinite |
| `fadeIn` | Basic fade + translateY(4px) | 0.4s |
| `shimmer` | Horizontal light sweep overlay | 3s infinite |
| `glowPulse` | Green glow box-shadow pulsing | 3s infinite |
| `glowPulseRed` | Red glow pulsing (critical strain) | 2s infinite |
| `glowPulseBlue` | Blue glow pulsing | 3s infinite |
| `scanLine` | CRT scan-line sweeping top-to-bottom | 4s infinite |
| `slideInUp` | Staggered entry from below (20px) | 0.6s |
| `slideInLeft` | Entry from left (16px) | 0.5s |
| `gradientShift` | Gradient background position cycling | 4s infinite |
| `breathe` | Opacity 0.6-1.0 pulsing | 3s infinite |
| `textGlow` | Green neon text-shadow pulsing | 2.5s infinite |
| `textGlowBlue` | Blue neon text-shadow pulsing | 2.5s infinite |
| `borderGlow` | Border color cycling green | 2s infinite |
| `countUp` | Scale+fade entry for numbers | 0.5s |
| `progressStripes` | Diagonal stripe movement (in component) | 1s infinite |

### Animation utility classes
- `.animate-fade-in`, `.animate-slide-up`, `.animate-slide-left`
- `.delay-50` through `.delay-800` (50ms increments)
- `.text-glow-green`, `.text-glow-blue` (animated)
- `.text-glow-static-green`, `.text-glow-static-blue`, `.text-glow-static-white` (persistent)
- `.glow-pulse-green`, `.glow-pulse-red`, `.glow-pulse-blue`
- `.shimmer` (light-sweep `::after` overlay)
- `.scan-line` (CRT scan `::before` overlay)
- `.breathe`

---

## page.tsx

**Main branch:** Directly renders `<Dashboard />` with no props.

**Branch version:**
```tsx
"use client";
import { useState } from "react";
import Dashboard from "../components/Dashboard";
import LandingHero from "../components/LandingHero";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [persona, setPersona] = useState<"industry" | "consumer">("industry");

  if (!entered) {
    return (
      <LandingHero
        onEnter={(p) => {
          setPersona(p);
          setEntered(true);
        }}
      />
    );
  }

  return <Dashboard persona={persona} onLogout={() => setEntered(false)} />;
}
```

**Merge note:** Dashboard's signature changed from `Dashboard()` to `Dashboard({ persona, onLogout })`. Both props must be threaded through.

---

## LandingHero

**New file: `frontend/components/LandingHero.tsx`** (177 lines)

Props: `{ onEnter: (persona: "industry" | "consumer") => void }`

### Structure (top to bottom):
1. **Header bar** -- "Grid Arbitrage System" + "LIVE SIMULATION" badge
2. **Hero title** -- "COMMAND CENTER" with `.text-glow-static-white`
3. **Subtitle** -- product description
4. **CTA buttons** -- "Industry Access" (`.btn-primary`) + "Consumer Access" (`.btn-outline`)
5. **MarketPreview component** -- embedded market snapshot
6. **Value props grid** -- 3 cards (Profit & Protect, Drive Competition, Reduce Strain) with colored icons
7. **Industry infographic section** (`.glow-left-green`):
   - 3 stat cards: ROI +34.2%, Stabilizations 1,247, Contracts $48.3M
   - 3-step process flow
   - Callout box with shimmer effect
8. **Consumer infographic section** (`.glow-left-blue`):
   - 3 stat cards: Savings $127, Protection 99.8%, Returns +12.4%
   - 3-step process flow
   - Callout box with shimmer effect

All sections use staggered `.animate-slide-up` with cascading delays.

Icons used: `Factory`, `Wallet`, `Zap`, `TrendingUp`, `ShieldAlert`, `Activity`, `ArrowRight`, `Shield` (from lucide-react).

---

## MarketPreview

**New file: `frontend/components/MarketPreview.tsx`** (129 lines)

No props -- self-contained with hardcoded fake data.

### Structure:
- 3-column grid inside a `.glass-panel.glow-top-green.ambient-glow-green.shimmer`
- **Left column:** Spot price ($52.40, +2.3%), Sentiment (Bullish), 24h Volume (142,380 MWh)
- **Center column:** Sparkline chart (Recharts AreaChart, 24 data points, 100px tall), Futures strip (4 contracts: 1M/3M/6M/12M)
- **Right column:** Grid Load (18,420 / 25,000 MW with progress bar), Network Status

### Fake data:
```typescript
const FAKE_SPARKLINE = [
  { t: 0, p: 49.2 }, { t: 1, p: 50.1 }, ... // 24 points
];
const FUTURES = [
  { label: "1-Month", price: 54.10, change: +1.8 },
  { label: "3-Month", price: 58.75, change: +3.2 },
  { label: "6-Month", price: 61.20, change: +2.1 },
  { label: "12-Month", price: 55.90, change: -0.4 },
];
```

---

## GridStrainVisualizer

**New file: `frontend/components/GridStrainVisualizer.tsx`** (95 lines)

Props: `{ loadMw: number, isStabilizing: boolean }`

### Behavior:
- Calculates `percentage = loadMw / 25000 * 100`
- Three states:
  - **Optimal** (< 60%): green bar, neutral badge
  - **Moderate** (60-80%): amber bar, neutral badge
  - **Critical** (> 80%, not stabilizing): red bar, warn badge, `.glow-pulse-red`, red radial gradient overlay, glowing bar shadow
  - **Stabilizing** (any %, when active): green bar, ok badge, `.glow-pulse-green`, animated diagonal stripes, green radial overlay
- Progress bar with animated width transition (`cubic-bezier(0.4, 0, 0.2, 1)`)

---

## Dashboard

**Modified: `frontend/components/Dashboard.tsx`** (159 -> 438 lines)

### Signature change:
```typescript
// Main branch:
export default function Dashboard()
// Branch:
export default function Dashboard({ persona, onLogout }: DashboardProps)
```

### New imports:
```typescript
import { LogOut, Zap, Briefcase, User, ShieldAlert, Cpu, TrendingUp, TrendingDown, BarChart3, Factory, Wallet, Shield, Users } from "lucide-react";
import GridStrainVisualizer from "./GridStrainVisualizer";
```

### New state:
```typescript
const [stabilizing, setStabilizing] = useState(false);
const [ownedContracts, setOwnedContracts] = useState(0);
```

### New computed values:
- `displayGridLoadMw` -- applies 0.85 multiplier when stabilizing
- `signalBadge` -- maps signal to colored badge (buy=tag-ok, sell=tag-warn, hold=tag-info)

### New fake data:
```typescript
const FAKE_FUTURES = [
  { label: "1-Month", price: 54.10, change: +1.8 },
  { label: "3-Month", price: 58.75, change: +3.2 },
  { label: "6-Month", price: 61.20, change: +2.1 },
  { label: "12-Month", price: 55.90, change: -0.4 },
];
const physicalRatio = 60;
const futuresRatio = 40;
```

### Layout (completely restructured):

**Header** (`.glass-panel.scan-line.ambient-glow-green`):
- Title "COMM PLATFORM" with `.text-glow-static-white`
- Persona badge (industry=tag-ok, consumer=tag-info)
- Signal Engine badge
- Connection status badge with `.live-indicator`
- EXIT button

**Primary metrics** (4 cards with staggered `.animate-slide-up`):
- Spot Price, AI Forecast, Running PnL, Owned Capacity

**Persona-specific panel** (conditional render):
- **Industry** (`.glow-top-green.ambient-glow-green`): Infrastructure Saved $2.4M, Blackouts Prevented 17, Communities Served 340K, Demand Absorbed 72%
- **Consumer** (`.glow-top-blue.ambient-glow-blue`): Monthly Savings $127, Portfolio Value $8,420, Protection Events 3, Market Rate vs Your Rate (-35% comparison bar)

**Two-column layout** (`.dashboard-columns` = 2.5fr 1fr):

Left column:
1. GridStrainVisualizer
2. Price Chart (`.glass-panel-hover-green`)
3. PnL Chart (`.glass-panel-hover-blue`)

Right column:
1. **Market Overview** (`.glow-top-green.ambient-glow-green.shimmer`) -- Futures table, Market Depth bar (62% buy / 38% sell), Contract Ratio visual (60/40 physical/futures)
2. **Market Actions** -- Buy Capacity Contract button, Grid Bailout toggle (industry only, uses `--warning` color when active)
3. **Environmental Factors** -- Temperature bar (color-coded by heat), Traffic bar (blue)
4. **Order Engine** table -- last 50 events, signal colors (buy=positive, sell=negative, hold=info), PnL colors, left-border glow on hover

### Interactive features:
- `handlePurchaseContract()` -- increments owned contracts, triggers 5s stabilization visual
- `handleBailout()` -- toggles stabilization (industry only)

---

## MetricCard

### Main branch:
```typescript
type Props = { title: string; value: string; sub?: string; accent?: "positive" | "negative" };
// Uses .card, .metric-title, .metric-value, .metric-sub classes
// Colors: positive -> var(--accent-2), negative -> var(--danger)
```

### Branch:
```typescript
type Props = { title: string; value: ReactNode; sub?: string; accent?: "positive" | "negative" | "neutral" };
// Uses .glass-panel, .glass-panel-hover-lift, inline styles
// Colors: positive -> var(--positive), negative -> var(--negative), neutral -> var(--accent-2)
// Adds .text-glow-static-green for positive accent
// Adds .glass-panel-hover-green for positive accent hover
```

Key change: `value` type changed from `string` to `ReactNode` (allows JSX content like the Owned Capacity flex layout).

---

## PriceChart

### Main branch colors:
- Spot line: `#5dd6ff` (accent blue)
- Forecast line: `#90f0c5` (accent green)
- Gradient fills: matching colors at 15% opacity
- Tooltip: rounded card style

### Branch colors:
- Spot line: `#00d4aa` (positive green)
- Forecast line: `#4ea8de` (info blue), dashed
- Gradient fills: matching new colors
- Tooltip: `.glass-panel` style (flat black, border)

---

## PnlChart

### Main branch colors:
- PnL line: `#5dd6ff`
- Inventory line: `#90f0c5`

### Branch colors:
- PnL line: `#00d4aa` (positive green), step type
- Inventory line: `#4ea8de` (info blue), monotone type
- Tooltip: color-codes PnL value (green/red), `.glass-panel` style

---

## Merge Strategy

### Step-by-step for an AI merging this into main:

1. **Install dependency:** Add `"lucide-react": "^0.575.0"` to `package.json` dependencies.

2. **Replace globals.css entirely.** The branch version is a complete rewrite. Do not attempt to merge line-by-line -- replace the whole file.

3. **Update page.tsx:** Add the `useState` imports, `entered`/`persona` state, and conditional rendering. Import `LandingHero`.

4. **Copy new files verbatim:**
   - `frontend/components/LandingHero.tsx`
   - `frontend/components/MarketPreview.tsx`
   - `frontend/components/GridStrainVisualizer.tsx`

5. **Replace Dashboard.tsx entirely.** The component signature, layout, and logic are completely different. If main has added new features since the branch diverged, those features must be manually re-integrated into the new Dashboard structure.

6. **Replace MetricCard.tsx.** Note the `value: string -> ReactNode` type change. Any main-branch code passing string values will still work since strings are valid ReactNode.

7. **Replace PriceChart.tsx and PnlChart.tsx.** These are color/style updates only -- the data flow (`data: StreamEvent[]`) is unchanged.

8. **Variable migration for any new main-branch code:**
   - `var(--danger)` -> `var(--negative)`
   - `var(--success)` -> `var(--positive)`
   - `var(--accent)` is now `#ffffff` not `#5dd6ff`
   - `var(--accent-2)` is now `#e0e0e0` not `#90f0c5`
   - `.card` class -> `.glass-panel` class
   - `.metrics-row` -> `.dashboard-grid` with `gridTemplateColumns` inline

9. **Run `npm install`** to install lucide-react.

10. **Build and verify:** `npx next build` should complete with 0 errors.

### Potential conflicts:
- If main added new Dashboard sections, they need to be placed into the two-column layout structure (left column = charts, right column = sidebar panels)
- If main added new CSS classes, they likely reference old variables and need recoloring
- The `Dashboard` component now requires `persona` and `onLogout` props -- all call sites must be updated

---

## File Summary

| File | Action | Lines (main) | Lines (branch) |
|---|---|---|---|
| `frontend/app/globals.css` | Replace | 117 | 617 |
| `frontend/app/page.tsx` | Replace | 5 | 23 |
| `frontend/components/Dashboard.tsx` | Replace | 159 | 438 |
| `frontend/components/LandingHero.tsx` | Create | -- | 177 |
| `frontend/components/MarketPreview.tsx` | Create | -- | 129 |
| `frontend/components/GridStrainVisualizer.tsx` | Create | -- | 95 |
| `frontend/components/MetricCard.tsx` | Replace | 21 | 33 |
| `frontend/components/PriceChart.tsx` | Replace | ~50 | 59 |
| `frontend/components/PnlChart.tsx` | Replace | ~40 | 46 |
| `frontend/package.json` | Add dependency | -- | +1 line |
| **Total net new** | | ~392 | **1,617** |