import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useUIStore } from '../../stores/useUIStore'

interface StepConfig {
  id: number
  title: string
  body: string
  type?: 'hero' | 'done' | 'spotlight'
  targetSelector?: string
  icon?: string
}

const STEPS: StepConfig[] = [
  {
    id: 0,
    title: 'ברוך הבא לאורקל',
    body: 'הסימולטור הפיננסי החכם ביותר לישראלים. נעשה סיור קצר.',
    type: 'hero',
  },
  {
    id: 1,
    targetSelector: '[data-tour="income"]',
    title: 'ההכנסות וההוצאות שלך',
    body: 'הגדר את ההכנסה החודשית וההוצאות שלך. הגרף מתעדכן בזמן אמת.',
    icon: '💰',
    type: 'spotlight',
  },
  {
    id: 2,
    targetSelector: '[data-tour="mortgage"]',
    title: 'המשכנתא שלך',
    body: 'הוסף את מסלולי המשכנתא שלך — פריים, קבועה, או צמוד מדד. כל מסלול מחושב בדיוק לפי שפיצר.',
    icon: '🏠',
    type: 'spotlight',
  },
  {
    id: 3,
    targetSelector: '[data-tour="events"]',
    title: 'אירועי חיים',
    body: 'הוסף אירועים כמו לידת ילד, קניית דירה, או פרישה — ראה איך הם משנים את העתיד שלך.',
    icon: '🎯',
    type: 'spotlight',
  },
  {
    id: 4,
    targetSelector: '[data-tour="chart"]',
    title: 'הגרף שלך',
    body: 'זהו עתידך הפיננסי. הקו הזהוב הוא שווי הנטו שלך, האדום הוא החוב. לחץ על כל נקודה לפרטים.',
    icon: '📈',
    type: 'spotlight',
  },
  {
    id: 5,
    title: 'הכל מוכן!',
    body: 'עכשיו אתה מוכן לתכנן את העתיד הפיננסי שלך. שמור את התרחיש שלך כדי שנזכור אותו.',
    type: 'done',
    icon: '✨',
  },
]

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

