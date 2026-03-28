import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Sun, Moon, Menu, Save, LogIn, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { useUIStore } from '../../stores/useUIStore'
import { useSimulationStore } from '../../stores/useSimulationStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { saveSimulationState } from '../../lib/supabase'

interface NavigationProps {
  onShowAuth?: () => void
}

export default function Navigation({ onShowAuth }: NavigationProps) {
  const { t } = useTranslation()
  const { theme, language, toggleTheme, setLanguage, toggleSidebar } = useUIStore()
  const { params } = useSimulationStore()
  const { user, signOut } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)

  const handleLanguageToggle = () => {
    const newLang = language === 'he' ? 'en' : 'he'
    setLanguage(newLang)
    i18n.changeLanguage(newLang)
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  const handleSaveCloud = async () => {
    if (!user) return
    setSaving(true)
    await saveSimulationState(user.id, params)
    setSaving(false)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card sticky top-0 z-40 h-16 flex items-center px-4 sm:px-6 border-b border-yellow-500/10"
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors md:hidden"
            aria-label="תפריט"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative gold-glow-animate"
              style={{
                background:
                  'radial-gradient(circle at 40% 40%, var(--gold-glow-strong), var(--surface-elevated))',
                border: '1px solid var(--gold)',
                boxShadow: '0 0 16px var(--gold-glow)',
                filter: 'drop-shadow(0 0 8px rgba(200,169,81,0.6))',
              }}
            >
              <Eye size={24} style={{ color: 'var(--gold)' }} />
              <div
                className="absolute w-1.5 h-1.5 rounded-full top-1.5 right-1.5"
                style={{
                  background: 'var(--gold-light)',
                  boxShadow: '0 0 4px var(--gold-light)',
                }}
              />
            </div>

            <div>
              <h1 className="shimmer-text font-montserrat font-bold text-xl leading-none">
                {t('appName')}
              </h1>
              <p className="text-text-muted font-assistant text-xs leading-none mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle pill */}
          <button
            onClick={handleLanguageToggle}
            className="relative flex items-center px-1 py-1 rounded-lg bg-surface-elevated border border-border-custom overflow-hidden text-xs font-montserrat font-medium"
            aria-label="שנה שפה"
          >
            <span
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'he'
                  ? 'text-gold bg-gold/10'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              עב
            </span>
            <span
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'en'
                  ? 'text-gold bg-gold/10'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              EN
            </span>
          </button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
            className="p-2 rounded-lg bg-surface-elevated border border-border-custom text-text-secondary hover:text-gold hover:border-gold transition-colors"
            aria-label={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          {/* Auth state */}
          {user ? (
            <>
              {/* Save to cloud */}
              <button
                onClick={handleSaveCloud}
                disabled={saving}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-assistant font-semibold transition-all btn-magnetic shadow-gold"
                style={{
                  background: savedFeedback ? 'var(--accent-green)' : 'var(--gold)',
                  color: 'var(--bg)',
                }}
                aria-label="שמור תרחיש"
              >
                <Save size={14} />
                {saving ? 'שומר...' : savedFeedback ? 'נשמר!' : t('nav.saveScenario')}
              </button>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-sm cursor-pointer border border-gold/30 hover:border-gold/60 transition-colors"
                style={{ background: 'var(--gold-glow-strong)', color: 'var(--gold)' }}
                title={user.email ?? ''}
              >
                {avatarLetter}
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg bg-surface-elevated border border-border-custom text-text-muted hover:text-accent-red hover:border-accent-red/40 transition-colors"
                aria-label="התנתק"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={onShowAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-assistant font-semibold border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/60 transition-all"
            >
              <LogIn size={14} />
              התחבר
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
