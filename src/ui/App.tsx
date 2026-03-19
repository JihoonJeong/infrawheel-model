import { useState } from 'react';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { InfraWheelDiagram } from './components/InfraWheelDiagram';
import { TimelineChart } from './components/TimelineChart';
import { I18nCtx, createI18n } from './i18n';
import type { Locale } from './i18n';
import './styles.css';

export function App() {
  const [locale, setLocale] = useState<Locale>('en');
  const i18n = createI18n(locale, setLocale);

  return (
    <I18nCtx.Provider value={i18n}>
      <div className="app">
        <Header />
        <main className="app-main">
          <ParameterPanel />
          <InfraWheelDiagram />
          <TimelineChart />
        </main>
      </div>
    </I18nCtx.Provider>
  );
}
