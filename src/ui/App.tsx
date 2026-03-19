import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { DiagramPlaceholder } from './components/DiagramPlaceholder';
import { TimelineChart } from './components/TimelineChart';
import './styles.css';

export function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <ParameterPanel />
        <DiagramPlaceholder />
        <TimelineChart />
      </main>
    </div>
  );
}
