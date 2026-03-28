# CLAUDE.md — The Oracle (האורקל)

This file gives Claude Code full context on the project so every session starts informed.

---

## Project Identity

**Name**: The Oracle / האורקל
**Type**: Premium Israeli financial forecasting simulator
**Audience**: Israeli users planning their financial future (mortgages, savings, retirement)
**Tone**: Professional, premium, slightly dramatic. Like Bloomberg Terminal meets a personal financial advisor. Never dumbed-down.
**Language default**: Hebrew (RTL). English is secondary via a toggle.
**Repo**: `github.com/Roychen651/The-Oracle`

---

## Tech Stack — Quick Reference

| What | How |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript (strict) |
| Styles | Tailwind CSS + CSS custom properties (`var(--gold)`, `var(--bg)`, etc.) |
| Animations | Framer Motion — use `motion.*` components, `AnimatePresence` for mount/unmount |
| Charts | Recharts — `AreaChart`, `PieChart`, `ResponsiveContainer` |
| State | Zustand with `persist` middleware (LocalStorage key: `oracle-simulation`, `oracle-ui`) |
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
│   ├── useSimulationStore.ts  ← Financial params + computed results + BOI warnings.
│   ├── useUIStore.ts          ← Theme, language, accessibility, currentPage routing.
│   └── useAuthStore.ts        ← Supabase session, sign in/out, initialization.
│
├── data/
│   └── knowledge.ts        ← All knowledge library articles (KNOWLEDGE_BASE array).
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx    ← Root layout wrapper. Sidebar (desktop) + BottomSheet (mobile).
│   │   ├── Navigation.tsx  ← Top bar: logo, knowledge toggle, language, theme, save, auth.
│   │   └── Sidebar.tsx     ← RTL sidebar. 6 accordion sections of inputs.
│   │
│   ├── charts/
│   │   ├── MainGraph.tsx   ← AreaChart (Net Worth + Debt + Assets). FIRE milestone markers.
│   │   └── BreakdownPie.tsx ← Monthly budget donut chart.
│   │
│   ├── inputs/
│   │   ├── SliderGroup.tsx      ← Reusable labeled slider with gold thumb.
│   │   ├── MortgagePanel.tsx    ← Add/remove mortgage tracks + BOI LTV/PTI warnings.
│   │   └── LifeEventsPanel.tsx  ← Add life events (child, house, retirement) to any year.
│   │
│   └── ui/
│       ├── StatsCard.tsx         ← Animated number counter card.
│       ├── AccessibilityMenu.tsx ← Floating accessibility panel (WCAG 2.1 AA). Fixed bottom-14 left-4.
│       ├── LegalDisclaimer.tsx   ← Fixed-bottom Hebrew legal footer. NEVER remove or shorten.
│       ├── Modal.tsx             ← Generic modal with Framer Motion.
│       ├── BottomSheet.tsx       ← Draggable mobile bottom sheet (wraps Sidebar on mobile).
│       ├── OnboardingTour.tsx    ← First-run guided tour (6 steps).
│       ├── ActionPreview.tsx     ← Preview component for action confirmations.
│       └── TooltipInfo.tsx       ← Info tooltip for financial jargon.
│
└── pages/
    ├── Dashboard.tsx       ← Main simulator view. Stats → Chart → Pie → Summary → FIRE milestones.
    ├── Auth.tsx            ← Login/Register/Forgot/Reset — all 4 auth views in one component.
    └── KnowledgeLibrary.tsx ← Financial education library with search + category filter.
```

---

## Page Routing

Navigation between pages is handled by `useUIStore.currentPage` (NOT React Router — no URL changes).

```ts
type AppPage = 'dashboard' | 'profile' | 'scenarios' | 'knowledge'
```

- `navigateTo('knowledge')` → renders `KnowledgeLibrary`
- `navigateTo('dashboard')` → renders `Dashboard`
- The `BookOpen` icon in `Navigation.tsx` toggles between dashboard and knowledge library.
- `App.tsx` reads `currentPage` and switches the content rendered inside `AppShell`.

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
--gold-glow-strong: rgba(200,169,81,0.25)
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
.btn-primary       — gold filled button
.btn-ghost         — transparent bordered button
.oracle-bg         — main background gradient
```

---

## Finance Engine — Critical Rules

**File**: `src/lib/finance-engine.ts`

This is the most sensitive file. Follow these rules strictly:

### Month-by-Month Order of Operations (per tick)
1. Apply annual inflation to expenses (start of each year, year > 1)
2. Apply life events (start of their year, once)
3. Apply macro/black swan shocks (portfolio shock one-time, income/expense/BOI delta for duration)
4. Calculate mortgage payments (per track type)
5. Calculate car payment
6. Cash flow = income − expenses − debt payments
7. Smart Tax Router: surplus → KH (tax-exempt, up to ₪1,660/month) → taxable assets
8. Compound: KH at full return (0% CGT), taxable at net-of-CGT return
9. Yearly snapshot + FIRE milestone detection

