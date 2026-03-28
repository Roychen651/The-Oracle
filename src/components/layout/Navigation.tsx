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
      className="glass sticky top-0 z-50"
      style={{
        height: 'var(--nav-height)',
        borderBottom: '1px solid rgba(200,169,81,0.08)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left side: hamburger + logo */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger — always shown on mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center rounded-xl transition-colors"
            style={{
              minWidth: 44,
              minHeight: 44,
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="פתח תפריט"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative gold-glow-animate flex-shrink-0"
              style={{
                background: 'radial-gradient(circle at 40% 40%, var(--gold-glow-strong), var(--surface-elevated))',
                border: '1px solid var(--gold)',
                boxShadow: '0 0 16px var(--gold-glow)',
                filter: 'drop-shadow(0 0 8px rgba(200,169,81,0.6))',
              }}
            >
              <Eye size={22} style={{ color: 'var(--gold)' }} />
              <div
                className="absolute w-1.5 h-1.5 rounded-full top-1.5 right-1.5"
                style={{
                  background: 'var(--gold-light)',
                  boxShadow: '0 0 4px var(--gold-light)',
                }}
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="shimmer-text font-montserrat font-bold text-xl leading-none">
                {t('appName')}
              </h1>
              <p
                className="text-xs leading-none mt-0.5"
                style={{ color: 'var(--text-muted)', fontFamily: 'Assistant, sans-serif' }}
              >
                {t('subtitle')}
              </p>
            </div>

            {/* Short form on mobile */}
            <h1 className="sm:hidden shimmer-text font-montserrat font-bold text-lg leading-none">
              Oracle
            </h1>
          </div>
        </div>

        {/* Right side: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language toggle */}
          <button
            onClick={handleLanguageToggle}
            className="btn-ghost flex items-center"
            style={{ padding: '6px 10px', minHeight: 44, minWidth: 44 }}
            aria-label="שנה שפה"
          >
            <span
              className="text-xs font-bold font-montserrat"
              style={{
                color: language === 'he' ? 'var(--gold)' : 'var(--text-secondary)',
              }}
            >
              עב
            </span>
            <span
              className="mx-1 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              /
            </span>
            <span
              className="text-xs font-bold font-montserrat"
              style={{
                color: language === 'en' ? 'var(--gold)' : 'var(--text-secondary)',
              }}
            >
              EN
            </span>
          </button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.2 }}
            className="btn-ghost flex items-center justify-center"
            style={{ padding: 0, minWidth: 44, minHeight: 44 }}
            aria-label={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          >
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--text-secondary)' }} />
              : <Moon size={16} style={{ color: 'var(--text-secondary)' }} />
            }
          </motion.button>

          {/* Auth-dependent actions */}
          {user ? (
            <>
              {/* Save to cloud — desktop only */}
              <button
                onClick={handleSaveCloud}
                disabled={saving}
                className="btn-primary hidden sm:flex"
                style={{
                  background: savedFeedback ? 'var(--accent-green)' : 'var(--gold)',
                  color: 'var(--bg)',
                  padding: '8px 14px',
                  minHeight: 44,
                  fontSize: 13,
                  transition: 'background 0.3s ease',
                }}
                aria-label="שמור תרחיש"
              >
                {savedFeedback ? (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ display: 'inline-flex' }}
                    >
                      ✓
                    </motion.span>
                    נשמר!
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {saving ? 'שומר...' : t('nav.saveScenario')}
                  </>
                )}
              </button>

              {/* Avatar */}
              <div
                className="flex-shrink-0 flex items-center justify-center font-montserrat font-bold text-sm cursor-pointer transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--gold-glow-strong)',
                  color: 'var(--gold)',
                  border: '1.5px solid rgba(200,169,81,0.35)',
                  minWidth: 36,
                  minHeight: 36,
                }}
                title={user.email ?? ''}
              >
                {avatarLetter}
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut()}
                className="btn-ghost flex items-center justify-center"
                style={{ padding: 0, minWidth: 44, minHeight: 44 }}
                aria-label="התנתק"
              >
                <LogOut size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </>
          ) : (
            <button
              onClick={onShowAuth}
              className="btn-ghost"
              style={{
                color: 'var(--gold)',
                borderColor: 'rgba(200,169,81,0.3)',
                minHeight: 44,
                padding: '8px 14px',
                fontSize: 13,
              }}
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
