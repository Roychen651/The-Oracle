import { useEffect, useState } from 'react';
import { useUIStore } from './stores/useUIStore';
import { useAuthStore } from './stores/useAuthStore';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import KnowledgeLibrary from './pages/KnowledgeLibrary';
import OnboardingTour from './components/ui/OnboardingTour';

export default function App() {
  const { theme, language, fontSize, highContrast, reducedMotion, readableFont, currentPage } = useUIStore();
  const [showAuth, setShowAuth] = useState(false);

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

  // Initialize auth store and subscribe to updates
  useEffect(() => {
    const cleanup = useAuthStore.getState().initialize();
    return cleanup;
  }, []);

  // After auth is initialized, check for reset flow and trigger onboarding
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (!state.initialized) return;

      // Show auth page for password reset flow
      if (window.location.search.includes('reset=true')) {
        setShowAuth(true);
      }

      // Trigger onboarding after init if not complete
      const { onboardingComplete, startOnboarding } = useUIStore.getState();
      if (!onboardingComplete) {
        setTimeout(() => {
          startOnboarding();
        }, 1000);
      }

      unsubscribe();
    });

    return unsubscribe;
  }, []);

  if (showAuth) {
    return (
      <div
        data-theme={theme === 'light' ? 'light' : undefined}
        className="min-h-screen font-assistant"
        style={{
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          direction: language === 'he' ? 'rtl' : 'ltr',
          fontSize: `${fontSize}px`,
        }}
      >
        <Auth onSuccess={() => setShowAuth(false)} />
      </div>
    );
  }

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
      <AppShell onShowAuth={() => setShowAuth(true)}>
        {currentPage === 'knowledge' ? (
          <KnowledgeLibrary />
        ) : (
          <Dashboard onShowAuth={() => setShowAuth(true)} />
        )}
      </AppShell>

      {/* Onboarding tour always rendered (self-manages visibility) */}
      <OnboardingTour />
    </div>
  );
}
