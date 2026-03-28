import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Trash2, Play, Clock, ChevronLeft, User, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useSimulationStore } from '../stores/useSimulationStore'
import { useUIStore } from '../stores/useUIStore'
import {
  fetchScenarios,
  deleteScenario,
  setActiveScenario,
  type SavedScenario,
} from '../lib/supabase'

interface ProfileProps {
  onShowAuth?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(n: number) {
  if (Math.abs(n) >= 1_000_000) return `₪${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `₪${(n / 1_000).toFixed(0)}K`
  return `₪${Math.round(n).toLocaleString('he-IL')}`
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario,
  onLoad,
  onDelete,
  loading,
}: {
  scenario: SavedScenario
  onLoad: () => void
  onDelete: () => void
  loading: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const income = scenario.params?.monthlyIncome ?? 0
  const mortgageCount = scenario.params?.mortgageTracks?.length ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="rounded-2xl p-4"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${scenario.is_active ? 'rgba(200,169,81,0.4)' : 'var(--border)'}`,
        boxShadow: scenario.is_active ? '0 0 16px rgba(200,169,81,0.1)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Active badge */}
          {scenario.is_active && (
            <span
              className="inline-block text-xs font-assistant font-semibold px-2 py-0.5 rounded-full mb-1.5"
              style={{ background: 'rgba(200,169,81,0.15)', color: 'var(--gold)', border: '1px solid rgba(200,169,81,0.3)' }}
            >
              פעיל
            </span>
          )}

          <h3
            className="font-assistant font-bold text-sm leading-snug truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {scenario.name}
          </h3>

          {scenario.description && (
            <p className="text-xs font-assistant mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
              {scenario.description}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-montserrat" style={{ color: 'var(--text-muted)' }}>
              הכנסה: {formatCurrency(income)}/חודש
            </span>
            {mortgageCount > 0 && (
              <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                · {mortgageCount} מסלול{mortgageCount !== 1 ? 'ות' : ''} משכנתא
              </span>
            )}
            <span
              className="flex items-center gap-1 text-xs font-assistant"
              style={{ color: 'var(--text-muted)' }}
            >
              <Clock size={10} />
              {formatDate(scenario.updated_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            onClick={onLoad}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-assistant font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(200,169,81,0.12)',
              color: 'var(--gold)',
              border: '1px solid rgba(200,169,81,0.25)',
            }}
            title="טען תרחיש"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            <span className="hidden sm:inline">טען</span>
          </motion.button>

          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={onDelete}
                  className="px-2 py-2 rounded-xl text-xs font-assistant font-semibold"
                  style={{ background: 'rgba(255,75,92,0.15)', color: 'var(--accent-red)', border: '1px solid rgba(255,75,92,0.3)' }}
                >
                  מחק
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-2 rounded-xl text-xs font-assistant"
                  style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  ביטול
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                title="מחק תרחיש"
              >
                <Trash2 size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function Profile({ onShowAuth }: ProfileProps) {
  const { user, profile, signOut, getAvatarUrl, getDisplayName } = useAuthStore()
  const { loadParams } = useSimulationStore()
  const { navigateTo } = useUIStore()

  const [scenarios, setScenarios] = useState<SavedScenario[]>([])
  const [loadingScenarios, setLoadingScenarios] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const avatarUrl = getAvatarUrl()
  const displayName = getDisplayName()
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  // Load scenarios on mount
  useEffect(() => {
    if (!user) return
    setLoadingScenarios(true)
    fetchScenarios(user.id)
      .then(setScenarios)
      .finally(() => setLoadingScenarios(false))
  }, [user])

  const handleLoadScenario = async (scenario: SavedScenario) => {
    if (!user) return
    setLoadingId(scenario.id)
    loadParams(scenario.params)
    await setActiveScenario(user.id, scenario.id)
    // Mark active locally
    setScenarios((prev) =>
      prev.map((s) => ({ ...s, is_active: s.id === scenario.id }))
    )
    setLoadingId(null)
    navigateTo('dashboard')
  }

  const handleDeleteScenario = async (id: string) => {
    await deleteScenario(id)
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSignOut = async () => {
    await signOut()
    onShowAuth?.()
  }

  // Not logged in state
  if (!user) {
    return (
      <div
        className="min-h-full flex flex-col items-center justify-center p-8 text-center"
        style={{ background: 'var(--bg)' }}
        dir="rtl"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
        >
          <User size={36} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 className="text-2xl font-bold font-assistant mb-2" style={{ color: 'var(--text-primary)' }}>
          כניסה לחשבון
        </h2>
        <p className="text-sm font-assistant mb-8 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          התחבר כדי לשמור ולנהל את התרחישים הפיננסיים שלך בענן
        </p>
        <motion.button
          onClick={onShowAuth}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-assistant font-bold text-sm"
          style={{ background: 'var(--gold)', color: 'var(--bg)' }}
        >
          התחבר / הירשם
        </motion.button>
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      dir="rtl"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Back button */}
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-1.5 text-sm font-assistant transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeft size={16} />
          חזרה לסימולטור
        </button>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 flex items-center gap-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(200,169,81,0.06) 0%, transparent 60%)',
          }}
        >
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, rgba(200,169,81,0.3), rgba(200,169,81,0.08))',
              border: '2px solid rgba(200,169,81,0.4)',
              boxShadow: '0 0 20px rgba(200,169,81,0.15)',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-montserrat font-bold text-3xl" style={{ color: 'var(--gold)' }}>
                {avatarLetter}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-assistant font-extrabold text-xl leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {displayName}
            </h2>
            <p className="text-sm font-assistant mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {user.email}
            </p>
            {profile?.created_at && (
              <p className="text-xs font-assistant mt-1" style={{ color: 'var(--text-muted)' }}>
                משתמש מאז {formatDate(profile.created_at)}
              </p>
            )}
          </div>

          {/* Sign out button */}
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-assistant font-semibold text-sm transition-all"
            style={{
              background: 'rgba(255,75,92,0.08)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(255,75,92,0.2)',
            }}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">התנתק</span>
          </motion.button>
        </motion.div>

        {/* Saved Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-assistant font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              התרחישים שלי
            </h3>
            <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
              {scenarios.length} תרחישים
            </span>
          </div>

          {loadingScenarios ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--gold)' }} />
              <p className="text-sm font-assistant" style={{ color: 'var(--text-secondary)' }}>
                טוען תרחישים...
              </p>
            </div>
          ) : scenarios.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
            >
              <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-assistant" style={{ color: 'var(--text-secondary)' }}>
                אין תרחישים שמורים עדיין
              </p>
              <p className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
                לחץ על "שמור תרחיש" בסרגל הניווט כדי לשמור
              </p>
              <motion.button
                onClick={() => navigateTo('dashboard')}
                whileHover={{ scale: 1.03 }}
                className="mt-2 px-4 py-2 rounded-xl font-assistant font-semibold text-sm"
                style={{ background: 'rgba(200,169,81,0.12)', color: 'var(--gold)', border: '1px solid rgba(200,169,81,0.25)' }}
              >
                חזרה לסימולטור
              </motion.button>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {scenarios.map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onLoad={() => handleLoadScenario(scenario)}
                    onDelete={() => handleDeleteScenario(scenario.id)}
                    loading={loadingId === scenario.id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Danger zone */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid rgba(255,75,92,0.15)' }}
        >
          <h4 className="font-assistant font-bold text-sm mb-3" style={{ color: 'var(--accent-red)' }}>
            אזור מסוכן
          </h4>
          <p className="text-xs font-assistant mb-4" style={{ color: 'var(--text-secondary)' }}>
            התנתקות תסיר את הגישה לתרחישים השמורים בענן. הנתונים המקומיים יישמרו.
          </p>
          <motion.button
            onClick={handleSignOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-assistant font-semibold text-sm"
            style={{
              background: 'rgba(255,75,92,0.1)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(255,75,92,0.25)',
            }}
          >
            <LogOut size={15} />
            התנתק מהחשבון
          </motion.button>
        </div>
      </div>
    </div>
  )
}
