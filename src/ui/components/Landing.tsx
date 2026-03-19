import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const NODE_CARDS: { labelKey: TranslationKey; descKey: TranslationKey; color: string }[] = [
  { labelKey: 'wheel.silicon', descKey: 'landing.nodeSilicon', color: '#6366f1' },
  { labelKey: 'wheel.energy', descKey: 'landing.nodeEnergy', color: '#f59e0b' },
  { labelKey: 'wheel.hyperscale', descKey: 'landing.nodeHyperscale', color: '#3b82f6' },
  { labelKey: 'wheel.spatial', descKey: 'landing.nodeSpatial', color: '#14b8a6' },
  { labelKey: 'wheel.intelligence', descKey: 'landing.nodeIntelligence', color: '#a855f7' },
  { labelKey: 'wheel.digital', descKey: 'landing.nodeDigital', color: '#ec4899' },
  { labelKey: 'wheel.physical', descKey: 'landing.nodePhysical', color: '#10b981' },
  { labelKey: 'wheel.capital', descKey: 'landing.nodeCapital', color: '#ef4444' },
];

export function Landing({ onLaunch }: { onLaunch: () => void }) {
  const { t, locale, setLocale } = useI18n();

  return (
    <div className="landing">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <span className="landing-nav-brand">InfraWheel</span>
        <div className="landing-nav-actions">
          <button className="landing-nav-link" onClick={onLaunch}>
            {t('landing.navSimulator')}
          </button>
          <button
            className="landing-lang"
            onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
          >
            {t('langToggle')}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <p className="landing-eyebrow">{t('landing.eyebrow')}</p>
        <h1 className="landing-title">{t('landing.title')}</h1>
        <p className="landing-subtitle">{t('landing.subtitle')}</p>
        <button className="landing-cta" onClick={onLaunch}>
          {t('landing.cta')} <span className="cta-arrow">→</span>
        </button>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats">
        <div className="landing-stat">
          <span className="stat-number">8</span>
          <span className="stat-desc">{t('landing.statNodes')}</span>
        </div>
        <div className="landing-stat">
          <span className="stat-number">19</span>
          <span className="stat-desc">{t('landing.statParams')}</span>
        </div>
        <div className="landing-stat">
          <span className="stat-number">44</span>
          <span className="stat-desc">{t('landing.statQuarters')}</span>
        </div>
        <div className="landing-stat">
          <span className="stat-number">2</span>
          <span className="stat-desc">{t('landing.statLoops')}</span>
        </div>
      </section>

      {/* ── Two Loops ── */}
      <section className="landing-section">
        <h2>{t('landing.loopsTitle')}</h2>
        <div className="landing-loops">
          <div className="landing-loop">
            <div className="loop-indicator hyperscale" />
            <h3>{t('landing.hyperscaleTitle')}</h3>
            <p>{t('landing.hyperscaleDesc')}</p>
          </div>
          <div className="landing-loop">
            <div className="loop-indicator spatial" />
            <h3>{t('landing.spatialTitle')}</h3>
            <p>{t('landing.spatialDesc')}</p>
          </div>
        </div>
      </section>

      {/* ── Nodes ── */}
      <section className="landing-section">
        <h2>{t('landing.nodesTitle')}</h2>
        <div className="landing-nodes">
          {NODE_CARDS.map((card) => (
            <div key={card.labelKey} className="node-card">
              <div className="node-card-dot" style={{ backgroundColor: card.color }} />
              <h3>{t(card.labelKey)}</h3>
              <p>{t(card.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section">
        <h2>{t('landing.howTitle')}</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="step-num">01</span>
            <p>{t('landing.step1')}</p>
          </div>
          <div className="landing-step">
            <span className="step-num">02</span>
            <p>{t('landing.step2')}</p>
          </div>
          <div className="landing-step">
            <span className="step-num">03</span>
            <p>{t('landing.step3')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="landing-bottom-cta">
        <p className="landing-bottom-tagline">{t('landing.bottomTagline')}</p>
        <button className="landing-cta" onClick={onLaunch}>
          {t('landing.cta')} <span className="cta-arrow">→</span>
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
