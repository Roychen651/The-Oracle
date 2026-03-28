import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Mail, Lock, Chrome, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, sendMagicLink } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'magic';

interface AuthMessage {
  type: 'error' | 'success';
  text: string;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'magic') {
        const { error } = await sendMagicLink(email);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'קישור נשלח! בדוק את המייל שלך.' });
        }
      } else if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setMessage({ type: 'error', text: 'פרטי ההתחברות שגויים' });
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'חשבון נוצר! בדוק את המייל לאימות.' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'שגיאה בלתי צפויה' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setMessage({ type: 'error', text: 'שגיאה בהתחברות עם Google' });
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, var(--gold-glow) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'radial-gradient(circle, var(--gold-glow-strong), var(--surface-elevated))',
                border: '2px solid var(--gold)',
                boxShadow: '0 0 20px var(--gold-glow)',
              }}
            >
              <Eye size={28} style={{ color: 'var(--gold)' }} />
            </div>
            <h1 className="shimmer-text font-montserrat font-bold text-2xl mb-1">
              האורקל
            </h1>
            <p className="font-assistant text-sm" style={{ color: 'var(--text-secondary)' }}>
              {mode === 'signin'
                ? 'התחבר לחשבונך'
                : mode === 'signup'
                  ? 'צור חשבון חדש'
                  : 'כניסה עם קישור קסם'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-assistant ${
                message.type === 'error'
                  ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                  : 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              {message.text}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-assistant mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                כתובת מייל
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-surface-elevated border border-border-custom rounded-xl py-3 pr-10 pl-4 text-sm font-assistant text-text-primary outline-none transition-colors focus:border-gold"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'magic' && (
              <div>
                <label className="block text-sm font-assistant mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  סיסמה
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-surface-elevated border border-border-custom rounded-xl py-3 pr-10 pl-4 text-sm font-montserrat text-text-primary outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-assistant font-bold text-sm transition-all disabled:opacity-60"
              style={{
                background: 'var(--gold)',
                color: 'var(--bg)',
              }}
            >
              {loading
                ? 'טוען...'
                : mode === 'signin'
                  ? 'התחבר'
                  : mode === 'signup'
                    ? 'צור חשבון'
                    : 'שלח קישור'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
              או
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-assistant text-sm transition-all hover:border-gold disabled:opacity-60"
            style={{
              background: 'var(--surface-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <Chrome size={16} />
            כניסה עם Google
          </button>

          {/* Mode switcher */}
          <div className="flex flex-col gap-2 mt-5 text-center text-xs font-assistant" style={{ color: 'var(--text-muted)' }}>
            {mode !== 'magic' && (
              <button
                onClick={() => setMode('magic')}
                className="hover:text-gold transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles size={12} />
                כניסה עם קישור קסם (ללא סיסמה)
              </button>
            )}
            {mode === 'signin' && (
              <button
                onClick={() => setMode('signup')}
                className="hover:text-text-secondary transition-colors"
              >
                אין לך חשבון? הירשם
              </button>
            )}
            {(mode === 'signup' || mode === 'magic') && (
              <button
                onClick={() => setMode('signin')}
                className="hover:text-text-secondary transition-colors"
              >
                יש לך חשבון? התחבר
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
