import type { ReactNode } from 'react';
import { useI18n } from '../i18n';

export function Header({
  onAbout,
  onBack,
  children,
}: {
  onAbout: () => void;
  onBack: () => void;
  children?: ReactNode;
}) {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="back-btn" onClick={onBack}>
          {t('landing.backToHome')}
        </button>
        {children}
      </div>
      <div className="header-actions">
        <button className="about-btn" onClick={onAbout}>?</button>
        <button
          className="lang-toggle"
          onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
        >
          {t('langToggle')}
        </button>
      </div>
    </header>
  );
}
