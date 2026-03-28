# CLAUDE.md — The Oracle (האורקל)

This file gives Claude Code full context on the project so every session starts informed.

---

## Project Identity

**Name**: The Oracle / האורקל
**Type**: Premium Israeli financial forecasting simulator
**Audience**: Israeli users planning their financial future (mortgages, savings, retirement)
**Tone**: Professional, premium, slightly dramatic. Like Bloomberg Terminal meets a personal financial advisor. Never dumbed-down.
**Language default**: Hebrew (RTL). English is secondary via a toggle.

---

## Tech Stack — Quick Reference

| What | How |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript (strict) |
| Styles | Tailwind CSS + CSS custom properties (`var(--gold)`, `var(--bg)`, etc.) |
| Animations | Framer Motion — use `motion.*` components, `AnimatePresence` for mount/unmount |
| Charts | Recharts — `AreaChart`, `PieChart`, `ResponsiveContainer` |
| State | Zustand with `persist` middleware (LocalStorage key: `oracle-simulation`) |
| i18n | i18next + react-i18next — always use `useTranslation()` hook, never hardcode Hebrew strings |
| Icons | Lucide React — `import { IconName } from 'lucide-react'` |
| Auth/DB | Supabase — gracefully degrades if env vars are missing |

---

## File Map

```
src/
├── lib/
│   ├── finance-engine.ts   ← THE CORE. All Israeli mortgage math lives here.
│   ├── i18n.ts             ← All translation strings. Add new keys here first.
│   └── supabase.ts         ← Client + DB helpers. Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│
├── stores/
│   ├── useSimulationStore.ts  ← Financial params + computed results. Every setter calls recalculate().
│   └── useUIStore.ts          ← Theme ('dark'|'light'), language ('he'|'en'), accessibility settings.
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx    ← Root layout wrapper. Applies font-size + reduced-motion from UIStore.
│   │   ├── Navigation.tsx  ← Top bar: Oracle logo, language/theme toggles, save button.
│   │   └── Sidebar.tsx     ← Left sidebar (RTL: right side). 6 accordion sections.
│   │
│   ├── charts/
│   │   ├── MainGraph.tsx   ← Primary AreaChart (Net Worth + Total Debt). Click to select year.
│   │   └── BreakdownPie.tsx ← Monthly budget donut chart.
│   │
│   ├── inputs/
│   │   ├── SliderGroup.tsx    ← Reusable labeled slider with gold thumb.
│   │   ├── MortgagePanel.tsx  ← Add/remove mortgage tracks (Prime, Fixed, CPI-Linked).
│   │   └── LifeEventsPanel.tsx ← Add life events (child, house, retirement) to any year.
│   │
│   └── ui/
│       ├── StatsCard.tsx       ← Animated number counter card.
│       ├── AccessibilityMenu.tsx ← Floating Israeli accessibility panel (WCAG 2.1 AA).
│       ├── LegalDisclaimer.tsx ← Fixed-bottom Hebrew legal footer. NEVER remove or shorten.
│       └── Modal.tsx           ← Generic modal with Framer Motion.
│
└── pages/
    ├── Dashboard.tsx  ← Main page. Layout: Sidebar | Stats → Chart → Pie
    └── Auth.tsx       ← Login/Register. Email+password, Google OAuth, Magic Link.
```

---

## Design System

### CSS Custom Properties (defined in `src/index.css`)

Always use these — never hardcode hex colors in components.

**Dark theme (default)**:
```
--bg: #060612             (page background)
--surface: #0E0E22        (cards, panels)
--surface-elevated: #14142E (modals, dropdowns)
--border: #1E1E42
--gold: #C8A951           (primary accent — brand color)
--gold-light: #E8D48A     (hover states)
--gold-glow: rgba(200,169,81,0.15)
--text-primary: #F2EDE4
--text-secondary: #8B84A2
--text-muted: #4A4570
--accent-blue: #5B78FF
--accent-green: #34D4A8
--accent-red: #FF4B5C
```

**Light theme** (`[data-theme="light"]`): Same variable names, different values. See `index.css`.

### Typography Rules
- **Hebrew text**: `font-family: 'Assistant'` — apply via `font-assistant` Tailwind class
- **Numbers / English**: `font-family: 'Montserrat'` — apply via `font-montserrat`
- **The app name "האורקל"**: Always render with `className="shimmer-text"` (animated gold gradient)
- **Weights**: 300 (light body), 600 (section headers), 700 (stats), 800 (hero)

### Tailwind Utility Classes (from tailwind.config.js)
```
bg-bg, bg-surface, bg-surface-elevated
border-border-custom
text-gold, text-gold-light, text-primary, text-secondary, text-muted
text-accent-blue, text-accent-green, text-accent-red
font-assistant, font-montserrat
animate-slide-in, animate-fade-up, animate-pulse-gold
```

### Custom CSS Classes (from index.css)
```
.shimmer-text      — animated gold shimmer (for app name)
.glass             — backdrop-blur surface (navigation bar)
.energy-bar        — animated budget health bar
.btn-magnetic      — base class for magnetic hover buttons
```

---

## Finance Engine — Critical Rules

**File**: `src/lib/finance-engine.ts`

This is the most sensitive file. Follow these rules:

1. **Never change the Spitzer formula** — it's mathematically correct. The formula: `M = P * r * (1+r)^n / ((1+r)^n - 1)`