### Core Math Rules
1. **Never change the Spitzer formula** — `M = P * r * (1+r)^n / ((1+r)^n - 1)`

2. **CPI-Linked track**: Inflate balance FIRST, then recalculate payment:
   ```
   balance *= (1 + inflation / 100 / 12)  // inflate first
   payment = spitzer(balance, rate, remainingMonths)  // then recalculate
   ```

3. **Prime rate**: `effectiveRate = boiRate + track.margin`. Respects live BOI delta from macro events.

4. **Car balloon**: Residual value added to the LAST payment only.

5. **Investment return**: Applied monthly as `assets * (return/100/12)` with CGT deducted.

6. **Keren Hishtalmut (KH)**: Tracked in a separate `khBalance`. No CGT on returns. Monthly cap: ₪1,660 (annual ₪19,920). `totalTaxSavedFromKH` is reported in results.

7. **Life events**: Applied at month 1 of `event.year` (first month of that year).

8. **Macro events**: Portfolio shock is one-time at start month. Income/expense/BOI deltas persist for `durationMonths`.

9. **All amounts in ILS (₪)**. Display: `toLocaleString('he-IL')`.

### BOI Regulatory Validation
`validateBOILimits(params)` enforces:
- **LTV**: 75% max for first home, 50% for investors
- **PTI (Payment-to-Income)**: must be < 40%

Called in `useSimulationStore` on every param change when mortgages exist. Result stored as `boiWarnings` in the store.

### FIRE Milestones
5 milestone types detected per year:
- `first_100k` — total assets ≥ ₪100,000
- `net_positive` — net worth > 0
- `debt_free` — total debt < ₪1,000 (only when mortgages exist)
- `first_million` — total assets ≥ ₪1,000,000
- `fire_crossover` — passive income (annual) ≥ annual expenses

Milestones attach to `YearlyDataPoint.milestones[]` and appear as emoji markers on the chart.

---

## State Management Rules

### useSimulationStore
- Every setter calls `applyAndRecalculate()` internally — no manual `recalculate()` needed.
- `applyAndRecalculate()` runs `runSimulation()` + `validateBOILimits()` + `set()` + debounced Supabase sync.
- `boiWarnings: BOIValidationResult | null` — null when no mortgage tracks.
- Default params: income ₪15,000 | expenses ₪8,000 | assets ₪100,000 | BOI 4.5% | inflation 3.5% | return 7% | 30 years | no mortgage | KH ₪0/month.
- IDs for tracks/events: `generateId()` = `Date.now()-randomString`.

New setters added:
- `setKerenHishtalmutMonthly(v)` — KH monthly contribution
- `setPropertyValue(v)` — property value for LTV check
- `setPropertyOwner(owner)` — `'none' | 'first' | 'investor'`
- `addMacroEvent(event)` / `removeMacroEvent(id)` — black swan events

### useUIStore
- `currentPage: AppPage` — drives page routing in `App.tsx`
- `navigateTo(page)` — switches pages
- `theme` controls `data-theme` on root element.
- `language` controls `i18n.changeLanguage()` and `document.dir`.
- `fontSize` (14–22px) applied to `document.documentElement.style.fontSize`.
- `reducedMotion` adds `reduce-motion` class to body.
- `onboardingStep` / `onboardingComplete` — first-run tour state.

---

## Knowledge Library

**Data**: `src/data/knowledge.ts` — `KNOWLEDGE_BASE: KnowledgeArticle[]`

Each article has:
- `id`, `category`, `title`, `subtitle`, `icon`, `difficulty`, `readTime`, `tags`, `relatedIds`
- `content: KnowledgeSection[]` — typed sections: `'intro' | 'explanation' | 'example' | 'warning' | 'tip' | 'formula'`

Categories: `mortgage | investment | pension | tax | budget | car | insurance | realestate`

The page (`KnowledgeLibrary.tsx`) has search + category chips + article cards + article modal.

When adding new articles, add to `KNOWLEDGE_BASE` in `knowledge.ts` — no component changes needed.

---

## i18n Rules

- All user-visible strings go through `useTranslation()` — `const { t } = useTranslation()`
- Hebrew is the default (`lng: 'he'`). Strings look like: `t('mortgage.title')` → "משכנתא"
- When adding a new feature, add its translation keys to BOTH `he` and `en` resources in `src/lib/i18n.ts` before wiring up the component.
- Hebrew tooltips for financial jargon (Spitzer, Prime, CPI) exist under `tooltips.*` — use them in `<TooltipInfo>` components next to complex inputs.

