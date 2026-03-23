/**
 * Zustand store — single source of truth for simulator state.
 * Supports both InfraWheel (direct params) and Geopolitical (overlay) tabs.
 */

import { create } from 'zustand';
import { simulate } from '../engine';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import { applyGeoOverlay, DEFAULT_GEO } from './geopolitical/geoMapping';
import type { InfraWheelParams, SimulationConfig, CycleOutput } from '../types';
import type { TranslationKey } from './i18n';
import type { GeoState, TaiwanCrisis } from './geopolitical/geoMapping';

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

export type SimTab = 'infrawheel' | 'geopolitical';

interface SimStore {
  // ── Shared ──
  config: SimulationConfig;
  selectedMetrics: MetricKey[];
  activeTab: SimTab;

  // ── InfraWheel tab ──
  params: InfraWheelParams;
  results: CycleOutput[];

  // ── Geopolitical tab ──
  geoState: GeoState;
  geoParams: InfraWheelParams;   // params after geo overlay
  geoResults: CycleOutput[];

  // ── Actions ──
  setParam: <N extends keyof InfraWheelParams>(
    node: N, key: keyof InfraWheelParams[N], value: number,
  ) => void;
  resetParams: () => void;
  toggleMetric: (metric: MetricKey) => void;
  setActiveTab: (tab: SimTab) => void;

  setGeoBloc: (pct: number) => void;
  setGeoEnergy: (pct: number) => void;
  setGeoTaiwan: (crisis: TaiwanCrisis) => void;
  applyGeoPreset: (blocPct: number, energyPct: number, taiwanCrisis: TaiwanCrisis) => void;
}

function runSim(params: InfraWheelParams, config: SimulationConfig): CycleOutput[] {
  return simulate(params, config);
}

function computeGeo(base: InfraWheelParams, geo: GeoState, config: SimulationConfig) {
  const geoParams = applyGeoOverlay(base, geo);
  const geoResults = runSim(geoParams, config);
  return { geoParams, geoResults };
}

export const useSimStore = create<SimStore>((set) => {
  const initial = computeGeo(DEFAULT_PARAMS, DEFAULT_GEO, DEFAULT_CONFIG);

  return {
    config: { ...DEFAULT_CONFIG },
    selectedMetrics: ['totalRevenue', 'totalCAPEX', 'bottleneckRatio'],
    activeTab: 'infrawheel',

    params: { ...DEFAULT_PARAMS },
    results: runSim(DEFAULT_PARAMS, DEFAULT_CONFIG),

    geoState: { ...DEFAULT_GEO },
    geoParams: initial.geoParams,
    geoResults: initial.geoResults,

    setParam: (node, key, value) =>
      set((state) => {
        const newParams = {
          ...state.params,
          [node]: { ...state.params[node], [key]: value },
        };
        const geo = computeGeo(newParams, state.geoState, state.config);
        return {
          params: newParams,
          results: runSim(newParams, state.config),
          ...geo,
        };
      }),

    resetParams: () =>
      set((state) => {
        const geo = computeGeo(DEFAULT_PARAMS, state.geoState, state.config);
        return {
          params: { ...DEFAULT_PARAMS },
          results: runSim(DEFAULT_PARAMS, state.config),
          ...geo,
        };
      }),

    toggleMetric: (metric) =>
      set((state) => {
        const current = state.selectedMetrics;
        const next = current.includes(metric)
          ? current.filter((m) => m !== metric)
          : [...current, metric];
        return { selectedMetrics: next.length > 0 ? next : current };
      }),

    setActiveTab: (tab) => set({ activeTab: tab }),

    setGeoBloc: (pct) =>
      set((state) => {
        const newGeo = { ...state.geoState, blocPct: pct };
        return { geoState: newGeo, ...computeGeo(state.params, newGeo, state.config) };
      }),

    setGeoEnergy: (pct) =>
      set((state) => {
        const newGeo = { ...state.geoState, energyPct: pct };
        return { geoState: newGeo, ...computeGeo(state.params, newGeo, state.config) };
      }),

    setGeoTaiwan: (crisis) =>
      set((state) => {
        const newGeo = { ...state.geoState, taiwanCrisis: crisis };
        return { geoState: newGeo, ...computeGeo(state.params, newGeo, state.config) };
      }),

    applyGeoPreset: (blocPct, energyPct, taiwanCrisis) =>
      set((state) => {
        const newGeo: GeoState = { blocPct, energyPct, taiwanCrisis };
        return { geoState: newGeo, ...computeGeo(state.params, newGeo, state.config) };
      }),
  };
});
