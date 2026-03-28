import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  Sun,
  PauseCircle,
  Type,
  RotateCcw,
  X,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useTranslation } from 'react-i18next';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const {
    fontSize,
    highContrast,
    reducedMotion,
    readableFont,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleReadableFont,
    resetAccessibility,
  } = useUIStore();

  return (
    <div className="fixed bottom-14 left-4 z-50" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-14 left-0 bg-surface-elevated border border-border-custom rounded-2xl shadow-2xl p-4 w-64"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-assistant font-bold text-sm">
                {t('accessibility.title')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="סגור תפריט נגישות"
              >
                <X size={14} />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-3">
              <p className="text-text-secondary text-xs mb-2 font-assistant">
                {t('accessibility.fontSize')}: {fontSize}px
              </p>
              <div className="flex gap-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 14}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-surface border border-border-custom text-text-secondary hover:text-gold hover:border-gold transition-colors text-xs font-assistant disabled:opacity-40"
                  aria-label={t('accessibility.decreaseFont')}
                >
                  <ZoomOut size={14} />
                  <span>{t('accessibility.decreaseFont')}</span>
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize >= 22}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-surface border border-border-custom text-text-secondary hover:text-gold hover:border-gold transition-colors text-xs font-assistant disabled:opacity-40"
                  aria-label={t('accessibility.increaseFont')}
                >
                  <ZoomIn size={14} />
                  <span>{t('accessibility.increaseFont')}</span>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <AccessibilityToggle
                icon={<Sun size={14} />}
                label={t('accessibility.highContrast')}
                active={highContrast}
                onToggle={toggleHighContrast}
              />
              <AccessibilityToggle
                icon={<PauseCircle size={14} />}
                label={t('accessibility.stopAnimations')}
                active={reducedMotion}
                onToggle={toggleReducedMotion}
              />
              <AccessibilityToggle
                icon={<Type size={14} />}
                label={t('accessibility.readableFont')}
                active={readableFont}
                onToggle={toggleReadableFont}
              />
            </div>

            {/* Reset */}
            <button
              onClick={resetAccessibility}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-text-muted hover:text-gold border border-border-custom hover:border-gold transition-colors text-xs font-assistant"
            >
              <RotateCcw size={12} />
              {t('accessibility.reset')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-border-custom transition-all duration-200"
        style={{
          background: 'var(--surface-elevated)',
          boxShadow: isOpen ? '0 0 16px var(--gold-glow-strong)' : undefined,
          borderColor: isOpen ? 'var(--gold)' : undefined,
        }}
        aria-label="תפריט נגישות"
        aria-expanded={isOpen}
      >
        <Accessibility
          size={20}
          style={{ color: isOpen ? 'var(--gold)' : 'var(--text-secondary)' }}
        />
      </motion.button>
    </div>
  );
}

interface AccessibilityToggleProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
}

function AccessibilityToggle({ icon, label, active, onToggle }: AccessibilityToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs font-assistant ${
        active
          ? 'bg-gold/10 border-gold text-gold'
          : 'bg-surface border-border-custom text-text-secondary hover:border-gold/50 hover:text-text-primary'
      }`}
      role="switch"
      aria-checked={active}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`w-8 h-4 rounded-full relative transition-colors ${
          active ? 'bg-gold' : 'bg-border-custom'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
            active ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}
