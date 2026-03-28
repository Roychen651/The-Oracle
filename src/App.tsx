import { useEffect } from 'react';
import { useUIStore } from './stores/useUIStore';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { theme, language, fontSize, highContrast, reducedMotion, readableFont } = useUIStore();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  // Apply direction and language
  useEffect(() => {
    const root = document.documentElement;
    root.dir = language === 'he' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Apply body classes for accessibility
  useEffect(() => {
    const classes = [];
    if (highContrast) classes.push('high-contrast');
    if (reducedMotion) classes.push('reduce-motion');
    if (readableFont) classes.push('readable-font');
    document.body.className = classes.join(' ');
  }, [highContrast, reducedMotion, readableFont]);

  return (
    <div
      data-theme={theme === 'light' ? 'light' : undefined}
      className={`min-h-screen font-assistant`}
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        direction: language === 'he' ? 'rtl' : 'ltr',
        fontSize: `${fontSize}px`,
      }}
    >
      <AppShell>
        <Dashboard />
      </AppShell>
    </div>
  );
}
