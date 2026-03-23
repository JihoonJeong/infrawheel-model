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
import { useSimStore, METRIC_I18N, ALL_METRICS } from '../store';
import { useI18n } from '../i18n';
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
  const { t } = useI18n();
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
      {t(METRIC_I18N[metric])}
    </button>
  );
}

export function TimelineChart({ useGeoResults }: { useGeoResults?: boolean } = {}) {
  const { t } = useI18n();
  const infraResults = useSimStore((s) => s.results);
  const geoResults = useSimStore((s) => s.geoResults);
  const results = useGeoResults ? geoResults : infraResults;
  const selectedMetrics = useSimStore((s) => s.selectedMetrics);

  const chartData = results.map((cycle) => {
    const row: Record<string, string | number> = { quarter: cycle.quarter };
    for (const key of selectedMetrics) {
      row[key] = Number(getMetricValue(cycle, key).toFixed(4));
    }
    return row;
  });

  const tickFormatter = (_value: string, index: number) =>
    index % 4 === 0 ? _value : '';

  return (
    <section className="timeline-panel">
      <div className="timeline-header">
        <h2>{t('timelineProjection')}</h2>
      </div>
      <div className="metric-toggles">
        {ALL_METRICS.map((m) => (
          <MetricToggle key={m} metric={m} />
        ))}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 11 }}
              tickFormatter={tickFormatter}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} width={60} />
            <Tooltip
              contentStyle={{
                background: '#334155',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 12,
              }}
            />
            <Legend />
            {selectedMetrics.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={t(METRIC_I18N[key])}
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
