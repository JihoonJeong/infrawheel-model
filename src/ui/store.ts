/**
 * Zustand store — single source of truth for simulator state.
 */

import { create } from 'zustand';
import { simulate } from '../engine';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import type { InfraWheelParams, SimulationConfig, CycleOutput } from '../types';
import type { TranslationKey } from './i18n';

export type MetricKey =
  | 'totalRevenue'
  | 'totalCAPEX'
  | 'bottleneckRatio'
  | 'digitalRevenue'
  | 'physicalRevenue'
  | 'hyperscaleEffective'
  | 'spatialEffective'
  | 'frontierCapability'
  | 'confidence';

/** Maps MetricKey → i18n translation key */
export const METRIC_I18N: Record<MetricKey, TranslationKey> = {
  totalRevenue: 'metric.totalRevenue',
  totalCAPEX: 'metric.totalCAPEX',
  bottleneckRatio: 'metric.bottleneckRatio',
  digitalRevenue: 'metric.digitalRevenue',
  physicalRevenue: 'metric.physicalRevenue',
  hyperscaleEffective: 'metric.hyperscaleEffective',
  spatialEffective: 'metric.spatialEffective',
  frontierCapability: 'metric.frontierCapability',
  confidence: 'metric.confidence',
};

export const ALL_METRICS: MetricKey[] = Object.keys(METRIC_I18N) as MetricKey[];

interface SimStore {
  params: InfraWheelParams;
  config: SimulationConfig;
  results: CycleOutput[];
  selectedMetrics: MetricKey[];

  setParam: <N extends keyof InfraWheelParams>(
    node: N,
    key: keyof InfraWheelParams[N],
    value: number,
  ) => void;

  resetParams: () => void;
  toggleMetric: (metric: MetricKey) => void;
}

function runSim(params: InfraWheelParams, config: SimulationConfig): CycleOutput[] {
  return simulate(params, config);
}

export const useSimStore = create<SimStore>((set) => ({
  params: { ...DEFAULT_PARAMS },
  config: { ...DEFAULT_CONFIG },
  results: runSim(DEFAULT_PARAMS, DEFAULT_CONFIG),
  selectedMetrics: ['totalRevenue', 'totalCAPEX', 'bottleneckRatio'],

  setParam: (node, key, value) =>
    set((state) => {
      const newParams = {
        ...state.params,
        [node]: { ...state.params[node], [key]: value },
      };
      return {
        params: newParams,
        results: runSim(newParams, state.config),
      };
    }),

  resetParams: () =>
    set((state) => ({
      params: { ...DEFAULT_PARAMS },
      results: runSim(DEFAULT_PARAMS, state.config),
    })),

  toggleMetric: (metric) =>
    set((state) => {
      const current = state.selectedMetrics;
      const next = current.includes(metric)
        ? current.filter((m) => m !== metric)
        : [...current, metric];
      return { selectedMetrics: next.length > 0 ? next : current };
    }),
}));
