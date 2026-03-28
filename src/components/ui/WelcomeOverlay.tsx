import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Home, Flame } from 'lucide-react'
import { useUIStore } from '../../stores/useUIStore'

const STEPS = [
  {
    icon: TrendingUp,
    title: 'הגדר את המצב הפיננסי שלך',
    desc: 'הכנסה, חסכונות, והוצאות חודשיות — הכל בסליידר אחד.',
    color: '#5B78FF',
    glow: 'rgba(91,120,255,0.2)',
  },
  {
    icon: Home,
    title: 'הוסף את המשכנתא שלך',
    desc: 'פריים, קבועה, צמוד מדד — המנוע מחשב בדיוק כמו הבנק.',
    color: '#C8A951',
    glow: 'rgba(200,169,81,0.2)',
  },
  {
    icon: Flame,
    title: 'גלה את נקודת החירות הפיננסית',
    desc: 'ראה בדיוק מתי ההכנסה הפסיבית שלך תעלה על ההוצאות.',
    color: '#34D4A8',
    glow: 'rgba(52,212,168,0.2)',
  },
]

export default function WelcomeOverlay() {
  const { onboardingStep, onboardingComplete, nextOnboardingStep, skipOnboarding } = useUIStore()

  const isVisible = onboardingStep === 0 && !onboardingComplete

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(20px)', background: 'rgba(6,6,18,0.85)' }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,169,81,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background:
                'linear-gradient(145deg, rgba(20,20,46,0.95) 0%, rgba(14,14,34,0.98) 100%)',
              border: '1px solid rgba(200,169,81,0.25)',
              boxShadow:
                '0 0 0 1px rgba(200,169,81,0.08), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(200,169,81,0.06)',
            }}
            dir="rtl"
          >
            {/* Top accent line */}
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(200,169,81,0.6) 50%, transparent)',
              }}
            />

            <div className="px-8 pt-8 pb-6">
              {/* Logo area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center text-center mb-8"
              >
                {/* Eye icon orb */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: 'radial-gradient(circle, rgba(200,169,81,0.25), rgba(14,14,34,0.9))',
                    border: '1px solid rgba(200,169,81,0.4)',
                    boxShadow: '0 0 30px rgba(200,169,81,0.2), inset 0 1px 0 rgba(200,169,81,0.15)',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8A951"
                    strokeWidth="1.5"
                    className="w-7 h-7"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>

                <h1
                  className="font-montserrat font-bold text-2xl mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #E8D48A 0%, #C8A951 50%, #A07830 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  האורקל
                </h1>
                <p className="font-assistant text-sm" style={{ color: 'var(--text-secondary)' }}>
                  ברוך הבא לסימולטור הפיננסי החכם לישראלים
                </p>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center mb-8"
              >
                <h2
                  className="font-assistant font-bold text-xl mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  בוא נמפה את העתיד הפיננסי שלך
                </h2>
                <p className="font-assistant text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  3 צעדים פשוטים — ואתה רואה את כל ה-30 שנה הבאות בזמן אמת
                </p>
              </motion.div>

              {/* 3 Steps */}
              <div className="flex flex-col gap-3 mb-8">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-4 rounded-2xl px-4 py-3"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Step number */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-montserrat font-bold text-xs"
                        style={{
                          background: step.glow,
                          border: `1px solid ${step.color}40`,
                          color: step.color,
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: step.glow,
                          border: `1px solid ${step.color}30`,
                        }}
                      >
                        <Icon size={16} style={{ color: step.color }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-assistant font-semibold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {step.title}
                        </p>
                        <p
                          className="font-assistant text-xs leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  onClick={nextOnboardingStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-2xl font-assistant font-bold text-base transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #C8A951 0%, #A07830 100%)',
                    color: '#060612',
                    boxShadow: '0 4px 20px rgba(200,169,81,0.35)',
                  }}
                >
                  בואו נתחיל! 👋
                </motion.button>

                <button
                  onClick={skipOnboarding}
                  className="w-full py-2.5 font-assistant text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.color = 'var(--text-secondary)')
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.color = 'var(--text-muted)')
                  }
                >
                  דלג על הסיור
                </button>
              </motion.div>
            </div>

            {/* Bottom accent line */}
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(200,169,81,0.2) 50%, transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
