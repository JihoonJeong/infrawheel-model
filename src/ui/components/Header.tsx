import { useI18n } from '../i18n';

export function Header() {
  const { t, locale, setLocale } = useI18n();

  return (
    <header className="app-header">
      <h1 className="app-title">{t('appTitle')}</h1>
      <div className="header-actions">
        <span className="header-badge">{t('phaseBadge')}</span>
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