2. **CPI-Linked track**: The balance increases EACH MONTH before recalculating payment:
   ```
   balance *= (1 + inflation / 100 / 12)  // inflate first
   payment = spitzer(balance, rate, remainingMonths)  // then recalculate
   ```
   This is what makes Israeli צמוד מדד unique — payments grow over time.

3. **Prime rate**: The effective rate is always `boiRate + track.margin`. If BOI changes in a simulation, recalculate.

4. **Car balloon**: The residual value is added to the LAST payment only, not spread monthly.

5. **Investment return**: Applied monthly as `assets * (return/100/12)` on the running asset balance.

6. **Life events**: Applied at the START of `event.year` (when `month % 12 === 1 && year === event.year`).

7. **All amounts in ILS (₪)**. Display formatting: use `toLocaleString('he-IL')`.

---

## State Management Rules

### useSimulationStore
- Every setter **must** call `get().recalculate()` at the end.
- `recalculate()` calls `runSimulation(params)` from finance-engine and sets `results`.
- Default params: income ₪15,000 | expenses ₪8,000 | assets ₪100,000 | no mortgage | BOI 4.5% | inflation 3.5% | return 7% | 30 years.
- IDs for mortgage tracks and life events: use `Date.now().toString()` or `crypto.randomUUID()`.

### useUIStore
- `theme` controls `data-theme` attribute on the root element (set in `App.tsx`).
- `language` controls `i18n.changeLanguage()` and `document.documentElement.dir`.
- `fontSize` (14–22px) is applied as inline style on `AppShell`.
- `reducedMotion` adds `class="motion-reduce"` to root — Framer Motion components should check this.

---

## i18n Rules

- All user-visible strings go through `useTranslation()` — `const { t } = useTranslation()`
- Hebrew is the default (`lng: 'he'`). Strings look like: `t('mortgage.title')` → "משכנתא"
- When adding a new feature, add its translation keys to BOTH `he` and `en` resources in `src/lib/i18n.ts` before wiring up the component.
- Hebrew tooltips for financial jargon (Spitzer, Prime, CPI) exist under `tooltips.*` — use them in `<Tooltip>` components next to complex inputs.

---

## RTL Layout Rules

- The HTML `dir` attribute is set dynamically in `App.tsx` based on language.
- Tailwind RTL variants: use `rtl:` prefix for direction-specific overrides.
- The sidebar is on the "start" side — in RTL (Hebrew), it renders on the right. Use `start-0` not `left-0`.
- For absolute positioning that should flip: use `inset-inline-start` and `inset-inline-end` CSS properties, or the `rtl:right-0 ltr:left-0` Tailwind pattern.
- Number formatting for Hebrew: `number.toLocaleString('he-IL')`.
- Currency display: `₪` symbol always (not "NIS"). Place it BEFORE the number in Hebrew: `₪15,000`.

---

## Supabase / Auth Notes

- Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- If env vars are missing/placeholder, `supabase.ts` gracefully returns null for auth and no-ops for DB calls.
- Do NOT make auth a hard requirement for the simulation — the calculator works 100% offline.
- Saved scenarios schema: `{ id, user_id, name, params: jsonb, created_at }`
- Auth methods: Email+Password, Google OAuth, Magic Link.

---

## CI/CD — GitHub Actions

Two workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Every push to any branch | `tsc --noEmit` → `npm run build` |
| `deploy.yml` | Push to `main` | Build → Deploy to GitHub Pages |

**GitHub Pages setup** (one-time in repo settings):
1. Settings → Pages → Source: **GitHub Actions**
2. Add repository variable `VITE_BASE_PATH = /the-oracle/` (match your repo name)
3. Add repository secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Important**: The `vite.config.ts` reads `process.env.VITE_BASE_PATH` at build time. This allows the same codebase to deploy to GitHub Pages (`/the-oracle/`) or Vercel (`/`) without code changes.

---

## Development Commands

```bash
npm run dev      # dev server at localhost:5173
npm run build    # production build to dist/
npm run preview  # preview production build at localhost:4173
npx tsc --noEmit # type-check only (no output files)
```

---

## Key Decisions & Why

| Decision | Reason |
|---|---|
| Hebrew RTL default | Target audience is Israeli. The product is fundamentally Hebrew-first. |
| CSS custom properties over Tailwind dark: prefix | Allows instant theme switching at runtime without className juggling. Also cleaner in Recharts (chart colors read CSS vars). |
| Zustand over Redux | Simpler for this scope. The simulation store is the only complex state. |
| Recharts over Chart.js / D3 | Best React integration, good TypeScript types, composable primitives. |
| All calculation in browser | Privacy-first: user's financial data never leaves their device unless they explicitly save. |
| Supabase graceful degradation | App is useful without an account. Auth is a "save your work" feature, not a gate. |

---

## What NOT to Do

- Don't hardcode any Hebrew strings in components — use `t()`.
- Don't hardcode hex colors — use CSS custom properties.
- Don't change the Spitzer formula or CPI math without verifying against a real amortization table.
- Don't remove or abbreviate the legal disclaimer in `LegalDisclaimer.tsx` — it's legally required in Israel.
- Don't make auth a blocker for using the simulator.
- Don't add console.logs to the finance engine (it runs 360+ iterations per simulation).
