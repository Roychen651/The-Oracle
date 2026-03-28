import { useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'gold' | 'green' | 'red' | 'blue';
  subtitle?: string;
  delay?: number;
}

function formatLargeNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (abs >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return value.toFixed(0);
}

const colorMap = {
  gold: 'text-gold',
  green: 'text-accent-green',
  red: 'text-accent-red',
  blue: 'text-accent-blue',
};

const trendColors = {
  up: 'text-accent-green',
  down: 'text-accent-red',
  neutral: 'text-text-muted',
};

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
  const motionValue = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      delay,
      ease: 'easeOut',
      onUpdate: (latest) => {
        if (displayRef.current) {
          displayRef.current.textContent = formatLargeNumber(latest);
        }
      },
    });
    return () => controls.stop();
  }, [value, delay, motionValue]);

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-surface border border-border-custom rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-gold/40 transition-colors duration-300"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, var(--gold-glow) 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-sm font-assistant font-medium">
          {label}
        </span>
        <TrendIcon
          size={16}
          className={trendColors[trend]}
        />
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-xs font-montserrat ${colorMap[color]} opacity-80`}>
          {prefix}
        </span>
        <span
          ref={displayRef}
          className={`text-2xl font-montserrat font-bold ${colorMap[color]}`}
          style={{
            textShadow: color === 'gold' ? '0 0 20px var(--gold-glow-strong)' : undefined,
          }}
        >
          {formatLargeNumber(value)}
        </span>
        {suffix && (
          <span className="text-text-muted text-xs font-assistant">{suffix}</span>
        )}
      </div>

      {subtitle && (
        <span className="text-text-muted text-xs font-assistant">{subtitle}</span>
      )}
    </motion.div>
  );
}

// Named export for flexibility
export { StatsCard };
