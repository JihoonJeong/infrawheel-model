import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSimStore, METRIC_LABELS } from '../store';
import type { MetricKey } from '../store';
import type { CycleOutput } from '../../types';

const METRIC_COLORS: Record<MetricKey, string> = {
  totalRevenue: '#3b82f6',
  totalCAPEX: '#ef4444',
  bottleneckRatio: '#f59e0b',
  digitalRevenue: '#ec4899',
  physicalRevenue: '#10b981',
  hyperscaleEffective: '#6366f1',
  spatialEffective: '#14b8a6',
  frontierCapability: '#a855f7',
  confidence: '#64748b',
};

/** Extract a metric value from CycleOutput */
function getMetricValue(cycle: CycleOutput, key: MetricKey): number {
  switch (key) {
    case 'totalRevenue':
      return cycle.totalRevenue;
    case 'totalCAPEX':
      return cycle.totalCAPEX;
    case 'bottleneckRatio':
      return cycle.bottleneckRatio;
    case 'digitalRevenue':
      return cycle.nodeOutputs.digitalRevenue;
    case 'physicalRevenue':
      return cycle.nodeOutputs.physicalRevenue;
    case 'hyperscaleEffective':
      return cycle.nodeOutputs.hyperscaleEffective;
    case 'spatialEffective':
      return cycle.nodeOutputs.spatialEffective;
    case 'frontierCapability':
      return cycle.nodeOutputs.frontierCapability;
    case 'confidence':
      return cycle.nodeOutputs.confidence;
  }
}

function MetricToggle({ metric }: { metric: MetricKey }) {
  const selected = useSimStore((s) => s.selectedMetrics.includes(metric));
  const toggle = useSimStore((s) => s.toggleMetric);

  return (
    <button
      className={`metric-toggle ${selected ? 'active' : ''}`}
      style={{
        borderColor: METRIC_COLORS[metric],
        backgroundColor: selected ? METRIC_COLORS[metric] + '18' : undefined,
      }}
      onClick={() => toggle(metric)}
    >
      <span
        className="metric-dot"
        style={{ backgroundColor: METRIC_COLORS[metric] }}
      />
      {METRIC_LABELS[metric]}
    </button>
  );
}

export function TimelineChart() {
  const results = useSimStore((s) => s.results);
  const selectedMetrics = useSimStore((s) => s.selectedMetrics);

  // Build chart data: one row per quarter
  const chartData = results.map((cycle) => {
    const row: Record<string, string | number> = { quarter: cycle.quarter };
    for (const key of selectedMetrics) {
      row[key] = Number(getMetricValue(cycle, key).toFixed(4));
    }
    return row;
  });

  // Show every 4th label (yearly) to avoid clutter
  const tickFormatter = (value: string, index: number) =>
    index % 4 === 0 ? value : '';

  return (
    <section className="timeline-panel">
      <div className="timeline-header">
        <h2>Timeline Projection</h2>
      </div>
      <div className="metric-toggles">
        {(Object.keys(METRIC_LABELS) as MetricKey[]).map((m) => (
          <MetricToggle key={m} metric={m} />
        ))}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 11 }}
              tickFormatter={tickFormatter}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} width={60} />
            <Tooltip />
            <Legend />
            {selectedMetrics.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={METRIC_LABELS[key]}
                stroke={METRIC_COLORS[key]}
                strokeWidth={2}
                dot={false}
                animationDuration={200}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
