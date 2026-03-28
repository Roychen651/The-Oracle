# האורקל — The Oracle

**סימולטור פיננסי מתקדם לישראלים**
*Advanced Financial Forecasting Simulator for Israelis*

> "האם העתיד שלך בטוח? האורקל מחשב את המציאות הכלכלית שלך."

---

## What It Is

The Oracle is a premium, browser-based financial simulator that helps Israelis model their financial future across 30+ years. It accounts for the unique Israeli financial landscape: variable Prime-rate mortgages, CPI-linked (צמוד מדד) loans, Bank of Israel rate changes, and inflation — all visualized in an interactive real-time graph.

---

## Features

### Finance Engine
- **Spitzer Amortization** (לוח שפיצר) — fixed monthly payment calculation
- **Prime Track** (מסלול פריים) — BOI rate + spread, variable
- **Fixed Track** (קבועה) — standard fixed-rate mortgage
- **CPI-Linked Track** (צמוד מדד) — balance adjusts monthly with inflation, payment recalculates each period
- **Car Balloon Loans** — interest-only + residual bullet payment
- **30-year month-by-month simulation** with investment compounding + life events

### UI / UX
- Dark mode (Gold & Charcoal) + Light mode (Crystal White)
- Hebrew RTL layout by default, English available via toggle
- Framer Motion animations throughout
- Recharts AreaChart — Net Worth vs Total Debt over time
- Pie chart — monthly budget breakdown
- Life Events timeline — drop events (house purchase, child, retirement) onto any year
- Israeli WCAG 2.1 AA accessibility menu

### Technical
- **Zero backend required** for simulation — all math runs in the browser
- Supabase Auth + storage for saving scenarios (optional, graceful degradation)
- Zustand store with LocalStorage persistence — your data survives page reload

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (CSS custom properties for theming) |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand + persist middleware |
| i18n | i18next + react-i18next |
| Icons | Lucide React |
| Auth/DB | Supabase (optional) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/the-oracle.git
cd the-oracle

# 2. Install dependencies
npm install

# 3. Configure environment (optional — required only for Supabase auth/save features)
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# 4. Start dev server
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview  # preview the production build locally
```

---

## CI/CD — GitHub Actions

Two workflows run automatically:

### `ci.yml` — Runs on every push to any branch
1. TypeScript type-check (`tsc --noEmit`)
2. Production build (`npm run build`)

This ensures no broken code ever lands.

### `deploy.yml` — Runs on every push to `main`
Automatically builds and deploys to **GitHub Pages**.

#### Setup Steps (one-time)

1. **Enable GitHub Pages** in your repo:
   `Settings → Pages → Source: GitHub Actions`

2. **Set the base path** (repository variable):
   `Settings → Variables and secrets → Variables → New repository variable`
   - Name: `VITE_BASE_PATH`
   - Value: `/the-oracle/` (replace with your exact repo name)
   - Skip this if you're using a custom domain.

3. **Add Supabase secrets** (optional):
   `Settings → Variables and secrets → Secrets → New repository secret`
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

After that, every push to `main` → live URL updates automatically. No manual steps.

#### Alternative: Vercel

If you prefer Vercel (zero config), just import the repo at vercel.com. The `VITE_BASE_PATH` env var is not needed for Vercel.

---

## Project Structure

```
src/
├── lib/
│   ├── finance-engine.ts   # Core Israeli mortgage math (Spitzer, CPI, Prime, Car)
│   ├── i18n.ts             # Hebrew + English translations
│   └── supabase.ts         # Supabase client + save/load helpers
├── stores/
│   ├── useSimulationStore.ts  # All financial params + simulation results
│   └── useUIStore.ts          # Theme, language, accessibility
├── components/
│   ├── layout/             # AppShell, Navigation, Sidebar
│   ├── charts/             # MainGraph (AreaChart), BreakdownPie
│   ├── inputs/             # SliderGroup, MortgagePanel, LifeEventsPanel
│   └── ui/                 # StatsCard, AccessibilityMenu, LegalDisclaimer, Modal
└── pages/
    ├── Dashboard.tsx        # Main simulator view
    └── Auth.tsx             # Login / Register
```

---

## Finance Math Reference

### Spitzer Formula (לוח שפיצר)

```
M = P × r × (1 + r)^n
    ─────────────────
       (1 + r)^n − 1

Where:
  M = monthly payment
  P = principal
  r = monthly interest rate (annual% / 100 / 12)
  n = total months
```

### CPI-Linked Track (צמוד מדד)

Each month the outstanding balance is adjusted upward:
```
balance_new = balance_prev × (1 + inflation% / 100 / 12)
```
Then the monthly payment is recalculated using Spitzer on the new balance and remaining months. This means payments grow over time with inflation.

### Prime Track (פריים)

```
effective_rate = BOI_rate + margin
```
Uses Spitzer with the effective rate. Payments change when BOI rate changes.

---

## Legal

The simulator is for **illustrative purposes only** and does not constitute financial, investment, tax, or legal advice.

לפי חוק הסדרת העיסוק בייעוץ השקעות, שיווק השקעות וניהול תיקי השקעות, התשנ"ה-1995, אין לראות בתוכן זה ייעוץ מוסמך. יש להתייעץ עם יועץ פיננסי מוסמך לפני קבלת החלטות השקעה.

---

## Contributing

Issues and PRs welcome. Hebrew and English both accepted.
