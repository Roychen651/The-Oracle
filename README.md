# האורקל — The Oracle

**סימולטור פיננסי מתקדם לישראלים**
*Advanced Financial Forecasting Simulator for Israelis*

> "אל תשאיר את העתיד שלך לחסדי הבנק — האורקל מחשב את המציאות הכלכלית שלך."

---

## What It Is

The Oracle is a premium, browser-based financial simulator that helps Israelis model their financial future across 30+ years. It accounts for the unique Israeli financial landscape: variable Prime-rate mortgages, CPI-linked (צמוד מדד) loans, Bank of Israel rate changes, inflation, pension tax-sheltering, and capital gains tax — all visualized in an interactive real-time graph.

All math runs in the browser. Your financial data never leaves your device unless you explicitly save it to the cloud.

---

## Features

### Finance Engine
- **Spitzer Amortization** (לוח שפיצר) — fixed monthly payment with correct interest/principal split
- **Equal Principal** (קרן שווה) — decreasing payments, lower total interest
- **Prime Track** (פריים) — BOI rate + margin, variable
- **Fixed Track** (קבועה לא צמודה) — standard fixed-rate
- **CPI-Linked Track** (צמוד מדד) — balance inflates monthly before payment recalculation
- **Car Balloon Loans** — interest-only + residual bullet payment
- **30-year month-by-month simulation** — up to 480 ticks, investment compounding, life events

### BOI Regulatory Engine
- **LTV Enforcement** — 75% max for first home, 50% for investors
- **PTI Enforcement** — warns when monthly payment exceeds 40% of income
- Live warnings displayed in the mortgage panel as you adjust numbers

### Smart Tax Router
- **Keren Hishtalmut (קרן השתלמות)** — contributions tracked separately, 0% capital gains tax, annual cap ₪19,920
- **Taxable investments** — 25% real capital gains tax applied monthly on net return
- Reports total CGT saved from KH vs. taxable route

### FIRE Milestones (Financial Independence, Retire Early)
- Auto-detected milestones: First ₪100K | Net Worth Positive | Debt Free | First Million | FIRE Crossover
- Displayed as a glowing timeline on the Dashboard
- Emoji markers rendered on the chart at the exact milestone year

### Macro / Black Swan Events (data model ready)
- Market crash (-30% portfolio), inflation spike, BOI rate hike/cut, income shock, tech winter
- Shocks apply one-time portfolio hits + duration-based income/expense/rate deltas

### Knowledge Library (ספריית הידע)
- 20+ educational articles covering Israeli mortgages, pensions, tax, investments, real estate, car finance
- Search + category filter (mortgage / investment / pension / tax / budget / car / real estate)
- Difficulty levels: beginner / intermediate / advanced
- Accessible via the BookOpen icon in the nav bar

### UI / UX
- Dark mode (Gold & Charcoal) + Light mode (Crystal White)
- Hebrew RTL layout by default, English via toggle
- Framer Motion animations throughout
- Recharts AreaChart — Net Worth vs Total Debt vs Assets
- Pie chart — monthly budget breakdown
- Life Events panel — add events (house, child, career jump, retirement) to any year
- Israeli WCAG 2.1 AA accessibility menu (font size, contrast, motion, readable font)
- Guided onboarding tour for first-time users
- Draggable mobile bottom sheet for sidebar inputs

### Technical
- **Zero backend required** for simulation — all math in the browser
- Supabase Auth + cloud save (graceful degradation if unconfigured)
- Zustand store with LocalStorage persistence — survives page reload
- Debounced 1.5s background sync to Supabase when logged in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties |
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
git clone https://github.com/Roychen651/The-Oracle.git
cd The-Oracle

# 2. Install dependencies
npm install

# 3. Configure environment (optional — required only for auth/save features)
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# 4. Start dev server
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview  # preview at localhost:4173
```

### Type Check

```bash
npx tsc --noEmit
```

---

## CI/CD — GitHub Actions

Two workflows run automatically:

### `ci.yml` — Runs on every push to any branch
1. TypeScript type-check (`tsc --noEmit`)
2. Production build (`npm run build`)

### `deploy.yml` — Runs on every push to `main`
Automatically builds and deploys to **GitHub Pages**.

#### One-Time Setup

1. **Enable GitHub Pages**:
   `Settings → Pages → Source: GitHub Actions`

2. **Set the base path** (repository variable):
   `Settings → Variables → New repository variable`
   - Name: `VITE_BASE_PATH`
   - Value: `/The-Oracle/`

3. **Add Supabase secrets** (optional):
   `Settings → Secrets → New repository secret`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Every push to `main` → live site updates automatically.

---

## Project Structure

```
src/
├── lib/
│   ├── finance-engine.ts     # Core Israeli mortgage math + BOI validation + FIRE + KH routing
│   ├── i18n.ts               # Hebrew + English translations
│   └── supabase.ts           # Supabase client + save/load helpers
├── data/
│   └── knowledge.ts          # Knowledge library article database
├── stores/
│   ├── useSimulationStore.ts  # Financial params + results + BOI warnings
│   ├── useUIStore.ts          # Theme, language, page routing, accessibility
│   └── useAuthStore.ts        # Supabase auth session
├── components/
│   ├── layout/                # AppShell, Navigation, Sidebar
│   ├── charts/                # MainGraph (AreaChart), BreakdownPie
│   ├── inputs/                # SliderGroup, MortgagePanel, LifeEventsPanel
│   └── ui/                    # StatsCard, AccessibilityMenu, LegalDisclaimer, Modal, BottomSheet
└── pages/
    ├── Dashboard.tsx          # Main simulator view
    ├── Auth.tsx               # Login / Register / Forgot / Reset
    └── KnowledgeLibrary.tsx   # Financial education library
```

---

## Finance Math Reference

### Spitzer Formula (לוח שפיצר)

```
M = P × r × (1 + r)^n
    ─────────────────
       (1 + r)^n − 1

P = principal | r = monthly rate (annual% / 12 / 100) | n = total months
```

### CPI-Linked Track (צמוד מדד)

Each month the outstanding balance is inflated BEFORE recalculating the payment:
```
balance_new = balance_prev × (1 + inflation% / 100 / 12)
payment     = Spitzer(balance_new, rate, remainingMonths)
```
Payments grow over time with inflation — this is the unique feature of Israeli צמוד מדד.

### Prime Track (פריים)

```
effectiveRate = BOI_rate + margin
```

Uses Spitzer with the effective rate. Payments adjust when BOI rate changes (or when a macro event shifts the rate).

### Smart Tax Router

```
Monthly surplus → KH (up to ₪1,660/month, 0% CGT)
               → Taxable assets (25% CGT on returns)
```

KH annual contribution cap = ₪19,920. KH balance compounds at full investment return. Tax saved = CGT that would have been paid on KH returns in a taxable account.

### BOI Regulatory Limits

| Buyer type | Max LTV | PTI |
|---|---|---|
| First home (דירה ראשונה) | 75% | < 40% |
| Investor (משקיע) | 50% | < 40% |

---

## Legal

The simulator is for **illustrative and educational purposes only** and does not constitute financial, investment, tax, or legal advice.

לפי חוק הסדרת העיסוק בייעוץ השקעות, שיווק השקעות וניהול תיקי השקעות, התשנ"ה-1995, אין לראות בתוכן זה ייעוץ מוסמך. יש להתייעץ עם יועץ פיננסי מוסמך לפני קבלת החלטות השקעה.

---

## Contributing

Issues and PRs welcome. Hebrew and English both accepted.
