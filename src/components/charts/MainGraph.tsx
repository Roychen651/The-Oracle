import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  TooltipProps,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { YearlyDataPoint } from '../../lib/finance-engine';
import { FIRE_MILESTONE_LABELS } from '../../lib/finance-engine';

interface MainGraphProps {
  data: YearlyDataPoint[];
  selectedYear: number;
  onYearSelect: (year: number) => void;
}

function formatYAxis(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `₪${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₪${(value / 1_000).toFixed(0)}K`;
  return `₪${value}`;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl shadow-2xl p-4 min-w-[180px]"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="text-xs font-montserrat font-bold mb-3 pb-2"
        style={{
          color: 'var(--gold)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        שנה {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4 mb-1">
          <span className="text-xs font-assistant" style={{ color: 'var(--text-secondary)' }}>
            {entry.name}
          </span>
          <span
            className="text-xs font-montserrat font-bold"
            style={{ color: entry.color }}
          >
            {formatYAxis(entry.value as number)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MainGraph({ data, selectedYear, onYearSelect }: MainGraphProps) {
  const { t } = useTranslation();

  const handleClick = useCallback(
    (data: { activePayload?: Array<{ payload: YearlyDataPoint }> }) => {
      if (data?.activePayload?.[0]) {
        onYearSelect(data.activePayload[0].payload.year);
      }
    },
    [onYearSelect]
  );

  if (data.length === 0) {
    return (
      <div className="h-[420px] flex items-center justify-center">
        <p className="text-text-muted font-assistant text-sm">אין נתונים להצגה</p>
      </div>
    );
  }

  const selectedData = data.find((d) => d.year === selectedYear);

  // Collect milestone years for reference lines (deduplicate, keep first milestone per year)
  const milestoneLines: Array<{ year: number; icon: string }> = [];
  const seenMilestoneYears = new Set<number>();
  for (const d of data) {
    if (d.milestones.length > 0 && !seenMilestoneYears.has(d.year)) {
      seenMilestoneYears.add(d.year);
      const first = d.milestones[0];
      milestoneLines.push({
        year: d.year,
        icon: FIRE_MILESTONE_LABELS[first].icon,
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Chart */}
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            onClick={handleClick}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              {/* Gold gradient for net worth */}
              <linearGradient id="gradNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8A951" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C8A951" stopOpacity={0.02} />
              </linearGradient>

              {/* Red gradient for debt */}
              <linearGradient id="gradDebt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4B5C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF4B5C" stopOpacity={0.02} />
              </linearGradient>

              {/* Green gradient for assets */}
              <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D4A8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#34D4A8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Montserrat' }}
              tickFormatter={(v) => `${v}`}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Montserrat' }}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              width={65}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'var(--gold)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
                strokeOpacity: 0.6,
              }}
            />

            {/* Reference line for selected year */}
            <ReferenceLine
              x={selectedYear}
              stroke="var(--gold)"
              strokeWidth={2}
              strokeOpacity={0.8}
              strokeDasharray="4 4"
            />

            {/* Assets area */}
            <Area
              type="monotone"
              dataKey="assets"
              name={t('chart.assets')}
              stroke="#34D4A8"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              fill="url(#gradAssets)"
              dot={false}
              activeDot={{ r: 4, fill: '#34D4A8', stroke: 'var(--surface)' }}
            />

            {/* Total Debt area */}
            <Area
              type="monotone"
              dataKey="totalDebt"
              name={t('chart.totalDebt')}
              stroke="#FF4B5C"
              strokeWidth={2}
              fill="url(#gradDebt)"
              dot={false}
              activeDot={{ r: 4, fill: '#FF4B5C', stroke: 'var(--surface)' }}
            />

            {/* Net Worth area — on top */}
            <Area
              type="monotone"
              dataKey="netWorth"
              name={t('chart.netWorth')}
              stroke="#C8A951"
              strokeWidth={2.5}
              fill="url(#gradNetWorth)"
              dot={false}
              activeDot={{ r: 5, fill: '#C8A951', stroke: 'var(--surface)', strokeWidth: 2 }}
            />

            {/* FIRE milestone reference lines */}
            {milestoneLines.map(({ year, icon }) => (
              <ReferenceLine
                key={year}
                x={year}
                stroke="rgba(200,169,81,0.45)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: icon,
                  position: 'top',
                  fontSize: 14,
                  fill: 'var(--gold)',
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Year cursor card */}
      {selectedData && (
        <motion.div
          key={selectedYear}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <YearStatCard
            label={t('stats.netWorth')}
            value={selectedData.netWorth}
            color="#C8A951"
          />
          <YearStatCard
            label={t('stats.totalDebt')}
            value={selectedData.totalDebt}
            color="#FF4B5C"
          />
          <YearStatCard
            label={t('stats.assets')}
            value={selectedData.assets}
            color="#34D4A8"
          />
          <YearStatCard
            label={t('stats.cashFlow')}
            value={selectedData.cashFlow}
            color={selectedData.cashFlow >= 0 ? '#34D4A8' : '#FF4B5C'}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

interface YearStatCardProps {
  label: string;
  value: number;
  color: string;
}

function YearStatCard({ label, value, color }: YearStatCardProps) {
  const absVal = Math.abs(value);
  const formatted =
    absVal >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : absVal >= 1_000
        ? `${(value / 1_000).toFixed(0)}K`
        : value.toFixed(0);

  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-assistant mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="text-base font-montserrat font-bold" style={{ color }}>
        ₪{formatted}
      </p>
    </div>
  );
}
