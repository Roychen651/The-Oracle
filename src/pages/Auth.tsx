import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  sendMagicLink,
  sendPasswordReset,
  updatePassword,
} from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

type AuthView = 'login' | 'register' | 'forgot' | 'reset'

interface AuthProps {
  onSuccess: () => void
}

const inputClass =
  'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 w-full font-assistant'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function Auth({ onSuccess }: AuthProps) {
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (window.location.search.includes('reset=true')) {
      setView('reset')
    }
  }, [])

  useEffect(() => {
    if (user) {
      onSuccess()
    }
  }, [user, onSuccess])

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const switchView = (v: AuthView) => {
    clearMessages()
    setView(v)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    const result = await signInWithEmail(email, password)
    if (result.error) {
      setError('פרטי ההתחברות שגויים. בדוק את המייל והסיסמה.')
    }
    setLoading(false)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }
    setLoading(true)
    const result = await signUpWithEmail(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('נשלח אליך אימייל לאישור')
    }
    setLoading(false)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()
    const result = await sendPasswordReset(email)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('הקישור נשלח! בדוק את תיבת הדואר שלך')
    }
    setLoading(false)
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }
    setLoading(true)
    const result = await updatePassword(password)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('הסיסמה עודכנה בהצלחה!')
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('הכנס כתובת מייל תחילה')
      return
    }
    setLoading(true)
    clearMessages()
    const result = await sendMagicLink(email)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('קישור קסם נשלח למייל שלך!')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    clearMessages()
    const result = await signInWithGoogle()
    if (result.error) {
      setError('שגיאה בהתחברות עם Google')
      setLoading(false)
    }
  }

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 auth-bg" dir="rtl">
      {/* Animated radial gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(200,169,81,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background:
                  'radial-gradient(circle at 40% 40%, rgba(200,169,81,0.3), rgba(14,14,34,0.9))',
                border: '1px solid rgba(200,169,81,0.5)',
                boxShadow: '0 0 24px rgba(200,169,81,0.25)',
                filter: 'drop-shadow(0 0 8px rgba(200,169,81,0.6))',
              }}
            >
              <Eye size={28} style={{ color: '#C8A951' }} />
            </motion.div>
            <h1 className="shimmer-text font-montserrat font-bold text-2xl mb-1">האורקל</h1>
            <p className="font-assistant text-sm text-white/50">ראה את עתידך הכלכלי</p>
          </div>

          {/* Animated view content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm font-assistant mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Success */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300 text-sm font-assistant mb-4"
                >
                  {success}
                </motion.div>
              )}

              {/* LOGIN VIEW */}
              {view === 'login' && (
                <div>
                  <h2 className="text-white font-assistant font-bold text-xl mb-6">
                    ברוך הבא בחזרה
                  </h2>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder='דוא"ל'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                      dir="rtl"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                        dir="rtl"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-assistant font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#C8A951', color: '#060612' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      התחבר
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">או</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-assistant text-sm transition-all hover:bg-white/10 disabled:opacity-60 mb-3"
                  >
                    <GoogleIcon />
                    המשך עם Google
                  </button>

                  <div className="flex flex-col items-center gap-2 mt-4 text-xs font-assistant">
                    <button
                      onClick={handleMagicLink}
                      disabled={loading}
                      className="text-yellow-400/70 hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      ✨ שלח לי קישור קסם
                    </button>
                    <button
                      onClick={() => switchView('forgot')}
                      className="text-white/40 hover:text-white/60 transition-colors"
                    >
                      שכחת סיסמה?
                    </button>
                    <button
                      onClick={() => switchView('register')}
                      className="text-white/40 hover:text-white/60 transition-colors"
                    >
                      אין לך חשבון? הירשם
                    </button>
                  </div>
                </div>
              )}

              {/* REGISTER VIEW */}
              {view === 'register' && (
                <div>
                  <h2 className="text-white font-assistant font-bold text-xl mb-6">
                    צור חשבון חדש
                  </h2>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder='דוא"ל'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                      dir="rtl"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                        dir="rtl"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="אישור סיסמה"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={inputClass}
                        dir="rtl"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-assistant font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#C8A951', color: '#060612' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      צור חשבון
                    </button>
                  </form>

                  <div className="flex justify-center mt-4 text-xs font-assistant">
                    <button
                      onClick={() => switchView('login')}
                      className="text-white/40 hover:text-white/60 transition-colors"
                    >
                      יש לך חשבון? התחבר
                    </button>
                  </div>
                </div>
              )}

              {/* FORGOT VIEW */}
              {view === 'forgot' && (
                <div>
                  <h2 className="text-white font-assistant font-bold text-xl mb-2">
                    שחזור סיסמה
                  </h2>
                  <p className="text-white/50 text-sm font-assistant mb-6">
                    הכנס את כתובת המייל שלך ונשלח לך קישור לאיפוס
                  </p>
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder='דוא"ל'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                      dir="rtl"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-assistant font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#C8A951', color: '#060612' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      שלח קישור איפוס
                    </button>
                  </form>

                  <div className="flex justify-center mt-4 text-xs font-assistant">
                    <button
                      onClick={() => switchView('login')}
                      className="text-white/40 hover:text-white/60 transition-colors"
                    >
                      ← חזרה להתחברות
                    </button>
                  </div>
                </div>
              )}

              {/* RESET VIEW */}
              {view === 'reset' && (
                <div>
                  <h2 className="text-white font-assistant font-bold text-xl mb-6">סיסמה חדשה</h2>
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="סיסמה חדשה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={inputClass}
                        dir="rtl"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="אישור סיסמה חדשה"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={inputClass}
                        dir="rtl"
                        style={{ paddingLeft: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-assistant font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: '#C8A951', color: '#060612' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      עדכן סיסמה
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
