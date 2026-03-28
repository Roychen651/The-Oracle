import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Shield, BarChart3, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSimulationStore } from '../stores/useSimulationStore';
import { useAuthStore } from '../stores/useAuthStore';
import { saveSimulationState } from '../lib/supabase';
import StatsCard from '../components/ui/StatsCard';
import MainGraph from '../components/charts/MainGraph';
import BreakdownPie from '../components/charts/BreakdownPie';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

interface DashboardProps {
  onShowAuth?: () => void;
}

export default function Dashboard({ onShowAuth: _onShowAuth }: DashboardProps) {
  const { t } = useTranslation();
  const { params, results, recalculate, selectedYear, setSelectedYear } = useSimulationStore();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Run initial calculation on mount
  useEffect(() => {
    if (!results) {
      recalculate();
    }
  }, [results, recalculate]);

  const hasConfig = params.mortgageTracks.length > 0 || params.carLoan !== null;
  const yearlyData = results?.yearlyData ?? [];

  // Compute final stats
  const finalData = yearlyData[yearlyData.length - 1];
  const firstYearData = yearlyData[0];

  const handleSaveCloud = async () => {
    if (!user) return;
    setSaving(true);
    await saveSimulationState(user.id, params);
    setSaving(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="relative">
      {/* Decorative orbs - purely visual, pointer-events none */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: '-200px',
            right: '-150px',
            background: 'radial-gradient(circle, rgba(200,169,81,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            bottom: '10%',
            left: '-100px',
            background: 'radial-gradient(circle, rgba(91,120,255,0.04) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Main content sits above orbs */}
      <div className="relative z-10 p-4 sm:p-6 space-y-6">
        {/* Hero / Empty state */}
        {!hasConfig && <HeroSection />}

        {/* Stats Row */}
        {results && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <StatsCard
              label={t('stats.netWorth')}
              value={finalData?.netWorth ?? 0}
              trend={finalData?.netWorth > 0 ? 'up' : 'down'}
              color="gold"
              delay={0}
              subtitle={`בשנת ${params.years}`}
            />
            <StatsCard
              label={t('stats.totalDebt')}
              value={finalData?.totalDebt ?? 0}
              trend={finalData?.totalDebt < (firstYearData?.totalDebt ?? 0) ? 'down' : 'neutral'}
              color="red"
              delay={0.08}
              subtitle="חוב נוכחי"
            />
            <StatsCard
              label={t('stats.cashFlow')}
              value={firstYearData?.cashFlow ?? 0}
              trend={
                (firstYearData?.cashFlow ?? 0) > 0
                  ? 'up'
                  : (firstYearData?.cashFlow ?? 0) < 0
                    ? 'down'
                    : 'neutral'
              }
              color={(firstYearData?.cashFlow ?? 0) >= 0 ? 'green' : 'red'}
              delay={0.16}
              suffix="/ חודש"
            />
            <StatsCard
              label={t('stats.debtFreeIn')}
              value={results.debtFreeYear ?? params.years + 1}
              prefix=""
              suffix="שנה"
              trend="neutral"
              color="blue"
              delay={0.24}
              subtitle={
                results.debtFreeYear
                  ? `עוד ${results.debtFreeYear - 1} שנים`
                  : 'לא במסגרת הסימולציה'
              }
            />
          </motion.div>
        )}

        {/* Main Chart */}
        {yearlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-border-custom rounded-2xl p-5"
            data-tour="chart"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-text-primary font-assistant font-bold text-base">
                {t('chart.title')}
              </h2>
              <div className="flex items-center gap-3 text-xs font-assistant">
                <LegendDot color="#C8A951" label={t('chart.netWorth')} />
                <LegendDot color="#FF4B5C" label={t('chart.totalDebt')} />
                <LegendDot color="#34D4A8" label={t('chart.assets')} />
              </div>
            </div>

            <MainGraph
              data={yearlyData}
              selectedYear={selectedYear}
              onYearSelect={setSelectedYear}
            />
          </motion.div>
        )}

        {/* Bottom row: Pie + Summary */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Pie breakdown */}
            <div className="bg-surface border border-border-custom rounded-2xl p-5">
              <h2 className="text-text-primary font-assistant font-bold text-base mb-4">
                {t('breakdown.title')}
              </h2>
              <BreakdownPie
                breakdown={results.monthlyBreakdown}
                monthlyIncome={params.monthlyIncome}
              />
            </div>

            {/* Summary stats */}
            <div className="bg-surface border border-border-custom rounded-2xl p-5">
              <h2 className="text-text-primary font-assistant font-bold text-base mb-4">
                סיכום פיננסי
              </h2>
              <div className="space-y-3">
                <SummaryRow
                  label="שווי נטו סופי"
                  value={`₪${formatNumber(results.finalNetWorth)}`}
                  valueColor={results.finalNetWorth > 0 ? 'text-accent-green' : 'text-accent-red'}
                />
                <SummaryRow
                  label="סך ריבית ששולמה"
                  value={`₪${formatNumber(results.totalInterestPaid)}`}
                  valueColor="text-accent-red"
                />
                <SummaryRow
                  label="סך מס רווחי הון"
                  value={`₪${formatNumber(results.totalCapitalGainsTaxPaid)}`}
                  valueColor="text-accent-red"
                />
                {results.debtFreeYear && (
                  <SummaryRow
                    label="חופשי מחוב בשנת"
                    value={`שנה ${results.debtFreeYear}`}
                    valueColor="text-accent-green"
                  />
                )}
                {results.breakEvenYear && (
                  <SummaryRow
                    label="שווי נטו חיובי מאז"
                    value={`שנה ${results.breakEvenYear}`}
                    valueColor="text-gold"
                  />
                )}
                <div className="pt-2 border-t border-border-custom">
                  <SummaryRow
                    label="תשלום משכנתא חודשי"
                    value={`₪${formatNumber(results.monthlyBreakdown.mortgage)}`}
                    valueColor="text-gold"
                  />
                  <div className="mt-2">
                    <SummaryRow
                      label="עומס על ההכנסה"
                      value={`${
                        params.monthlyIncome > 0
                          ? (
                              ((results.monthlyBreakdown.mortgage +
                                results.monthlyBreakdown.car +
                                results.monthlyBreakdown.expenses) /
                                params.monthlyIncome) *
                              100
                            ).toFixed(0)
                          : 0
                      }%`}
                      valueColor="text-text-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Save button for authenticated users */}
        {user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSaveCloud}
            disabled={saving}
            className="fixed bottom-24 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl font-assistant font-semibold text-sm shadow-gold transition-all disabled:opacity-60 z-30"
            style={{ background: savedFeedback ? 'var(--accent-green)' : 'var(--gold)', color: 'var(--bg)' }}
            aria-label="שמור תרחיש"
          >
            <Save size={16} />
            {saving ? 'שומר...' : savedFeedback ? 'נשמר!' : 'שמור תרחיש'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-text-muted">{label}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = 'text-text-primary',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-text-secondary text-sm font-assistant">{label}</span>
      <span className={`font-numbers font-bold text-sm ${valueColor}`}>{value}</span>
    </div>
  );
}

function formatNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return Math.round(n).toString();
}

function HeroSection() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-surface border border-border-custom rounded-2xl p-8 text-center"
    >
      {/* Background orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, var(--gold-glow) 0%, transparent 60%)',
        }}
      />

      {/* Oracle eye */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto relative"
        style={{
          background: 'radial-gradient(circle, var(--gold-glow-strong), var(--surface-elevated))',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 30px var(--gold-glow)',
        }}
      >
        <Eye size={36} style={{ color: 'var(--gold)' }} />
      </motion.div>

      <h2
        className="font-assistant font-extrabold text-3xl mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {t('hero.title')}
      </h2>
      <p className="font-assistant text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
        {t('hero.subtitle')}
      </p>

      <p className="font-assistant text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        {t('hero.cta')}
      </p>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <FeatureCard icon={<Shield size={20} />} text={t('hero.feature1')} />
        <FeatureCard icon={<BarChart3 size={20} />} text={t('hero.feature2')} />
        <FeatureCard icon={<Sparkles size={20} />} text={t('hero.feature3')} />
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 p-4 rounded-xl"
      style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--gold)' }}>{icon}</span>
      <span className="text-text-secondary text-sm font-assistant text-center">{text}</span>
    </div>
  );
}
