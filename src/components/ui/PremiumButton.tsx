import { useRef, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

const SIZES: Record<Size, { padding: string; fontSize: number; height: number; radius: number }> = {
  sm: { padding: '6px 14px',  fontSize: 12, height: 36, radius: 10 },
  md: { padding: '10px 20px', fontSize: 14, height: 44, radius: 12 },
  lg: { padding: '13px 28px', fontSize: 15, height: 52, radius: 14 },
}

const STYLES: Record<Variant, {
  background: string
  color: string
  border: string
  hoverShadow: string
  glowColor: string
}> = {
  primary: {
    background: 'linear-gradient(135deg, #D4B060 0%, #C8A951 50%, #A07830 100%)',
    color: '#050508',
    border: 'none',
    hoverShadow: '0 0 32px rgba(200,169,81,0.5), 0 4px 20px rgba(0,0,0,0.4)',
    glowColor: 'rgba(200,169,81,0.35)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    hoverShadow: '0 2px 12px rgba(0,0,0,0.2)',
    glowColor: 'rgba(200,169,81,0.08)',
  },
  danger: {
    background: 'rgba(255,75,92,0.1)',
    color: 'var(--accent-red)',
    border: '1px solid rgba(255,75,92,0.25)',
    hoverShadow: '0 0 20px rgba(255,75,92,0.25), 0 4px 12px rgba(0,0,0,0.3)',
    glowColor: 'rgba(255,75,92,0.2)',
  },
  subtle: {
    background: 'rgba(200,169,81,0.1)',
    color: 'var(--gold)',
    border: '1px solid rgba(200,169,81,0.2)',
    hoverShadow: '0 0 20px rgba(200,169,81,0.2), 0 4px 12px rgba(0,0,0,0.2)',
    glowColor: 'rgba(200,169,81,0.15)',
  },
}

const MAGNETIC_STRENGTH = 0.38 // how far the button follows the cursor (0–1)
const SPRING = { stiffness: 220, damping: 22, mass: 0.8 }

export default function PremiumButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,
}: PremiumButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  // Magnetic motion values
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, SPRING)
  const y = useSpring(rawY, SPRING)

  // Glow follows mouse within button
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const glowX = useTransform(mouseX, (v) => `${v}%`)
  const glowY = useTransform(mouseY, (v) => `${v}%`)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rawX.set((e.clientX - cx) * MAGNETIC_STRENGTH)
    rawY.set((e.clientY - cy) * MAGNETIC_STRENGTH)
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const handleMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
    mouseX.set(50)
    mouseY.set(50)
  }

  const style = STYLES[variant]
  const sizing = SIZES[size]
  const isActive = !disabled && !loading

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={isActive ? onClick : undefined}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        background: style.background,
        color: style.color,
        border: style.border,
        padding: sizing.padding,
        fontSize: sizing.fontSize,
        minHeight: sizing.height,
        borderRadius: sizing.radius,
        width: fullWidth ? '100%' : undefined,
        cursor: disabled ? 'not-allowed' : loading ? 'wait' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        fontFamily: "'Assistant', sans-serif",
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        flexShrink: 0,
      }}
      whileHover={isActive ? { scale: 1.03, boxShadow: style.hoverShadow } : undefined}
      whileTap={isActive ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22, mass: 0.6 }}
      className={className}
    >
      {/* Inner glow that follows cursor */}
      <motion.span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle at ${glowX} ${glowY}, ${style.glowColor} 0%, transparent 65%)`,
          pointerEvents: 'none',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Top-edge shine for primary */}
      {variant === 'primary' && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            borderRadius: '0 0 4px 4px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content */}
      {loading ? (
        <svg
          aria-hidden
          width={sizing.fontSize + 2}
          height={sizing.fontSize + 2}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ animation: 'spin 0.75s linear infinite' }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
      ) : (
        <>
          {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
          <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        </>
      )}
    </motion.button>
  )
}

export { PremiumButton }
