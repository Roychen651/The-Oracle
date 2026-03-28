import { motion, AnimatePresence } from 'framer-motion'

interface ActionPreviewProps {
  deltaMonthly: number
  currentNetWorth: number
  simulationYears: number
  visible: boolean
}

export default function ActionPreview({
  deltaMonthly,
  currentNetWorth: _currentNetWorth,
  simulationYears,
  visible,
}: ActionPreviewProps) {
  const impact = Math.round(Math.abs(deltaMonthly) * 12 * simulationYears * 1.4)
  const isPositive = deltaMonthly > 0
  const isNegative = deltaMonthly < 0

  if (Math.abs(deltaMonthly) < 1) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className={`text-xs italic font-assistant mt-1 ${
            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-text-muted'
          }`}
        >
          {isPositive
            ? `הוספת ₪${Math.abs(deltaMonthly).toLocaleString('he-IL')} לחודש תוסיף ~₪${impact.toLocaleString('he-IL')} לשווי הנטו שלך`
            : `הפחתת ₪${Math.abs(deltaMonthly).toLocaleString('he-IL')} לחודש תפחית ~₪${impact.toLocaleString('he-IL')} מהשווי הנטו שלך`}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
