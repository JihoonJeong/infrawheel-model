/**
 * Zustand store — single source of truth for simulator state.
 * Supports both InfraWheel (direct params) and Geopolitical (overlay) tabs.
 * State is restored from / mirrored to the URL hash (urlState.ts) for shareable links.
 */

import { create } from 'zustand';
import { simulate } from '../engine';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import { applyGeoOverlay, DEFAULT_GEO } from './geopolitical/geoMapping';
import { SCENARIO_BY_ID, BASE_SCENARIO_ID, CUSTOM_SCENARIO_ID } from '../scenarios';
import { encodeState, decodeState } from './urlState';
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

const DEFAULT_METRICS: MetricKey[] = ['totalRevenue', 'totalCAPEX', 'bottleneckRatio'];

interface SimStore {
  // ── Shared ──
  config: SimulationConfig;
  selectedMetrics: MetricKey[];
  activeTab: SimTab;
  activeScenario: string;

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
  applyScenario: (id: string) => void;
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

function cloneParams(p: InfraWheelParams): InfraWheelParams {
  return {
    silicon: { ...p.silicon },
    energy: { ...p.energy },
    intelligence: { ...p.intelligence },
    capital: { ...p.capital },
    hyperscaleDC: { ...p.hyperscaleDC },
    digitalAI: { ...p.digitalAI },
    spatialCompute: { ...p.spatialCompute },
    physicalAI: { ...p.physicalAI },
  };
}

/** Build the params/config/results/geo slice for a scenario id (falls back to base). */
function scenarioSlice(id: string, geoState: GeoState) {
  const scenario = SCENARIO_BY_ID[id];
  const params = scenario ? cloneParams(scenario.params) : { ...DEFAULT_PARAMS };
  const config = scenario?.config ? { ...DEFAULT_CONFIG, ...scenario.config } : { ...DEFAULT_CONFIG };
  return {
    activeScenario: scenario ? id : BASE_SCENARIO_ID,
    params,
    config,
    results: runSim(params, config),
    ...computeGeo(params, geoState, config),
  };
}

// ── Margin-lead indicator (F): quarters earlier the run reaches the 75% effective-margin clamp
//    than Base Case 2026. Surfaces algoBreakthrough's *leading* value (the endpoint gap → 0). ──
const MARGIN_TARGET = 75;
const BASE_REF_RESULTS = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);

function quarterReachingMargin(results: CycleOutput[]): number {
  return results.findIndex((c) => c.nodeOutputs.effectiveMargin >= MARGIN_TARGET - 1e-9);
}

/**
 * Quarters the run reaches 75% effective margin *earlier* than Base Case 2026.
 * + leads Base, − lags, 0 same; null when the target isn't reached within the horizon.
 */
export function marginLeadVsBase(results: CycleOutput[]): number | null {
  const cur = quarterReachingMargin(results);
  const base = quarterReachingMargin(BASE_REF_RESULTS);
  if (cur < 0 || base < 0) return null;
  return base - cur;
}

export const useSimStore = create<SimStore>((set) => {
  const decoded = decodeState(typeof location !== 'undefined' ? location.hash : '');
  const params = decoded.params ?? { ...DEFAULT_PARAMS };
  const config = decoded.config ?? { ...DEFAULT_CONFIG };
  const geoState = decoded.geoState ?? { ...DEFAULT_GEO };
  const activeTab = decoded.activeTab ?? 'infrawheel';
  const selectedMetrics = decoded.selectedMetrics ?? DEFAULT_METRICS;
  const activeScenario = decoded.activeScenario ?? BASE_SCENARIO_ID;
  const geo = computeGeo(params, geoState, config);

  return {
    config,
    selectedMetrics,
    activeTab,
    activeScenario,

    params,
    results: runSim(params, config),

    geoState,
    geoParams: geo.geoParams,
    geoResults: geo.geoResults,

    setParam: (node, key, value) =>
      set((state) => {
        const newParams = {
          ...state.params,
          [node]: { ...state.params[node], [key]: value },
        };
        return {
          params: newParams,
          activeScenario: CUSTOM_SCENARIO_ID,
          results: runSim(newParams, state.config),
          ...computeGeo(newParams, state.geoState, state.config),
        };
      }),

    resetParams: () => set((state) => scenarioSlice(BASE_SCENARIO_ID, state.geoState)),

    applyScenario: (id) => set((state) => scenarioSlice(id, state.geoState)),

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

// ── Mirror state into the URL hash (shareable links) ──
if (typeof history !== 'undefined' && typeof location !== 'undefined') {
  useSimStore.subscribe((state) => {
    try {
      const hash = encodeState({
        params: state.params,
        geoState: state.geoState,
        activeTab: state.activeTab,
        selectedMetrics: state.selectedMetrics,
        activeScenario: state.activeScenario,
        config: state.config,
      });
      history.replaceState(null, '', '#' + hash);
    } catch {
      /* never let URL sync break the app */
    }
  });
}
