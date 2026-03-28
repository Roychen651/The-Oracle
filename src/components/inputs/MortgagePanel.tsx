import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Home, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '../../stores/useSimulationStore';
import type { MortgageTrack } from '../../lib/finance-engine';
import { spitzerMonthlyPayment } from '../../lib/finance-engine';

const TRACK_COLORS: Record<MortgageTrack['type'], string> = {
  prime: 'text-accent-blue border-accent-blue/30 bg-accent-blue/5',
  fixed: 'text-accent-green border-accent-green/30 bg-accent-green/5',
  'cpi-linked': 'text-accent-red border-accent-red/30 bg-accent-red/5',
  'equal-principal': 'text-gold border-gold/30 bg-gold/5',
};

const TRACK_LABEL_COLORS: Record<MortgageTrack['type'], string> = {
  prime: 'text-accent-blue',
  fixed: 'text-accent-green',
  'cpi-linked': 'text-accent-red',
  'equal-principal': 'text-gold',
};

function formatNumber(n: number): string {
  return n.toLocaleString('he-IL');
}

export default function MortgagePanel() {
  const { t } = useTranslation();
  const { params, addMortgageTrack, updateMortgageTrack, removeMortgageTrack, results } =
    useSimulationStore();
  const { mortgageTracks } = params;

  const totalPrincipal = mortgageTracks.reduce((sum, t) => sum + t.principal, 0);
  const totalMonthlyPayment = results?.monthlyBreakdown.mortgage ?? 0;

  // Budget health: what % of income goes to mortgage
  const mortgageLoadPct =
    params.monthlyIncome > 0
      ? Math.min(100, (totalMonthlyPayment / params.monthlyIncome) * 100)
      : 0;

  const healthColor =
    mortgageLoadPct > 40
      ? 'bg-accent-red'
      : mortgageLoadPct > 30
        ? 'bg-yellow-500'
        : 'bg-accent-green';

  return (
    <div className="space-y-4">
      {/* Summary */}
      {mortgageTracks.length > 0 && (
        <div className="bg-surface rounded-xl p-3 border border-border-custom">
          <div className="flex justify-between items-center mb-1">
            <span className="text-text-secondary text-xs font-assistant">
              {t('mortgage.totalMortgage')}
            </span>
            <span className="text-text-primary font-montserrat font-bold text-sm">
              ₪{formatNumber(totalPrincipal)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-secondary text-xs font-assistant">
              {t('mortgage.monthlyPayment')}
            </span>
            <span className="text-gold font-montserrat font-bold text-sm">
              ₪{formatNumber(Math.round(totalMonthlyPayment))}
            </span>
          </div>

          {/* Budget health bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-muted text-xs font-assistant flex items-center gap-1">
                {mortgageLoadPct > 40 && <AlertTriangle size={10} className="text-accent-red" />}
                {t('mortgage.budgetHealth')}
              </span>
              <span className="text-text-secondary text-xs font-montserrat">
                {mortgageLoadPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-border-custom rounded-full overflow-hidden">
              <div
                className={`energy-bar h-full rounded-full ${healthColor}`}
                style={{ width: `${mortgageLoadPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Track cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {mortgageTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              boiRate={params.boiRate}
              onUpdate={(updates) => updateMortgageTrack(track.id, updates)}
              onRemove={() => removeMortgageTrack(track.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {mortgageTracks.length === 0 && (
        <div className="text-center py-4">
          <Home size={24} className="text-text-muted mx-auto mb-2" />
          <p className="text-text-muted text-xs font-assistant">{t('mortgage.noTracks')}</p>
        </div>
      )}

      {/* Add track buttons */}
      <div className="space-y-2">
        <p className="text-text-muted text-xs font-assistant">{t('mortgage.addTrack')}:</p>
        <div className="flex flex-wrap gap-2">
          <TrackButton
            label={t('mortgage.prime')}
            color="text-accent-blue"
            onClick={() => addMortgageTrack('prime')}
          />
          <TrackButton
            label={t('mortgage.fixed')}
            color="text-accent-green"
            onClick={() => addMortgageTrack('fixed')}
          />
          <TrackButton
            label={t('mortgage.cpiLinked')}
            color="text-accent-red"
            onClick={() => addMortgageTrack('cpi-linked')}
          />
          <TrackButton
            label="קרן שווה"
            color="text-gold"
            onClick={() => addMortgageTrack('equal-principal')}
          />
        </div>
      </div>
    </div>
  );
}

interface TrackButtonProps {
  label: string;
  color: string;
  onClick: () => void;
}

function TrackButton({ label, color, onClick }: TrackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-elevated border border-border-custom hover:border-gold/50 transition-colors text-xs font-assistant text-text-secondary hover:text-text-primary"
    >
      <Plus size={10} className={color} />
      <span>{label}</span>
    </button>
  );
}

interface TrackCardProps {
  track: MortgageTrack;
  boiRate: number;
  onUpdate: (updates: Partial<MortgageTrack>) => void;
  onRemove: () => void;
}

function TrackCard({ track, boiRate, onUpdate, onRemove }: TrackCardProps) {
  const { t } = useTranslation();

  const effectiveRate =
    track.type === 'prime' ? boiRate + (track.margin ?? 1.5) : track.rate;

  const monthlyPayment = spitzerMonthlyPayment(track.principal, effectiveRate, track.months);

  const typeLabel =
    track.type === 'prime'
      ? t('mortgage.prime')
      : track.type === 'fixed'
        ? t('mortgage.fixed')
        : track.type === 'equal-principal'
          ? 'קרן שווה'
          : t('mortgage.cpiLinked');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`border rounded-xl p-3 ${TRACK_COLORS[track.type]}`}
    >
      {/* Track header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-assistant font-bold ${TRACK_LABEL_COLORS[track.type]}`}>
          {typeLabel}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs font-montserrat">
            ₪{Math.round(monthlyPayment).toLocaleString('he-IL')}/חודש
          </span>
          <button
            onClick={onRemove}
            className="text-text-muted hover:text-accent-red transition-colors"
            aria-label={t('mortgage.removeTrack')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label={t('mortgage.principal')}
          value={track.principal}
          min={50000}
          max={5000000}
          step={50000}
          prefix="₪"
          onChange={(v) => onUpdate({ principal: v })}
        />
        <InputField
          label={t('mortgage.months')}
          value={track.months}
          min={12}
          max={360}
          step={12}
          suffix="ח׳"
          onChange={(v) => onUpdate({ months: v })}
        />
        {track.type === 'prime' ? (
          <InputField
            label={t('mortgage.margin')}
            value={track.margin ?? 1.5}
            min={0}
            max={5}
            step={0.1}
            suffix="%"
            onChange={(v) => onUpdate({ margin: v })}
          />
        ) : (
          <InputField
            label={t('mortgage.rate')}
            value={track.rate}
            min={0.5}
            max={15}
            step={0.1}
            suffix="%"
            onChange={(v) => onUpdate({ rate: v })}
          />
        )}
        <div className="text-center">
          <p className="text-text-muted text-xs font-assistant">ריבית אפקטיבית</p>
          <p className="text-text-secondary text-sm font-montserrat font-bold">
            {effectiveRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface InputFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (v: number) => void;
}

function InputField({ label, value, min, max, step, prefix, suffix, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="text-text-muted text-xs font-assistant block mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-surface-elevated border border-border-custom rounded-lg py-1.5 text-xs font-montserrat text-text-primary text-center outline-none focus:border-gold transition-colors"
          style={{ paddingRight: prefix ? '20px' : undefined }}
        />
        {suffix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
