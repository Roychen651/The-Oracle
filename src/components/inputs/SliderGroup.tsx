import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TooltipInfo from '../ui/TooltipInfo'
import ActionPreview from '../ui/ActionPreview'
import { useSimulationStore } from '../../stores/useSimulationStore'

interface TooltipInfoData {
  term: string
  explanation: string
  impact?: string
}

interface SliderGroupProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatter?: (v: number) => string
  tooltip?: string
  suffix?: string
  className?: string
  dataTour?: string
  tooltipInfo?: TooltipInfoData
  showActionPreview?: boolean
  previousValue?: number
}

function defaultFormatter(v: number): string {
  return `₪${v.toLocaleString('he-IL')}`
}

export default function SliderGroup({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatter = defaultFormatter,
  tooltip,
  suffix,
  className = '',
  dataTour,
  tooltipInfo,
  showActionPreview = false,
  previousValue,
}: SliderGroupProps) {
  const [showLegacyTooltip, setShowLegacyTooltip] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const prevValueRef = useRef(value)

  const results = useSimulationStore((s) => s.results)
  const params = useSimulationStore((s) => s.params)

  // Track value changes for pulse animation
  const [pulseKey, setPulseKey] = useState(0)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      setPulseKey((k) => k + 1)
      prevValueRef.current = value
    }
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange]
  )

  const percentage = ((value - min) / (max - min)) * 100

  const deltaMonthly =
    showActionPreview && previousValue !== undefined ? value - previousValue : 0

  const sliderStyle: React.CSSProperties = {
    background: `linear-gradient(to left, var(--gold) ${percentage}%, var(--border) ${percentage}%)`,
  }

  return (
    <div className={`space-y-2 ${className}`} data-tour={dataTour}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary text-sm font-assistant">{label}</span>

          {/* Legacy tooltip (plain string) */}
          {tooltip && !tooltipInfo && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowLegacyTooltip(true)}
                onMouseLeave={() => setShowLegacyTooltip(false)}
                onFocus={() => setShowLegacyTooltip(true)}
                onBlur={() => setShowLegacyTooltip(false)}
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="מידע נוסף"
              >
                <span className="text-xs opacity-60">ⓘ</span>
              </button>
              <AnimatePresence>
                {showLegacyTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-6 right-0 z-50 w-52 p-3 bg-surface-elevated border border-border-custom rounded-xl shadow-xl text-text-secondary text-xs font-assistant leading-relaxed"
                  >
                    {tooltip}
                    <div
                      className="absolute top-full right-2 w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid var(--border)',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Rich TooltipInfo component */}
          {tooltipInfo && (
            <TooltipInfo
              term={tooltipInfo.term}
              explanation={tooltipInfo.explanation}
              impact={tooltipInfo.impact}
            />
          )}
        </div>

        {/* Current value with pulse animation */}
        <motion.div
          key={pulseKey}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-baseline gap-0.5"
        >
          <span className="text-gold font-numbers font-bold text-base number-ticker">
            {formatter(value)}
          </span>
          {suffix && <span className="text-text-muted text-xs font-assistant">{suffix}</span>}
        </motion.div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full cursor-pointer relative z-10"
          style={sliderStyle}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between">
        <span className="text-text-muted text-xs font-numbers">{formatter(min)}</span>
        <span className="text-text-muted text-xs font-numbers">{formatter(max)}</span>
      </div>

      {/* Action preview */}
      {showActionPreview && previousValue !== undefined && (
        <ActionPreview
          deltaMonthly={deltaMonthly}
          currentNetWorth={results?.finalNetWorth ?? 0}
          simulationYears={params.years}
          visible={isDragging || Math.abs(deltaMonthly) > 0}
        />
      )}
    </div>
  )
}