export default function OnboardingTour() {
  const { onboardingStep, onboardingComplete, nextOnboardingStep, skipOnboarding } = useUIStore()
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)

  const currentStep = STEPS[onboardingStep] ?? null
  const isVisible = onboardingStep >= 0 && !onboardingComplete

  const measureTarget = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(currentStep.targetSelector)
    if (!el) {
      // Element not found: skip to next
      nextOnboardingStep()
      return
    }
    const rect = el.getBoundingClientRect()
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
  }, [currentStep, nextOnboardingStep])

  useEffect(() => {
    if (!isVisible) return
    measureTarget()
    window.addEventListener('resize', measureTarget)
    return () => window.removeEventListener('resize', measureTarget)
  }, [isVisible, onboardingStep, measureTarget])

  if (!isVisible || !currentStep) return null

  const isHero = currentStep.type === 'hero'
  const isDone = currentStep.type === 'done'
  const isSpotlight = currentStep.type === 'spotlight'

  const PAD = 8
  const cardWidth = 320

  // Position the card below/above the highlight
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const viewportHeight = window.innerHeight
    const cardHeight = 180
    const spaceBelow = viewportHeight - targetRect.top - targetRect.height

    let top: number
    if (spaceBelow > cardHeight + 20) {
      top = targetRect.top + targetRect.height + 12
    } else {
      top = targetRect.top - cardHeight - 12
    }

    // Horizontal: center under target but keep in viewport
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2
    left = Math.max(12, Math.min(left, window.innerWidth - cardWidth - 12))

    return { top, left, width: cardWidth }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ pointerEvents: isSpotlight && targetRect ? 'none' : 'auto' }}
          >
            {isSpotlight && targetRect ? (
              // SVG overlay with cutout
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  // Only close if clicking outside the spotlight
                  const x = e.clientX
                  const y = e.clientY
                  const inSpot =
                    x >= targetRect.left - PAD &&
                    x <= targetRect.left + targetRect.width + PAD &&
                    y >= targetRect.top - PAD &&
                    y <= targetRect.top + targetRect.height + PAD
                  if (!inSpot) {
                    // Don't skip on overlay click — just ignore
                  }
                }}
              >
                <defs>
                  <mask id="spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={targetRect.left - PAD}
                      y={targetRect.top - PAD}
                      width={targetRect.width + PAD * 2}
                      height={targetRect.height + PAD * 2}
                      rx="8"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.8)"
                  mask="url(#spotlight-mask)"
                />
                {/* Gold ring around spotlight */}
                <rect
                  x={targetRect.left - PAD - 2}
                  y={targetRect.top - PAD - 2}
                  width={targetRect.width + PAD * 2 + 4}
                  height={targetRect.height + PAD * 2 + 4}
                  rx="10"
                  fill="none"
                  stroke="rgba(200,169,81,0.7)"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <div className="absolute inset-0 bg-black/80" />
            )}
          </motion.div>

          {/* Tour Card */}
          <motion.div
            key={`card-${onboardingStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="fixed z-[101] bg-surface-elevated border border-yellow-500/30 rounded-2xl p-6 shadow-2xl"
            style={
              isHero || isDone
                ? {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: Math.min(380, window.innerWidth - 32),
                  }
                : getCardStyle()
            }
            dir="rtl"
          >
            {/* Hero/Done: show logo */}
            {(isHero || isDone) && (
              <div className="flex flex-col items-center text-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(200,169,81,0.3), rgba(14,14,34,0.9))',
                    border: '1px solid rgba(200,169,81,0.5)',
                    boxShadow: '0 0 20px rgba(200,169,81,0.2)',
                  }}
                >
                  {isDone ? (
                    <span className="text-2xl">{currentStep.icon}</span>
                  ) : (
                    <Eye size={24} style={{ color: '#C8A951' }} />
                  )}
                </div>
                {isHero && (
                  <p className="text-yellow-400/60 text-xs font-assistant mb-1">
                    הכלי הפיננסי החכם ביותר לישראלים
                  </p>
                )}
              </div>
            )}

            {/* Spotlight step icon */}
            {isSpotlight && currentStep.icon && (
              <span className="text-2xl mb-2 block">{currentStep.icon}</span>
            )}

            <h3 className="text-white font-assistant font-bold text-lg mb-2">
              {currentStep.title}
            </h3>
            <p className="text-white/60 font-assistant text-sm leading-relaxed mb-5">
              {currentStep.body}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {/* Back / Skip */}
              <div className="flex items-center gap-2">
                {!isHero && onboardingStep > 0 && (
                  <button
                    onClick={() =>
                      useUIStore.setState((s) => ({ onboardingStep: s.onboardingStep - 1 }))
                    }
                    className="text-white/40 hover:text-white/70 text-xs font-assistant transition-colors px-2 py-1"
                  >
                    ← הקודם
                  </button>
                )}
                <button
                  onClick={skipOnboarding}
                  className="text-white/30 hover:text-white/50 text-xs font-assistant transition-colors px-2 py-1"
                >
                  דלג
                </button>
              </div>

              {/* Step counter + Next */}
              <div className="flex items-center gap-3">
                {!isHero && !isDone && (
                  <span className="text-white/30 text-xs font-assistant">
                    {onboardingStep} / {STEPS.length - 1}
                  </span>
                )}
                {isDone ? (
                  <button
                    onClick={skipOnboarding}
                    className="px-4 py-2 rounded-xl font-assistant font-semibold text-sm transition-all"
                    style={{ background: '#C8A951', color: '#060612' }}
                  >
                    סיום
                  </button>
                ) : isHero ? (
                  <div className="flex gap-2">
                    <button
                      onClick={skipOnboarding}
                      className="px-3 py-2 rounded-xl font-assistant text-sm text-white/40 hover:text-white/60 border border-white/10 transition-colors"
                    >
                      דלג
                    </button>
                    <button
                      onClick={nextOnboardingStep}
                      className="px-4 py-2 rounded-xl font-assistant font-semibold text-sm transition-all"
                      style={{ background: '#C8A951', color: '#060612' }}
                    >
                      בוא נתחיל! 👋
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={nextOnboardingStep}
                    className="px-4 py-2 rounded-xl font-assistant font-semibold text-sm transition-all"
                    style={{ background: '#C8A951', color: '#060612' }}
                  >
                    הבא →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
