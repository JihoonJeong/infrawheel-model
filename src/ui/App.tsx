import { useState } from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { InfraWheelDiagram } from './components/InfraWheelDiagram';
import { TimelineChart } from './components/TimelineChart';
import { AboutModal } from './components/AboutModal';
import { GeopoliticalTab } from './geopolitical/GeopoliticalTab';
import { useSimStore } from './store';
import { I18nCtx, createI18n } from './i18n';
import type { Locale } from './i18n';
import type { SimTab } from './store';
import './styles.css';

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const [view, setView] = useState<'landing' | 'simulator'>('landing');
  const [showAbout, setShowAbout] = useState(false);
  const activeTab = useSimStore((s) => s.activeTab);
  const setActiveTab = useSimStore((s) => s.setActiveTab);
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
          >
            <TabBar active={activeTab} onChange={setActiveTab} />
          </Header>
          {activeTab === 'infrawheel' ? (
            <main className="app-main">
              <ParameterPanel />
              <InfraWheelDiagram />
              <TimelineChart />
            </main>
          ) : (
            <GeopoliticalTab />
          )}
          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        </div>
      )}
    </I18nCtx.Provider>
  );
}

function TabBar({ active, onChange }: { active: SimTab; onChange: (t: SimTab) => void }) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-btn ${active === 'infrawheel' ? 'active' : ''}`}
        onClick={() => onChange('infrawheel')}
      >
        InfraWheel
      </button>
      <button
        className={`tab-btn ${active === 'geopolitical' ? 'active' : ''}`}
        onClick={() => onChange('geopolitical')}
      >
        Geopolitical
      </button>
    </div>
  );
}
