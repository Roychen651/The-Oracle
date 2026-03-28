import { useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const controls = useAnimation()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      controls.start({ y: 0 })
    }
  }, [isOpen, controls])

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.offset.y > 80 || info.velocity.y > 400
    if (shouldClose) {
      await controls.start({ y: '100%', transition: { duration: 0.25, ease: 'easeIn' } })
      onClose()
    } else {
      controls.start({ y: 0, transition: { type: 'spring', damping: 30, stiffness: 400 } })
    }
  }

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.3 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ y: '100%' }}
            exit={{ y: '100%', transition: { duration: 0.25, ease: 'easeIn' } }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-[70] overflow-hidden"
            style={{
              borderRadius: '24px 24px 0 0',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderBottom: 'none',
              maxHeight: '88dvh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag handle */}
            <div
              className="flex-shrink-0 flex flex-col items-center pt-3 pb-1 select-none"
              style={{ cursor: 'grab' }}
            >
              <div className="sheet-handle" />
              {title && (
                <p
                  className="text-sm font-semibold pb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Assistant, sans-serif' }}
                >
                  {title}
                </p>
              )}
            </div>

            {/* Gold divider */}
            <div className="divider-gold flex-shrink-0" />

            {/* Scrollable content */}
            <div
              className="overflow-y-auto flex-1"
              style={{ overscrollBehavior: 'contain' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : null
}
