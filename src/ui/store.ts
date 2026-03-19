/**
 * Zustand store — single source of truth for simulator state.
 * Holds params, config, and derived simulation results.
 */

import { create } from 'zustand';
import { simulate } from '../engine';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import type { InfraWheelParams, SimulationConfig, CycleOutput } from '../types';

/** Which metric to display on the timeline chart */
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

export const METRIC_LABELS: Record<MetricKey, string> = {
  totalRevenue: 'Total AI Revenue ($B/Q)',
  totalCAPEX: 'Total CAPEX ($B/Q)',
  bottleneckRatio: 'Bottleneck Ratio',
  digitalRevenue: 'Digital AI Revenue ($B/Q)',
  physicalRevenue: 'Physical AI Revenue ($B/Q)',
  hyperscaleEffective: 'Hyperscale Effective Compute',
  spatialEffective: 'Spatial Effective Compute',
  frontierCapability: 'Frontier Capability',
  confidence: 'Market Confidence',
};

interface SimStore {
  params: InfraWheelParams;
  config: SimulationConfig;
  results: CycleOutput[];
  selectedMetrics: MetricKey[];

  /** Update a single parameter value by path */
  setParam: <N extends keyof InfraWheelParams>(
    node: N,
    key: keyof InfraWheelParams[N],
    value: number,
  ) => void;

  /** Reset all params to defaults */
  resetParams: () => void;

  /** Toggle a metric on/off in the chart */
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
