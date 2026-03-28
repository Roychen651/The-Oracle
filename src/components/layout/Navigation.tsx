import { motion } from 'framer-motion';
import { Eye, Sun, Moon, Globe, Save, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { useUIStore } from '../../stores/useUIStore';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function Navigation() {
  const { t } = useTranslation();
  const { theme, language, toggleTheme, setLanguage, toggleSidebar } = useUIStore();
  const { params } = useSimulationStore();

  const handleLanguageToggle = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleSave = () => {
    const json = JSON.stringify(params, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oracle-scenario.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass sticky top-0 z-40 h-16 flex items-center px-4 sm:px-6"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors md:hidden"
            aria-label="תפריט"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative gold-glow-animate"
              style={{
                background: 'radial-gradient(circle at 40% 40%, var(--gold-glow-strong), var(--surface-elevated))',
                border: '1px solid var(--gold)',
                boxShadow: '0 0 16px var(--gold-glow)',
              }}
            >
              <Eye
                size={18}
                style={{ color: 'var(--gold)' }}
              />
              {/* Inner glow dot */}
              <div
                className="absolute w-1.5 h-1.5 rounded-full top-1.5 right-1.5"
                style={{ background: 'var(--gold-light)', boxShadow: '0 0 4px var(--gold-light)' }}
              />
            </div>

            <div>
              <h1 className="shimmer-text font-montserrat font-bold text-xl leading-none">
                {t('appName')}
              </h1>
              <p className="text-text-muted font-assistant text-xs leading-none mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-custom text-text-secondary hover:text-gold hover:border-gold transition-all text-xs font-montserrat font-medium"
            aria-label="שנה שפה"
          >
            <Globe size={14} />
            <span>{language === 'he' ? 'EN' : 'עב'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-surface-elevated border border-border-custom text-text-secondary hover:text-gold hover:border-gold transition-all"
            aria-label={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Save scenario */}
          <button
            onClick={handleSave}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-assistant font-semibold transition-all btn-magnetic"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
            }}
            aria-label={t('nav.saveScenario')}
          >
            <Save size={14} />
            {t('nav.saveScenario')}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
