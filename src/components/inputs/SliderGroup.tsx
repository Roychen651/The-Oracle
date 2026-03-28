import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface SliderGroupProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatter?: (v: number) => string;
  tooltip?: string;
  suffix?: string;
  className?: string;
}

function defaultFormatter(v: number): string {
  return `₪${v.toLocaleString('he-IL')}`;
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
}: SliderGroupProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary text-sm font-assistant">{label}</span>
          {tooltip && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="מידע נוסף"
              >
                <Info size={12} />
              </button>
              <AnimatePresence>
                {showTooltip && (
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
        </div>

        {/* Current value */}
        <div className="flex items-baseline gap-0.5">
          <span className="text-gold font-montserrat font-bold text-base">
            {formatter(value)}
          </span>
          {suffix && (
            <span className="text-text-muted text-xs font-assistant">{suffix}</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full pointer-events-none"
          style={{
            width: `${percentage}%`,
            background: 'var(--gold)',
            opacity: 0.6,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full cursor-pointer relative z-10"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between">
        <span className="text-text-muted text-xs font-montserrat">{formatter(min)}</span>
        <span className="text-text-muted text-xs font-montserrat">{formatter(max)}</span>
      </div>
    </div>
  );
}
