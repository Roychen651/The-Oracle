import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Home, ShieldAlert, AlertTriangle, Info, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { useSimulationStore } from '../../stores/useSimulationStore'
import type { MortgageTrack } from '../../lib/finance-engine'
import { spitzerMonthlyPayment } from '../../lib/finance-engine'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return Math.round(n).toLocaleString('he-IL')
}

function fmtFull(n: number): string {
  return Math.round(n).toLocaleString('he-IL')
}

// ─── Track config ─────────────────────────────────────────────────────────────

const TRACK_META: Record<MortgageTrack['type'], {
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
}> = {
  prime: {
    label: 'פריים',
    color: '#5B78FF',
    bgColor: 'rgba(91,120,255,0.06)',
    borderColor: 'rgba(91,120,255,0.25)',
    dotColor: '#5B78FF',
  },
  fixed: {
    label: 'קבועה',
    color: '#34D4A8',
    bgColor: 'rgba(52,212,168,0.06)',
    borderColor: 'rgba(52,212,168,0.25)',
    dotColor: '#34D4A8',
  },
  'cpi-linked': {
    label: 'צמוד מדד',
    color: '#FF6B35',
    bgColor: 'rgba(255,107,53,0.06)',
    borderColor: 'rgba(255,107,53,0.25)',
    dotColor: '#FF6B35',
  },
  'equal-principal': {
    label: 'קרן שווה',
    color: '#C8A951',
    bgColor: 'rgba(200,169,81,0.06)',
    borderColor: 'rgba(200,169,81,0.25)',
    dotColor: '#C8A951',
  },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  prefix,
  suffix,
  onChange,
  highlight,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  prefix?: string
  suffix?: string
  onChange: (v: number) => void
  highlight?: 'gold' | 'red' | 'green'
}) {
  const borderFocus =
    highlight === 'gold'  ? '#C8A951' :
    highlight === 'red'   ? '#FF4B5C' :
    highlight === 'green' ? '#34D4A8' :
    '#C8A951'

  return (
    <div>
      <label
        className="block text-xs font-assistant font-semibold mb-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-montserrat"
            style={{ color: 'var(--text-muted)' }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ''}
          min={min}
          max={max}
          step={step}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          onFocus={(e) => (e.currentTarget.style.borderColor = borderFocus)}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          className="w-full rounded-xl text-xs font-montserrat text-center outline-none transition-colors"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: `7px ${suffix ? '20px' : '8px'} 7px ${prefix ? '20px' : '8px'}`,
            minHeight: 36,
          }}
        />
        {suffix && (
          <span
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-assistant"
            style={{ color: 'var(--text-muted)' }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Property Setup ───────────────────────────────────────────────────────────

function PropertySetupSection() {
  const {
    params,
    setPropertyValue,
    setPropertyOwner,
    setEquity,
    boiWarnings,
  } = useSimulationStore()

  const { propertyValue, equity, propertyOwner, mortgageTracks } = params
  const requiredLoan = Math.max(0, propertyValue - equity)
  const trackTotal = mortgageTracks.reduce((s, t) => s + t.principal, 0)
  const loanDiff = trackTotal - requiredLoan
  const maxLtv = propertyOwner === 'investor' ? 50 : 75
  const ltvPct = propertyValue > 0 ? (requiredLoan / propertyValue) * 100 : 0
  const ltvOk = ltvPct <= maxLtv
  const equityPct = propertyValue > 0 ? Math.round((equity / propertyValue) * 100) : 0

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.2)' }}
        >
          <Home size={13} style={{ color: 'var(--gold)' }} />
        </div>
        <span className="text-sm font-assistant font-bold" style={{ color: 'var(--text-primary)' }}>
          פרטי הנכס
        </span>
      </div>

      {/* Property Value + Ownership */}
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="שווי נכס (₪)"
          value={propertyValue}
          min={0}
          max={50_000_000}
          step={100_000}
          prefix="₪"
          onChange={setPropertyValue}
          highlight="gold"
        />
        <div>
          <label
            className="block text-xs font-assistant font-semibold mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            סוג רוכש
          </label>
          <select
            value={propertyOwner}
            onChange={(e) => setPropertyOwner(e.target.value as 'none' | 'first' | 'investor')}
            className="w-full rounded-xl text-xs font-assistant text-center outline-none transition-colors"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '7px 8px',
              minHeight: 36,
            }}
          >
            <option value="none">לא רלוונטי</option>
            <option value="first">דירה ראשונה (LTV 75%)</option>
            <option value="investor">משקיע (LTV 50%)</option>
          </select>
        </div>
      </div>

      {/* Equity input */}
      <NumberInput
        label={`הון עצמי (מקדמה)${propertyValue > 0 ? ` — ${equityPct}% משווי הנכס` : ''}`}
        value={equity}
        min={0}
        max={propertyValue || 50_000_000}
        step={50_000}
        prefix="₪"
        onChange={setEquity}
        highlight="green"
      />

      {/* Required Loan display */}
      {propertyValue > 0 && (
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: 'var(--surface-elevated)',
            border: `1px solid ${ltvOk ? 'rgba(52,212,168,0.2)' : 'rgba(255,75,92,0.3)'}`,
          }}
        >
          <span className="text-xs font-assistant font-semibold" style={{ color: 'var(--text-secondary)' }}>
            סכום משכנתא נדרש
          </span>
          <span
            className="text-base font-montserrat font-bold"
            style={{ color: ltvOk ? 'var(--text-primary)' : 'var(--accent-red)' }}
          >
            ₪{fmtFull(requiredLoan)}
          </span>
        </div>
      )}

      {/* LTV bar */}
      {propertyValue > 0 && requiredLoan > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
              יחס מימון (LTV)
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-montserrat font-bold"
                style={{ color: ltvOk ? 'var(--accent-green)' : 'var(--accent-red)' }}
              >
                {ltvPct.toFixed(0)}%
              </span>
              <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                / מקס׳ {maxLtv}%
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (ltvPct / maxLtv) * 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: ltvOk
                  ? ltvPct > maxLtv * 0.85
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, #34D4A8, #5B78FF)'
                  : '#FF4B5C',
              }}
            />
          </div>
        </div>
      )}

      {/* Track alignment hint */}
      {propertyValue > 0 && requiredLoan > 0 && mortgageTracks.length > 0 && (
        <div
          className="rounded-xl px-3 py-2 flex items-center justify-between gap-2"
          style={{
            background: Math.abs(loanDiff) < 1000
              ? 'rgba(52,212,168,0.06)'
              : 'rgba(200,169,81,0.06)',
            border: `1px solid ${Math.abs(loanDiff) < 1000
              ? 'rgba(52,212,168,0.2)'
              : 'rgba(200,169,81,0.25)'}`,
          }}
        >
          <span className="text-xs font-assistant" style={{ color: 'var(--text-secondary)' }}>
            סך המסלולים
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-montserrat font-bold" style={{ color: 'var(--text-primary)' }}>
              ₪{fmtFull(trackTotal)}
            </span>
            {Math.abs(loanDiff) >= 1000 && (
              <span
                className="text-xs font-assistant"
                style={{ color: loanDiff > 0 ? 'var(--accent-red)' : 'var(--gold)' }}
              >
                ({loanDiff > 0 ? '+' : ''}₪{fmtFull(Math.abs(loanDiff))}
                {loanDiff > 0 ? ' עודף' : ' חסר'})
              </span>
            )}
            {Math.abs(loanDiff) < 1000 && (
              <span className="text-xs font-assistant" style={{ color: 'var(--accent-green)' }}>✓ מיושר</span>
            )}
          </div>
        </div>
      )}

      {/* BOI warning banner */}
      <AnimatePresence>
        {boiWarnings && (boiWarnings.ltvViolation || boiWarnings.ptiViolation) && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="rounded-xl p-3 space-y-1"
            style={{
              background: 'rgba(255,75,92,0.08)',
              border: '1px solid rgba(255,75,92,0.35)',
              overflow: 'hidden',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={13} style={{ color: '#FF4B5C', flexShrink: 0 }} />
              <span className="text-xs font-bold font-assistant" style={{ color: '#FF4B5C' }}>
                אזהרת בנק ישראל
              </span>
            </div>
            {boiWarnings.warnings.map((w, i) => (
              <p key={i} className="text-xs font-assistant" style={{ color: '#FF4B5C', lineHeight: 1.6 }}>
                • {w}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Money Burned Section ─────────────────────────────────────────────────────

function MoneyBurnedSection() {
  const { params } = useSimulationStore()
  const { mortgageTracks, boiRate } = params
  const [expanded, setExpanded] = useState(false)

  if (mortgageTracks.length === 0) return null

  interface TrackBurn {
    track: MortgageTrack
    monthly: number
    totalPayback: number
    interest: number
  }

  const trackSummaries: TrackBurn[] = mortgageTracks.map((track) => {
    const rate = track.type === 'prime' ? boiRate + (track.margin ?? 1.5) : track.rate
    const monthly = spitzerMonthlyPayment(track.principal, rate, track.months)
    const totalPayback = monthly * track.months
    const interest = totalPayback - track.principal
    return { track, monthly, totalPayback, interest }
  })

  const grandTotal = trackSummaries.reduce((s, t) => s + t.totalPayback, 0)
  const grandPrincipal = mortgageTracks.reduce((s, t) => s + t.principal, 0)
  const grandInterest = grandTotal - grandPrincipal
  const interestRatio = grandTotal > 0 ? (grandInterest / grandTotal) * 100 : 0
  const principalRatio = 100 - interestRatio

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(255,75,92,0.2)',
      }}
    >
      {/* Header row — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-right"
        style={{ background: 'rgba(255,75,92,0.04)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <div className="text-right">
            <p className="text-xs font-assistant font-bold" style={{ color: 'var(--accent-red)' }}>
              עלות כוללת של המשכנתא
            </p>
            <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
              קרן + ריביות לאורך כל התקופה
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-montserrat font-bold" style={{ color: 'var(--text-primary)' }}>
            ₪{fmt(grandTotal)}
          </span>
          {expanded
            ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-2 space-y-4">

              {/* Visual bar */}
              <div>
                <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${principalRatio}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, #5B78FF, #34D4A8)' }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${interestRatio}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className="h-full"
                    style={{ background: 'linear-gradient(90deg, #FF6B35, #FF4B5C)' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#34D4A8' }} />
                    <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                      קרן {principalRatio.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FF4B5C' }} />
                    <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                      ריבית {interestRatio.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                {/* Principal row */}
                <div className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: 'rgba(52,212,168,0.05)', border: '1px solid rgba(52,212,168,0.15)' }}
                >
                  <div>
                    <p className="text-xs font-assistant font-semibold" style={{ color: '#34D4A8' }}>
                      קרן — הנכס עצמו
                    </p>
                    <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                      מה שרכשת
                    </p>
                  </div>
                  <span className="text-sm font-montserrat font-bold" style={{ color: 'var(--text-primary)' }}>
                    ₪{fmtFull(grandPrincipal)}
                  </span>
                </div>

                {/* Interest burned */}
                <div className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,75,92,0.06)', border: '1px solid rgba(255,75,92,0.2)' }}
                >
                  <div>
                    <p className="text-xs font-assistant font-semibold" style={{ color: 'var(--accent-red)' }}>
                      🔥 ריביות — כסף שנשרף
                    </p>
                    <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                      עלות המימון לאורך כל התקופה
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-montserrat font-bold" style={{ color: 'var(--accent-red)' }}>
                      ₪{fmtFull(grandInterest)}
                    </span>
                    <p className="text-xs font-montserrat" style={{ color: 'var(--text-muted)' }}>
                      ×{(grandInterest / grandPrincipal).toFixed(2)} על הקרן
                    </p>
                  </div>
                </div>
              </div>

              {/* Per-track breakdown */}
              {trackSummaries.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-assistant font-semibold" style={{ color: 'var(--text-muted)' }}>
                    פירוט לפי מסלול
                  </p>
                  {trackSummaries.map(({ track, monthly, totalPayback, interest }) => {
                    const meta = TRACK_META[track.type]
                    return (
                      <div key={track.id} className="flex items-center gap-3 py-2 px-3 rounded-xl"
                        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-assistant font-semibold" style={{ color: meta.color }}>
                            {meta.label}
                          </p>
                          <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                            ₪{fmtFull(monthly)}/חודש × {track.months} חודשים
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-montserrat font-bold" style={{ color: 'var(--text-primary)' }}>
                            ₪{fmt(totalPayback)}
                          </p>
                          <p className="text-xs font-assistant" style={{ color: 'var(--accent-red)' }}>
                            🔥 ₪{fmt(interest)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* PTI */}
              <PTIBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible footer summary */}
      {!expanded && (
        <div className="px-4 pb-3 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>קרן</p>
              <p className="text-xs font-montserrat font-bold" style={{ color: '#34D4A8' }}>
                ₪{fmt(grandPrincipal)}
              </p>
            </div>
            <div className="w-px h-6" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>🔥 ריבית</p>
              <p className="text-xs font-montserrat font-bold" style={{ color: 'var(--accent-red)' }}>
                ₪{fmt(grandInterest)}
              </p>
            </div>
          </div>
          <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
            לחץ לפירוט
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─── PTI Bar ──────────────────────────────────────────────────────────────────

function PTIBar() {
  const { params, results } = useSimulationStore()
  const totalMonthly = results?.monthlyBreakdown?.mortgage ?? 0
  const ptiPct = params.monthlyIncome > 0
    ? Math.min(100, (totalMonthly / params.monthlyIncome) * 100)
    : 0
  const ptiColor =
    ptiPct > 40 ? '#FF4B5C' :
    ptiPct > 30 ? '#f59e0b' :
    '#34D4A8'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {ptiPct > 40 && <AlertTriangle size={11} style={{ color: '#FF4B5C' }} />}
          <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
            עומס המשכנתא מההכנסה (PTI)
          </span>
        </div>
        <span className="text-xs font-montserrat font-bold" style={{ color: ptiColor }}>
          {ptiPct.toFixed(0)}%
          {ptiPct > 40 && <span className="font-assistant text-xs mr-1" style={{ color: '#FF4B5C' }}>⚠ מעל 40%</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ptiPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: ptiColor }}
        />
      </div>
      {ptiPct > 0 && (
        <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
          תשלום חודשי: ₪{fmtFull(Math.round(totalMonthly))} מתוך הכנסה ₪{fmtFull(params.monthlyIncome)}
        </p>
      )}
    </div>
  )
}

// ─── Track Card ──────────────────────────────────────────────────────────────

function TrackCard({
  track,
  boiRate,
  onUpdate,
  onRemove,
}: {
  track: MortgageTrack
  boiRate: number
  onUpdate: (u: Partial<MortgageTrack>) => void
  onRemove: () => void
}) {
  const [showTip, setShowTip] = useState(false)
  const meta = TRACK_META[track.type]

  const effectiveRate = track.type === 'prime' ? boiRate + (track.margin ?? 1.5) : track.rate
  const monthly = spitzerMonthlyPayment(track.principal, effectiveRate, track.months)

  // Prime tip: impact of a 1% rate hike
  const hikedMonthly = track.type === 'prime'
    ? spitzerMonthlyPayment(track.principal, effectiveRate + 1, track.months)
    : 0
  const hikeImpact = Math.round(hikedMonthly - monthly)

  // CPI tip: estimated balance growth after 1 year at 3.5% inflation
  const inflationGrowth = track.type === 'cpi-linked'
    ? Math.round(track.principal * (Math.pow(1 + 0.035 / 12, 12) - 1))
    : 0

  const hasTip = track.type === 'prime' || track.type === 'cpi-linked'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, scale: 0.97 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: meta.bgColor,
        border: `1px solid ${meta.borderColor}`,
      }}
    >
      {/* Track header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
          <span className="text-xs font-assistant font-bold" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span
            className="text-xs font-montserrat font-semibold px-1.5 py-0.5 rounded-md"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {effectiveRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-montserrat font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            ₪{fmtFull(Math.round(monthly))}<span className="text-xs font-assistant text-text-muted">/חודש</span>
          </span>
          {hasTip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors"
              style={{
                background: showTip ? `${meta.color}20` : 'rgba(255,255,255,0.04)',
                color: showTip ? meta.color : 'var(--text-muted)',
                border: `1px solid ${showTip ? meta.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
              title="פרטים נוספים"
            >
              <Info size={11} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors"
            style={{
              background: 'rgba(255,75,92,0.0)',
              color: 'var(--text-muted)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,75,92,0.1)'
              e.currentTarget.style.color = '#FF4B5C'
              e.currentTarget.style.borderColor = 'rgba(255,75,92,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,75,92,0.0)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
            aria-label="הסר מסלול"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Contextual tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mx-3 mb-2 rounded-xl px-3 py-2.5 space-y-1"
              style={{
                background: track.type === 'prime'
                  ? 'rgba(91,120,255,0.08)'
                  : 'rgba(255,107,53,0.08)',
                border: `1px solid ${track.type === 'prime'
                  ? 'rgba(91,120,255,0.2)'
                  : 'rgba(255,107,53,0.2)'}`,
              }}
            >
              {track.type === 'prime' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={11} style={{ color: '#5B78FF' }} />
                    <span className="text-xs font-assistant font-bold" style={{ color: '#5B78FF' }}>
                      סיכון ריבית — פריים משתנה
                    </span>
                  </div>
                  <p className="text-xs font-assistant leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    פריים זול עכשיו אך תנודתי מאוד. עלייה של 1% בריבית בנק ישראל תגדיל את התשלום החודשי שלך ב-
                    <span className="font-bold" style={{ color: '#FF4B5C' }}>
                      {' '}₪{fmtFull(hikeImpact)}/חודש
                    </span>
                    {' '}(₪{fmtFull(hikeImpact * 12)}/שנה).
                  </p>
                </>
              )}
              {track.type === 'cpi-linked' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={11} style={{ color: '#FF6B35' }} />
                    <span className="text-xs font-assistant font-bold" style={{ color: '#FF6B35' }}>
                      אזהרה — יתרת קרן גדלה
                    </span>
                  </div>
                  <p className="text-xs font-assistant leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    האינפלציה מגדילה את יתרת הקרן כל חודש לפני חישוב התשלום. בשנה הראשונה לבד, הקרן תגדל בכ-
                    <span className="font-bold" style={{ color: '#FF6B35' }}>
                      {' '}₪{fmtFull(inflationGrowth)}
                    </span>
                    {' '}(בהנחת אינפלציה 3.5%). ייתכן שתחזיר יותר ממה שלווית בשנים הראשונות.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inputs */}
      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
        <NumberInput
          label="סכום (₪)"
          value={track.principal}
          min={50_000}
          max={10_000_000}
          step={50_000}
          prefix="₪"
          onChange={(v) => onUpdate({ principal: v })}
        />
        <NumberInput
          label="תקופה (חודשים)"
          value={track.months}
          min={12}
          max={360}
          step={12}
          suffix="ח׳"
          onChange={(v) => onUpdate({ months: v })}
        />
        {track.type === 'prime' ? (
          <NumberInput
            label="מרווח מעל פריים (%)"
            value={track.margin ?? 1.5}
            min={0}
            max={5}
            step={0.1}
            suffix="%"
            onChange={(v) => onUpdate({ margin: v })}
          />
        ) : (
          <NumberInput
            label="ריבית שנתית (%)"
            value={track.rate}
            min={0.5}
            max={15}
            step={0.1}
            suffix="%"
            onChange={(v) => onUpdate({ rate: v })}
          />
        )}
        <div
          className="flex flex-col justify-center items-center rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
            ריבית אפקטיבית
          </p>
          <p className="text-sm font-montserrat font-bold" style={{ color: meta.color }}>
            {effectiveRate.toFixed(1)}%
          </p>
          <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
            {track.months >= 12 ? `${Math.round(track.months / 12)} שנה` : `${track.months} ח׳`}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Add Track Buttons ────────────────────────────────────────────────────────

function AddTrackRow({ onAdd }: { onAdd: (type: MortgageTrack['type']) => void }) {
  const tracks: { type: MortgageTrack['type']; shortLabel: string }[] = [
    { type: 'prime',           shortLabel: 'פריים' },
    { type: 'fixed',           shortLabel: 'קבועה' },
    { type: 'cpi-linked',      shortLabel: 'צמוד מדד' },
    { type: 'equal-principal', shortLabel: 'קרן שווה' },
  ]
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-assistant font-semibold" style={{ color: 'var(--text-muted)' }}>
        + הוסף מסלול
      </p>
      <div className="grid grid-cols-2 gap-2">
        {tracks.map(({ type, shortLabel }) => {
          const meta = TRACK_META[type]
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-assistant font-semibold transition-all"
              style={{
                background: meta.bgColor,
                border: `1px solid ${meta.borderColor}`,
                color: meta.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${meta.color}15`
                e.currentTarget.style.borderColor = `${meta.color}50`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = meta.bgColor
                e.currentTarget.style.borderColor = meta.borderColor
              }}
            >
              <Plus size={11} />
              {shortLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function MortgagePanel() {
  const {
    params,
    addMortgageTrack,
    updateMortgageTrack,
    removeMortgageTrack,
  } = useSimulationStore()
  const { mortgageTracks, boiRate } = params

  return (
    <div className="space-y-3">
      {/* Property setup — always visible */}
      <PropertySetupSection />

      {/* Track cards */}
      <AnimatePresence>
        {mortgageTracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            boiRate={boiRate}
            onUpdate={(u) => updateMortgageTrack(track.id, u)}
            onRemove={() => removeMortgageTrack(track.id)}
          />
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {mortgageTracks.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-6 rounded-2xl gap-2"
          style={{
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
          }}
        >
          <Home size={22} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs font-assistant text-center" style={{ color: 'var(--text-muted)', maxWidth: 180 }}>
            לא הוגדרו מסלולי משכנתא.
            <br />
            הוסף מסלול כדי לחשב.
          </p>
        </div>
      )}

      {/* Add track */}
      <AddTrackRow onAdd={addMortgageTrack} />

      {/* Money Burned — only when tracks exist */}
      <MoneyBurnedSection />
    </div>
  )
}
