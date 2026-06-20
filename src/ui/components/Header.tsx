import { useState } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import { useSimStore } from '../store';
import { SCENARIOS, CUSTOM_SCENARIO_ID } from '../../scenarios';

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
        <ScenarioSelect />
        <ShareButton />
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

/** Header dropdown to load one of the InfraWheel scenario presets. */
function ScenarioSelect() {
  const { t } = useI18n();
  const activeScenario = useSimStore((s) => s.activeScenario);
  const applyScenario = useSimStore((s) => s.applyScenario);

  return (
    <select
      className="scenario-select"
      aria-label={t('scenario')}
      value={activeScenario}
      onChange={(e) => applyScenario(e.target.value)}
    >
      {activeScenario === CUSTOM_SCENARIO_ID && (
        <option value={CUSTOM_SCENARIO_ID} disabled>
          {t('scenario.custom')}
        </option>
      )}
      {SCENARIOS.map((s) => (
        <option key={s.id} value={s.id}>
          {t(`scenario.${s.id}` as TranslationKey)}
        </option>
      ))}
    </select>
  );
}

/** Copies the current shareable URL (which encodes full state) to the clipboard. */
function ShareButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — silently ignore */
    }
  };

  return (
    <button className="share-btn" onClick={onShare}>
      {copied ? t('shareCopied') : t('share')}
    </button>
  );
}
