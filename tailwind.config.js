/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'border-custom': 'var(--border)',
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
      },
      fontFamily: {
        assistant: ['Assistant', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(200, 169, 81, 0.3)',
        'gold-lg': '0 0 40px rgba(200, 169, 81, 0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(200, 169, 81, 0.2)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--gold-glow)' },
          '50%': { boxShadow: '0 0 0 8px transparent' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
