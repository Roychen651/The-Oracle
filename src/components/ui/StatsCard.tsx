import { useEffect } from 'react'
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'gold' | 'green' | 'red' | 'blue'
  subtitle?: string
  delay?: number
}

function formatLargeNumber(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M'
  if (abs >= 1_000)     return sign + (abs / 1_000).toFixed(0) + 'K'
  return Math.round(value).toString()
}

// Animate MotionValue<number> → display string
function AnimatedNumber({ mv, formatter }: { mv: MotionValue<number>; formatter: (v: number) => string }) {
  const display = useTransform(mv, formatter)
  return <motion.span>{display}</motion.span>
}

const colorTokens: Record<string, { text: string; glow: string; gradient: string }> = {
  gold:  { text: 'var(--gold)',         glow: 'rgba(200,169,81,0.25)',  gradient: 'radial-gradient(circle at 50% 0%, rgba(200,169,81,0.12) 0%, transparent 70%)' },
  green: { text: 'var(--accent-green)', glow: 'rgba(52,212,168,0.2)',   gradient: 'radial-gradient(circle at 50% 0%, rgba(52,212,168,0.08) 0%, transparent 70%)' },
  red:   { text: 'var(--accent-red)',   glow: 'rgba(255,75,92,0.2)',    gradient: 'radial-gradient(circle at 50% 0%, rgba(255,75,92,0.08) 0%, transparent 70%)' },
  blue:  { text: 'var(--accent-blue)',  glow: 'rgba(91,120,255,0.2)',   gradient: 'radial-gradient(circle at 50% 0%, rgba(91,120,255,0.08) 0%, transparent 70%)' },
}

const trendColors = {
  up:      'var(--accent-green)',
  down:    'var(--accent-red)',
  neutral: 'var(--text-muted)',
}

export default function StatsCard({
  label,
  value,
  prefix = '₪',
  suffix = '',
  trend = 'neutral',
  color = 'gold',
  subtitle,
  delay = 0,
}: StatsCardProps) {
  // Spring-animated number value
  const springValue = useSpring(0, {
    stiffness: 55,
    damping: 20,
    mass: 0.9,
  })

  useEffect(() => {
    // Small delay so cards stagger in nicely
    const t = setTimeout(() => springValue.set(value), delay * 1000)
    return () => clearTimeout(t)
  }, [value, delay, springValue])

  const tokens = colorTokens[color] ?? colorTokens.gold
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden group"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        cursor: 'default',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      whileHover={{
        borderColor: `${tokens.glow.replace('0.25', '0.4').replace('0.2', '0.35')}`,
        boxShadow: `0 0 24px ${tokens.glow}, var(--shadow-card)`,
      }}
    >
      {/* Background glow — fades in on hover */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: tokens.gradient }}
      />

      {/* Top row: label + trend icon */}
      <div className="flex items-center justify-between relative z-10">
        <span
          className="font-assistant font-medium text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <TrendIcon size={15} style={{ color: trendColors[trend], flexShrink: 0 }} />
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-1 relative z-10">
        {prefix && (
          <span
            className="font-montserrat font-semibold text-sm"
            style={{ color: tokens.text, opacity: 0.75 }}
          >
            {prefix}
          </span>
        )}
        <span
          className="font-montserrat font-bold"
          style={{
            fontSize: 26,
            lineHeight: 1,
            color: tokens.text,
            textShadow: color === 'gold' ? `0 0 24px ${tokens.glow}` : undefined,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          <AnimatedNumber mv={springValue} formatter={formatLargeNumber} />
        </span>
        {suffix && (
          <span
            className="font-assistant text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span
          className="font-assistant text-xs relative z-10"
          style={{ color: 'var(--text-muted)' }}
        >
          {subtitle}
        </span>
      )}
    </motion.div>
  )
}

// Named export for flexibility
export { StatsCard }
