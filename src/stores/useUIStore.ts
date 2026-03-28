import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'dark' | 'light';
  language: 'he' | 'en';
  fontSize: number; // 14-22, default 16
  highContrast: boolean;
  reducedMotion: boolean;
  readableFont: boolean;
  sidebarOpen: boolean;
  onboardingComplete: boolean;
  onboardingStep: number; // 0-5, -1 = not started

  toggleTheme: () => void;
  setLanguage: (lang: 'he' | 'en') => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleReadableFont: () => void;
  toggleSidebar: () => void;
  resetAccessibility: () => void;
  startOnboarding: () => void;
  nextOnboardingStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'he',
      fontSize: 16,
      highContrast: false,
      reducedMotion: false,
      readableFont: false,
      sidebarOpen: true,
      onboardingComplete: false,
      onboardingStep: -1,

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },

      setLanguage: (lang) => {
        set({ language: lang });
      },

      increaseFontSize: () => {
        const current = get().fontSize;
        if (current < 22) set({ fontSize: current + 1 });
      },

      decreaseFontSize: () => {
        const current = get().fontSize;
        if (current > 14) set({ fontSize: current - 1 });
      },

      toggleHighContrast: () => {
        set((state) => ({ highContrast: !state.highContrast }));
      },

      toggleReducedMotion: () => {
        set((state) => ({ reducedMotion: !state.reducedMotion }));
      },

      toggleReadableFont: () => {
        set((state) => ({ readableFont: !state.readableFont }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      resetAccessibility: () => {
        set({
          fontSize: 16,
          highContrast: false,
          reducedMotion: false,
          readableFont: false,
        });
      },

      startOnboarding: () => {
        set({ onboardingStep: 0 });
      },

      nextOnboardingStep: () => {
        const current = get().onboardingStep;
        if (current >= 5) {
          set({ onboardingComplete: true, onboardingStep: -1 });
        } else {
          set({ onboardingStep: current + 1 });
        }
      },

      skipOnboarding: () => {
        set({ onboardingComplete: true, onboardingStep: -1 });
      },

      resetOnboarding: () => {
        set({ onboardingComplete: false, onboardingStep: -1 });
      },
    }),
    {
      name: 'oracle-ui',
    }
  )
);
