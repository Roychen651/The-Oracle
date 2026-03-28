import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Baby, Briefcase, Home, Car, Sunset } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '../../stores/useSimulationStore';
import type { LifeEventType, LifeEvent } from '../../lib/finance-engine';

const EVENT_ICONS: Record<LifeEventType, React.ReactNode> = {
  home_purchase: <Home size={12} />,
  car_purchase: <Car size={12} />,
  child: <Baby size={12} />,
  career_jump: <Briefcase size={12} />,
  retirement: <Sunset size={12} />,
  custom: <Calendar size={12} />,
};

const EVENT_COLORS: Record<LifeEventType, string> = {
  home_purchase: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30',
  car_purchase: 'text-accent-green bg-accent-green/10 border-accent-green/30',
  child: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  career_jump: 'text-gold bg-gold/10 border-gold/30',
  retirement: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  custom: 'text-text-secondary bg-surface border-border-custom',
};

const DEFAULT_IMPACTS: Partial<Record<LifeEventType, Partial<LifeEvent['impact']>>> = {
  child: { expenseChange: 3000 },
  career_jump: { incomeChange: 5000 },
  retirement: { incomeChange: -8000, expenseChange: -2000 },
};

export default function LifeEventsPanel() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const { params, addLifeEvent, removeLifeEvent } = useSimulationStore();
  const { events } = params;

  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-3">
      {/* Timeline */}
      {sortedEvents.length > 0 && (
        <div className="space-y-2">
          {sortedEvents.map((event) => (
            <EventChip
              key={event.id}
              event={event}
              onRemove={() => removeLifeEvent(event.id)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && !showForm && (
        <div className="text-center py-3">
          <Calendar size={20} className="text-text-muted mx-auto mb-1" />
          <p className="text-text-muted text-xs font-assistant">{t('events.noEvents')}</p>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <AddEventForm
            simulationYears={params.years}
            onAdd={(event) => {
              addLifeEvent(event);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border-custom text-text-muted hover:text-gold hover:border-gold transition-colors text-xs font-assistant"
        >
          <Plus size={14} />
          {t('events.addEvent')}
        </button>
      )}
    </div>
  );
}

interface EventChipProps {
  event: LifeEvent;
  onRemove: () => void;
}

function EventChip({ event, onRemove }: EventChipProps) {
  const formatImpact = () => {
    const parts: string[] = [];
    if (event.impact.incomeChange) {
      const sign = event.impact.incomeChange > 0 ? '+' : '';
      parts.push(`הכנסה: ${sign}₪${Math.abs(event.impact.incomeChange).toLocaleString('he-IL')}`);
    }
    if (event.impact.expenseChange) {
      const sign = event.impact.expenseChange > 0 ? '+' : '';
      parts.push(`הוצאות: ${sign}₪${Math.abs(event.impact.expenseChange).toLocaleString('he-IL')}`);
    }
    return parts.join(' | ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-assistant ${EVENT_COLORS[event.type]}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="shrink-0">{EVENT_ICONS[event.type]}</span>
        <div className="min-w-0">
          <div className="font-semibold truncate">{event.labelHe}</div>
          <div className="text-text-muted truncate">{formatImpact()}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <span className="text-text-muted font-montserrat">שנה {event.year}</span>
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-accent-red transition-colors"
          aria-label="הסר אירוע"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

interface AddEventFormProps {
  simulationYears: number;
  onAdd: (event: Omit<LifeEvent, 'id'>) => void;
  onCancel: () => void;
}

function AddEventForm({ simulationYears, onAdd, onCancel }: AddEventFormProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<LifeEventType>('career_jump');
  const [year, setYear] = useState(5);
  const [incomeChange, setIncomeChange] = useState(
    DEFAULT_IMPACTS['career_jump']?.incomeChange ?? 0
  );
  const [expenseChange, setExpenseChange] = useState(
    DEFAULT_IMPACTS['career_jump']?.expenseChange ?? 0
  );

  const handleTypeChange = (newType: LifeEventType) => {
    setType(newType);
    const defaults = DEFAULT_IMPACTS[newType];
    setIncomeChange(defaults?.incomeChange ?? 0);
    setExpenseChange(defaults?.expenseChange ?? 0);
  };

  const EVENT_TYPE_LABELS: Record<LifeEventType, string> = {
    home_purchase: t('events.buyHome'),
    car_purchase: 'קניית רכב',
    child: t('events.havChild'),
    career_jump: t('events.careerJump'),
    retirement: t('events.retirement'),
    custom: t('events.custom'),
  };

  const handleSubmit = () => {
    onAdd({
      type,
      year,
      label: EVENT_TYPE_LABELS[type],
      labelHe: EVENT_TYPE_LABELS[type],
      impact: {
        incomeChange: incomeChange || undefined,
        expenseChange: expenseChange || undefined,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-surface-elevated border border-border-custom rounded-xl p-3 space-y-3 overflow-hidden"
    >
      {/* Event type */}
      <div>
        <label className="text-text-secondary text-xs font-assistant block mb-1">
          סוג אירוע
        </label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as LifeEventType)}
          className="w-full bg-surface border border-border-custom rounded-lg py-1.5 px-2 text-xs font-assistant text-text-primary outline-none focus:border-gold"
        >
          {(Object.keys(EVENT_TYPE_LABELS) as LifeEventType[]).map((key) => (
            <option key={key} value={key}>
              {EVENT_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div>
        <label className="text-text-secondary text-xs font-assistant block mb-1">
          {t('events.atYear')}: {year}
        </label>
        <input
          type="range"
          min={1}
          max={simulationYears}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      {/* Income change */}
      <div>
        <label className="text-text-secondary text-xs font-assistant block mb-1">
          {t('events.incomeChange')} (₪/חודש)
        </label>
        <input
          type="number"
          value={incomeChange}
          step={500}
          onChange={(e) => setIncomeChange(Number(e.target.value))}
          className="w-full bg-surface border border-border-custom rounded-lg py-1.5 px-2 text-xs font-montserrat text-text-primary outline-none focus:border-gold"
        />
      </div>

      {/* Expense change */}
      <div>
        <label className="text-text-secondary text-xs font-assistant block mb-1">
          {t('events.expenseChange')} (₪/חודש)
        </label>
        <input
          type="number"
          value={expenseChange}
          step={500}
          onChange={(e) => setExpenseChange(Number(e.target.value))}
          className="w-full bg-surface border border-border-custom rounded-lg py-1.5 px-2 text-xs font-montserrat text-text-primary outline-none focus:border-gold"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 rounded-lg bg-gold text-bg text-xs font-assistant font-bold hover:bg-gold-light transition-colors"
        >
          {t('common.add')}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-surface border border-border-custom text-text-secondary text-xs font-assistant hover:border-gold transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </motion.div>
  );
}
