import { useState } from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { InfraWheelDiagram } from './components/InfraWheelDiagram';
import { TimelineChart } from './components/TimelineChart';
import { AboutModal } from './components/AboutModal';
import { I18nCtx, createI18n } from './i18n';
import type { Locale } from './i18n';
import './styles.css';

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const [view, setView] = useState<'landing' | 'simulator'>('landing');
  const [showAbout, setShowAbout] = useState(false);
  const i18n = createI18n(locale, setLocale);

  return (
    <I18nCtx.Provider value={i18n}>
      {view === 'landing' ? (
        <Landing onLaunch={() => setView('simulator')} />
      ) : (
        <div className="app">
          <Header
            onAbout={() => setShowAbout(true)}
            onBack={() => setView('landing')}
          />
          <main className="app-main">
            <ParameterPanel />
            <InfraWheelDiagram />
            <TimelineChart />
          </main>
          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        </div>
      )}
    </I18nCtx.Provider>
  );
}
