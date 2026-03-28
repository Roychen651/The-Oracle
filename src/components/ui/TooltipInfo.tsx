import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipInfoProps {
  term: string
  explanation: string
  impact?: string
  className?: string
}

interface TooltipPosition {
  top: number
  left: number
}

const TOOLTIP_WIDTH = 280
const TOOLTIP_MARGIN = 8
const VIEWPORT_PADDING = 12

function computePosition(btnRect: DOMRect): TooltipPosition {
  // Place below the button by default
  let top = btnRect.bottom + TOOLTIP_MARGIN
  let left = btnRect.right - TOOLTIP_WIDTH // align right edge with button right edge

  // Viewport width clamping (handles RTL overflow)
  const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PADDING
  const minLeft = VIEWPORT_PADDING
  left = Math.max(minLeft, Math.min(left, maxLeft))

  // Flip above if not enough space below
  if (top + 160 > window.innerHeight - VIEWPORT_PADDING) {
    top = btnRect.top - 160 - TOOLTIP_MARGIN
  }

  return { top, left }
}

export default function TooltipInfo({ term, explanation, impact, className = '' }: TooltipInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback(() => {
    if (!btnRef.current) return
    setPosition(computePosition(btnRef.current.getBoundingClientRect()))
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    setIsOpen(false)
  }, [])

  // Close on outside click / escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const onClick = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !tooltipRef.current?.contains(e.target as Node)
      ) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [isOpen, close])

  // Recompute on scroll / resize while open
  useEffect(() => {
    if (!isOpen || !btnRef.current) return
    const update = () => {
      if (btnRef.current) setPosition(computePosition(btnRef.current.getBoundingClientRect()))
    }
    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen])

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={tooltipRef}
          role="tooltip"
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: TOOLTIP_WIDTH,
            zIndex: 9999,
          }}
          className="card-elevated shadow-2xl p-4 pointer-events-auto"
          onMouseEnter={() => {
            if (openTimerRef.current) clearTimeout(openTimerRef.current)
          }}
          onMouseLeave={close}
        >
          <p className="font-bold text-sm mb-2" style={{ color: 'var(--gold)', fontFamily: 'Assistant, sans-serif' }}>
            {term}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Assistant, sans-serif' }}>
            {explanation}
          </p>
          {impact && (
            <p
              className="text-xs italic mt-2 pt-2"
              style={{
                color: 'var(--gold-dim)',
                borderTop: '1px solid var(--border)',
                fontFamily: 'Assistant, sans-serif',
              }}
            >
              {impact}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Use portal to escape any stacking context / overflow:hidden parents
  const portal = typeof document !== 'undefined'
    ? createPortal(tooltipContent, document.body)
    : null

  return (
    <span className={`relative inline-flex items-center flex-shrink-0 ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => {
          openTimerRef.current = setTimeout(open, 120) // small delay prevents flicker
        }}
        onMouseLeave={() => {
          if (openTimerRef.current) clearTimeout(openTimerRef.current)
          // keep open if mouse moves to tooltip (handled by onMouseLeave of tooltip)
          openTimerRef.current = setTimeout(close, 100)
        }}
        onFocus={open}
        onBlur={close}
        onClick={() => (isOpen ? close() : open())}
        aria-label={`מידע על ${term}`}
        aria-expanded={isOpen}
        className="flex-shrink-0 transition-colors"
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--gold-glow)',
          color: 'var(--gold)',
          fontSize: 10,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          border: '1px solid rgba(200,169,81,0.3)',
          fontFamily: 'monospace',
          lineHeight: 1,
        }}
      >
        i
      </button>
      {portal}
    </span>
  )
}
