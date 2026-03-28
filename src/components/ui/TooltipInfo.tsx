import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipInfoProps {
  term: string
  explanation: string
  impact?: string
  className?: string
}

export default function TooltipInfo({ term, explanation, impact, className = '' }: TooltipInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [flipLeft, setFlipLeft] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Detect if near right edge and flip tooltip
  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      setFlipLeft(rect.right > viewportWidth - 300)
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen((v) => !v)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-500 text-xs flex items-center justify-center cursor-help border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors flex-shrink-0"
        aria-label={`מידע על ${term}`}
      >
        ⓘ
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              transformOrigin: flipLeft ? 'top left' : 'top right',
              position: 'absolute',
              top: '100%',
              ...(flipLeft ? { left: 0 } : { right: 0 }),
              marginTop: '6px',
            }}
            className="z-50 w-72 bg-surface-elevated border border-border-custom rounded-2xl p-4 shadow-2xl"
            role="tooltip"
          >
            <p className="text-yellow-500 font-assistant font-semibold text-sm mb-2">{term}</p>
            <p className="text-text-secondary font-assistant text-xs leading-relaxed">{explanation}</p>
            {impact && (
              <p className="text-yellow-400/70 font-assistant text-xs italic mt-2 pt-2 border-t border-border-custom">
                {impact}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
