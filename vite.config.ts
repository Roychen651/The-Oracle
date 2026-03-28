import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is set in GitHub Actions for GitHub Pages deployment
// e.g. /the-oracle/ — leave blank for Vercel / custom domain
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
