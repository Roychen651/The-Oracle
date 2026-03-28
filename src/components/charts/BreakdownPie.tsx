import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { SimulationResult } from '../../lib/finance-engine';

interface BreakdownPieProps {
  breakdown: SimulationResult['monthlyBreakdown'];
  monthlyIncome: number;
}

const COLORS = {
  mortgage: '#C8A951',
  car: '#5B78FF',
  expenses: '#FF4B5C',
  savings: '#34D4A8',
};

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-xl shadow-xl p-3"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      <p className="text-xs font-assistant" style={{ color: 'var(--text-secondary)' }}>
        {item.name}
      </p>
      <p
        className="text-sm font-montserrat font-bold mt-0.5"
        style={{ color: item.payload.color }}
      >
        ₪{Number(item.value).toLocaleString('he-IL')}
      </p>
    </div>
  );
}

function CustomLegend({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="space-y-2 mt-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span
              className="text-xs font-assistant"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-montserrat" style={{ color: 'var(--text-muted)' }}>
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </span>
            <span
              className="text-xs font-montserrat font-bold"
              style={{ color: item.color }}
            >
              ₪{item.value.toLocaleString('he-IL')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BreakdownPie({ breakdown, monthlyIncome }: BreakdownPieProps) {
  const { t } = useTranslation();

  const data = [
    {
      name: t('breakdown.mortgage'),
      value: Math.round(breakdown.mortgage),
      color: COLORS.mortgage,
    },
    {
      name: t('breakdown.car'),
      value: Math.round(breakdown.car),
      color: COLORS.car,
    },
    {
      name: t('breakdown.expenses'),
      value: Math.round(breakdown.expenses),
      color: COLORS.expenses,
    },
    {
      name: t('breakdown.savings'),
      value: Math.round(Math.max(0, breakdown.savings)),
      color: COLORS.savings,
    },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-text-muted text-sm font-assistant">אין נתונים</p>
      </div>
    );
  }

  const totalOut = breakdown.mortgage + breakdown.car + breakdown.expenses;
  const utilizationPct =
    monthlyIncome > 0 ? Math.min(100, (totalOut / monthlyIncome) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={0.85}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Utilization rate */}
      <div className="text-center mb-3 -mt-2">
        <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
          ניצול הכנסה
        </p>
        <p
          className="text-xl font-montserrat font-bold"
          style={{
            color:
              utilizationPct > 80
                ? '#FF4B5C'
                : utilizationPct > 60
                  ? '#C8A951'
                  : '#34D4A8',
          }}
        >
          {utilizationPct.toFixed(0)}%
        </p>
      </div>

      <CustomLegend data={data} />
    </motion.div>
  );
}
