import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Wallet,
  Home,
  Car,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';
import SliderGroup from '../inputs/SliderGroup';
import MortgagePanel from '../inputs/MortgagePanel';
import LifeEventsPanel from '../inputs/LifeEventsPanel';
import type { CarLoan } from '../../lib/finance-engine';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

function Section({ title, icon, children, defaultOpen = false, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-custom last:border-b-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-elevated transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-gold opacity-80">{icon}</span>
          <span className="text-text-primary font-assistant font-semibold text-sm">{title}</span>
          {badge && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-montserrat font-bold"
              style={{ background: 'var(--gold)', color: 'var(--bg)' }}
            >
              {badge}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CarLoanSection() {
  const { t } = useTranslation();
  const { params, setCarLoan } = useSimulationStore();
  const { carLoan } = params;

  const isEnabled = carLoan !== null;

  const defaultCarLoan: CarLoan = {
    price: 120000,
    downPayment: 30000,
    rate: 5.5,
    months: 60,
    residualRate: 20,
  };

  const loan = carLoan ?? defaultCarLoan;

  const handleToggle = () => {
    setCarLoan(isEnabled ? null : defaultCarLoan);
  };

  return (
    <div className="space-y-3">
      {/* Enable/disable toggle */}
      <button
        onClick={handleToggle}
        className={`w-full py-2 rounded-xl text-xs font-assistant font-semibold border transition-all ${
          isEnabled
            ? 'border-accent-red/40 text-accent-red bg-accent-red/10 hover:bg-accent-red/20'
            : 'border-border-custom text-text-secondary hover:border-gold hover:text-gold'
        }`}
      >
        {isEnabled ? t('car.disable') : t('car.enable')}
      </button>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <SliderGroup
              label={t('car.price')}
              value={loan.price}
              min={30000}
              max={600000}
              step={5000}
              onChange={(v) => setCarLoan({ ...loan, price: v })}
            />
            <SliderGroup
              label={t('car.downPayment')}
              value={loan.downPayment}
              min={0}
              max={loan.price}
              step={5000}
              onChange={(v) => setCarLoan({ ...loan, downPayment: v })}
            />
            <SliderGroup
              label={t('car.rate')}
              value={loan.rate}
              min={0}
              max={20}
              step={0.1}
              formatter={(v) => `${v.toFixed(1)}%`}
              onChange={(v) => setCarLoan({ ...loan, rate: v })}
            />
            <SliderGroup
              label={t('car.months')}
              value={loan.months}
              min={12}
              max={84}
              step={6}
              formatter={(v) => `${v} חודשים`}
              onChange={(v) => setCarLoan({ ...loan, months: v })}
            />
            <SliderGroup
              label={t('car.residualRate')}
              value={loan.residualRate}
              min={0}
              max={50}
              step={5}
              formatter={(v) => `${v}%`}
              onChange={(v) => setCarLoan({ ...loan, residualRate: v })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const {
    params,
    setMonthlyIncome,
    setMonthlyExpenses,
    setCurrentAssets,
    updateEconomics,
    setSimulationYears,
  } = useSimulationStore();
  const { sidebarOpen } = useUIStore();

  const mortgageCount = params.mortgageTracks.length;
  const eventCount = params.events.length;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-80 shrink-0 bg-surface border-l border-border-custom overflow-y-auto h-full"
          style={{ maxHeight: 'calc(100vh - 64px - 40px)' }}
          aria-label="פאנל הגדרות"
        >
          {/* Income & Expenses */}
          <Section
            title={t('inputs.monthlyIncome')}
            icon={<Wallet size={16} />}
            defaultOpen={true}
          >
            <div className="space-y-4">
              <SliderGroup
                label={t('inputs.monthlyIncome')}
                value={params.monthlyIncome}
                min={3000}
                max={100000}
                step={500}
                onChange={setMonthlyIncome}
              />
              <SliderGroup
                label={t('inputs.monthlyExpenses')}
                value={params.monthlyExpenses}
                min={2000}
                max={50000}
                step={500}
                onChange={setMonthlyExpenses}
              />
              <SliderGroup
                label={t('inputs.currentAssets')}
                value={params.currentAssets}
                min={0}
                max={2000000}
                step={10000}
                onChange={setCurrentAssets}
              />
            </div>
          </Section>

          {/* Mortgage */}
          <Section
            title={t('mortgage.title')}
            icon={<Home size={16} />}
            defaultOpen={mortgageCount > 0}
            badge={mortgageCount > 0 ? String(mortgageCount) : undefined}
          >
            <MortgagePanel />
          </Section>

          {/* Car */}
          <Section
            title={t('car.title')}
            icon={<Car size={16} />}
            defaultOpen={params.carLoan !== null}
            badge={params.carLoan ? '1' : undefined}
          >
            <CarLoanSection />
          </Section>

          {/* Economic Variables */}
          <Section
            title={t('economy.title')}
            icon={<TrendingUp size={16} />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <SliderGroup
                label={t('economy.boiRate')}
                value={params.boiRate}
                min={0.1}
                max={10}
                step={0.1}
                formatter={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => updateEconomics({ boiRate: v })}
                tooltip={t('tooltips.boiRate')}
              />
              <SliderGroup
                label={t('economy.inflation')}
                value={params.inflation}
                min={0}
                max={10}
                step={0.1}
                formatter={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => updateEconomics({ inflation: v })}
              />
              <SliderGroup
                label={t('economy.investmentReturn')}
                value={params.investmentReturn}
                min={3}
                max={20}
                step={0.5}
                formatter={(v) => `${v.toFixed(1)}%`}
                onChange={(v) => updateEconomics({ investmentReturn: v })}
              />
            </div>
          </Section>

          {/* Life Events */}
          <Section
            title={t('events.title')}
            icon={<Calendar size={16} />}
            defaultOpen={eventCount > 0}
            badge={eventCount > 0 ? String(eventCount) : undefined}
          >
            <LifeEventsPanel />
          </Section>

          {/* Simulation Period */}
          <Section
            title={t('inputs.simulationYears')}
            icon={<Clock size={16} />}
            defaultOpen={true}
          >
            <SliderGroup
              label={t('inputs.simulationYears')}
              value={params.years}
              min={10}
              max={40}
              step={5}
              formatter={(v) => `${v} ${t('inputs.years')}`}
              onChange={setSimulationYears}
            />
          </Section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