---

## RTL Layout Rules

- The HTML `dir` attribute is set dynamically in `App.tsx` based on language.
- Tailwind RTL variants: use `rtl:` prefix for direction-specific overrides.
- The sidebar is on the "start" side — in RTL (Hebrew), it renders on the right. Use `start-0` not `left-0`.
- For absolute positioning: use `inset-inline-start` / `inset-inline-end`, or `rtl:right-0 ltr:left-0`.
- Number formatting for Hebrew: `number.toLocaleString('he-IL')`.
- Currency: `₪` symbol always (not "NIS"). Place BEFORE the number: `₪15,000`.

---

## Fixed UI Elements & Z-Index Stack

| Element | Position | z-index |
|---|---|---|
| Navigation | `sticky top-0` | 50 |
| LegalDisclaimer | `fixed bottom-0` | 40 |
| AccessibilityMenu FAB | `fixed bottom-14 left-4` | 50 |
| BottomSheet (mobile) | `fixed inset-0` | 40 |
| Onboarding overlay | `fixed inset-0` | 60 |
| Article modal (KnowledgeLibrary) | `fixed inset-0` | 50 |

**Important**: The accessibility FAB is at `bottom-14` to sit above the 40px `LegalDisclaimer`. Do not change this to `bottom-20` or higher — it previously overlapped page content.

The floating save button was **removed** from Dashboard. Save is only in the Navigation bar (icon-only on mobile, full label on desktop).

---

## Supabase / Auth Notes

- Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- If env vars are missing, `supabase.ts` gracefully returns null — all DB calls are no-ops.
- The simulator works 100% offline without auth.
- Auth views: Login | Register | Forgot Password | Reset Password (all in `Auth.tsx`)
- Supabase auth events handled in `useAuthStore.initialize()` — detects `PASSWORD_RECOVERY` and sets URL param `reset=true`.
- Simulation sync: debounced 1500ms after any param change, only when user is logged in.
- DB schema migrations in `supabase/migrations/`.

---

## CI/CD — GitHub Actions

Two workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Every push to any branch | `tsc --noEmit` → `npm run build` |
| `deploy.yml` | Push to `main` | Build → Deploy to GitHub Pages |

**GitHub Pages setup** (one-time):
1. Settings → Pages → Source: **GitHub Actions**
2. Add repo variable `VITE_BASE_PATH = /The-Oracle/`
3. Add repo secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

`vite.config.ts` reads `process.env.VITE_BASE_PATH` at build time — same code deploys to GitHub Pages or Vercel.

---

## Development Commands

```bash
npm run dev      # dev server at localhost:5173
npm run build    # production build to dist/
npm run preview  # preview production build at localhost:4173
npx tsc --noEmit # type-check only — run before every commit
git push origin main  # triggers CI + deploy
```

---

## Key Decisions & Why

| Decision | Reason |
|---|---|
| Hebrew RTL default | Target audience is Israeli. Product is fundamentally Hebrew-first. |
| CSS custom properties over Tailwind dark: prefix | Instant runtime theme switching without className juggling. Recharts reads CSS vars for chart colors. |
| Zustand over Redux | Simpler for this scope. The simulation store is the only complex state. |
| Recharts over Chart.js / D3 | Best React integration, good TypeScript types, composable primitives. |
| All calculation in browser | Privacy-first: user's financial data never leaves device unless explicitly saved. |
| Supabase graceful degradation | App is fully usable without an account. Auth is a "save your work" feature, not a gate. |
| UIStore page routing (no React Router) | Single-page app with no URL requirements. Avoids hash routing complexity for GitHub Pages. |
| KH tracked separately from taxable assets | Tax law: Keren Hishtalmut returns are CGT-exempt. Mixing with taxable assets would overstate taxes. |
| BOI validation as pure function | Can be called in store setters and UI without side effects. Returns structured result for granular warning display. |

---

## What NOT to Do

- Don't hardcode Hebrew strings in components — use `t()`.
- Don't hardcode hex colors — use CSS custom properties.
- Don't change the Spitzer formula or CPI-linked math without verifying against a real amortization table.
- Don't remove or abbreviate `LegalDisclaimer.tsx` — legally required under Israeli investment advisory law.
- Don't make auth a blocker for using the simulator.
- Don't add `console.log` to the finance engine — it runs 360–480 iterations per simulation.
- Don't move `AccessibilityMenu` above `bottom-14` — it will overlap content.
- Don't add a floating save button in Dashboard — save lives in the nav bar only.
- Don't use React Router — page routing uses `useUIStore.navigateTo()`.
- Don't mix KH balance with taxable assets in calculations — they have different tax treatments.
