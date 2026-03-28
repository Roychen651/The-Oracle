import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Sun, Moon, Menu, Save, LogIn, LogOut, BookOpen, Check, Loader2, User, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18n from '../../lib/i18n'
import { useUIStore } from '../../stores/useUIStore'
import { useSimulationStore } from '../../stores/useSimulationStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { saveScenario } from '../../lib/supabase'

interface NavigationProps {
  onShowAuth?: () => void
}

// ─── Save Scenario Dialog ─────────────────────────────────────────────────────

interface SaveDialogProps {
  onClose: () => void
  onSave: (name: string, description: string) => Promise<void>
}

function SaveDialog({ onClose, onSave }: SaveDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('נא להזין שם לתרחיש')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(name.trim(), description.trim())
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch {
      setError('שמירה נכשלה — נסה שוב')
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(200,169,81,0.15)', border: '1px solid rgba(200,169,81,0.3)' }}
            >
              <Save size={15} style={{ color: 'var(--gold)' }} />
            </div>
            <h3 className="font-assistant font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              שמור תרחיש
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(52,212,168,0.15)', border: '2px solid var(--accent-green)' }}
            >
              <Check size={26} style={{ color: 'var(--accent-green)' }} />
            </div>
            <p className="font-assistant font-semibold text-sm" style={{ color: 'var(--accent-green)' }}>
              התרחיש נשמר בהצלחה!
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div>
              <label className="block text-xs font-assistant font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                שם התרחיש <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null) }}
                placeholder="למשל: תכנון דירה ראשונה 2025"
                maxLength={60}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-assistant outline-none transition-colors"
                style={{
                  background: 'var(--surface-elevated)',
                  border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(200,169,81,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = error ? 'var(--accent-red)' : 'var(--border)')}
              />
              {error && (
                <p className="text-xs font-assistant mt-1" style={{ color: 'var(--accent-red)' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Description field */}
            <div>
              <label className="block text-xs font-assistant font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                תיאור (אופציונלי)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="הערות על התרחיש..."
                rows={2}
                maxLength={160}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-assistant outline-none transition-colors resize-none"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(200,169,81,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-assistant font-semibold text-sm transition-all disabled:opacity-60"
                style={{ background: 'var(--gold)', color: 'var(--bg)' }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-assistant font-semibold text-sm transition-all"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                ביטול
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Main Navigation ──────────────────────────────────────────────────────────

export default function Navigation({ onShowAuth }: NavigationProps) {
  const { t } = useTranslation()
  const { theme, language, toggleTheme, setLanguage, toggleSidebar, currentPage, navigateTo } = useUIStore()
  const { params } = useSimulationStore()
  const { user, signOut, getAvatarUrl, getDisplayName } = useAuthStore()
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleLanguageToggle = () => {
    const newLang = language === 'he' ? 'en' : 'he'
    setLanguage(newLang)
    i18n.changeLanguage(newLang)
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  const handleSave = async (name: string, description: string) => {
    if (!user) return
    const result = await saveScenario(user.id, name, description, params)
    if (!result) throw new Error('Save failed')
  }

  const handleSignOut = () => {
    signOut()
    navigateTo('dashboard')
  }

  const avatarUrl = getAvatarUrl()
  const displayName = getDisplayName()
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  return (
    <>
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
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2">
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

            {/* Logo — clicking navigates to dashboard */}
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-80"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
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
                  style={{ background: 'var(--gold-light)', boxShadow: '0 0 4px var(--gold-light)' }}
                />
              </div>

              <div className="hidden sm:block text-right">
                <h1 className="shimmer-text font-montserrat font-bold text-xl leading-none">
                  {t('appName')}
                </h1>
                <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Assistant, sans-serif' }}>
                  {t('subtitle')}
                </p>
              </div>

              <h1 className="sm:hidden shimmer-text font-montserrat font-bold text-lg leading-none">
                Oracle
              </h1>
            </button>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Knowledge Library toggle */}
            <motion.button
              onClick={() => navigateTo(currentPage === 'knowledge' ? 'dashboard' : 'knowledge')}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              className="btn-ghost flex items-center justify-center"
              style={{
                padding: 0,
                minWidth: 44,
                minHeight: 44,
                color: currentPage === 'knowledge' ? 'var(--gold)' : 'var(--text-secondary)',
              }}
              aria-label="ספריית ידע"
              title="ספריית ידע"
            >
              <BookOpen size={17} />
            </motion.button>

            {/* Language toggle */}
            <button
              onClick={handleLanguageToggle}
              className="btn-ghost flex items-center"
              style={{ padding: '6px 10px', minHeight: 44, minWidth: 44 }}
              aria-label="שנה שפה"
            >
              <span className="text-xs font-bold font-montserrat" style={{ color: language === 'he' ? 'var(--gold)' : 'var(--text-secondary)' }}>
                עב
              </span>
              <span className="mx-1 text-xs" style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="text-xs font-bold font-montserrat" style={{ color: language === 'en' ? 'var(--gold)' : 'var(--text-secondary)' }}>
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
                {/* Save scenario — opens name dialog */}
                <motion.button
                  onClick={() => setShowSaveDialog(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-1.5"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--bg)',
                    padding: '8px 14px',
                    minHeight: 44,
                    minWidth: 44,
                    fontSize: 13,
                  }}
                  aria-label="שמור תרחיש"
                >
                  <Save size={14} />
                  <span className="hidden sm:inline font-assistant font-semibold">
                    {t('nav.saveScenario')}
                  </span>
                </motion.button>

                {/* Avatar — navigates to profile */}
                <motion.button
                  onClick={() => navigateTo('profile')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={displayName}
                  aria-label="פרופיל"
                  className="flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: avatarUrl ? 'transparent' : 'var(--gold-glow-strong)',
                    border: `1.5px solid ${currentPage === 'profile' ? 'var(--gold)' : 'rgba(200,169,81,0.35)'}`,
                    minWidth: 36,
                    minHeight: 36,
                    boxShadow: currentPage === 'profile' ? '0 0 10px var(--gold-glow)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-montserrat font-bold text-sm" style={{ color: 'var(--gold)' }}>
                      {avatarLetter}
                    </span>
                  )}
                </motion.button>

                {/* Sign out */}
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-ghost flex items-center justify-center"
                  style={{ padding: 0, minWidth: 44, minHeight: 44 }}
                  aria-label="התנתק"
                  title="התנתק"
                >
                  <LogOut size={16} style={{ color: 'var(--text-muted)' }} />
                </motion.button>
              </>
            ) : (
              <>
                {/* Profile page even when not logged in — shows sign-in prompt */}
                <motion.button
                  onClick={() => navigateTo('profile')}
                  whileHover={{ scale: 1.05 }}
                  className="btn-ghost flex items-center justify-center"
                  style={{ padding: 0, minWidth: 44, minHeight: 44, color: currentPage === 'profile' ? 'var(--gold)' : 'var(--text-secondary)' }}
                  aria-label="פרופיל"
                >
                  <User size={17} />
                </motion.button>

                <motion.button
                  onClick={onShowAuth}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
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
                  <span className="font-assistant">התחבר</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Save dialog — portal-like, rendered at root level */}
      <AnimatePresence>
        {showSaveDialog && (
          <SaveDialog
            onClose={() => setShowSaveDialog(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  )
}
