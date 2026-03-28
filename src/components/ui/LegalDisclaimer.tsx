import { useTranslation } from 'react-i18next';

export default function LegalDisclaimer() {
  const { t } = useTranslation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-10 flex items-center justify-center px-4"
      style={{
        background: 'rgba(6, 6, 18, 0.95)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <p
        className="text-text-muted text-center font-assistant leading-tight"
        style={{ fontSize: '10px' }}
      >
        {t('legal.disclaimer')}
      </p>
    </div>
  );
}
