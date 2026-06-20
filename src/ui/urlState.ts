/**
 * URL-hash (de)serialization for shareable simulator state.
 *
 * Encoding: compact JSON (short keys, floats rounded to 2 dp) under encodeURIComponent.
 * Decoding is defensive — unknown, malformed, or legacy hashes silently fall back to
 * defaults (per-field), so a broken link never throws.
 */

import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import { DEFAULT_GEO } from './geopolitical/geoMapping';
import type { InfraWheelParams, SimulationConfig } from '../types';
import type { GeoState, TaiwanCrisis } from './geopolitical/geoMapping';
import type { MetricKey, SimTab } from './store';

export interface SerializableState {
  params: InfraWheelParams;
  geoState: GeoState;
  activeTab: SimTab;
  selectedMetrics: MetricKey[];
  activeScenario: string;
  config: SimulationConfig;
}

/** Mutable config keys worth sharing; the rest are fixed constants. */
const CONFIG_KEYS = ['sensitivity', 'hyperscaleAllocRatio', 'metroBSCount', 'coveredAreaKm2'] as const;

const TAIWAN_STAGES: readonly TaiwanCrisis[] = ['off', 'islands', 'quarantine', 'blockade', 'invasion'];

const round2 = (n: number) => Math.round(n * 100) / 100;

function roundParams(p: InfraWheelParams): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const node of Object.keys(p) as (keyof InfraWheelParams)[]) {
    const group = p[node] as Record<string, number>;
    out[node] = {};
    for (const k of Object.keys(group)) out[node]![k] = round2(group[k]!);
  }
  return out;
}

export function encodeState(s: SerializableState): string {
  const c: Record<string, number> = {};
  for (const k of CONFIG_KEYS) c[k] = round2(s.config[k]);
  const obj = {
    p: roundParams(s.params),
    g: { b: round2(s.geoState.blocPct), e: round2(s.geoState.energyPct), t: s.geoState.taiwanCrisis },
    t: s.activeTab,
    m: s.selectedMetrics,
    s: s.activeScenario,
    c,
  };
  return encodeURIComponent(JSON.stringify(obj));
}

/** Merge a decoded param object onto DEFAULT_PARAMS, keeping only finite numbers. */
function mergeParams(over: unknown): InfraWheelParams {
  const o = (over ?? {}) as Record<string, Record<string, unknown>>;
  const result: Record<string, Record<string, number>> = {};
  for (const node of Object.keys(DEFAULT_PARAMS) as (keyof InfraWheelParams)[]) {
    const base = DEFAULT_PARAMS[node] as Record<string, number>;
    const incoming = (o[node] ?? {}) as Record<string, unknown>;
    result[node] = {};
    for (const k of Object.keys(base)) {
      const v = incoming[k];
      result[node]![k] = typeof v === 'number' && Number.isFinite(v) ? v : base[k]!;
    }
  }
  return result as unknown as InfraWheelParams;
}

export function decodeState(hash: string): Partial<SerializableState> {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!raw) return {};
    const obj = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const out: Partial<SerializableState> = {};

    if (obj.p) out.params = mergeParams(obj.p);

    if (obj.g && typeof obj.g === 'object') {
      const g = obj.g as Record<string, unknown>;
      out.geoState = {
        blocPct: clampNum(g.b, DEFAULT_GEO.blocPct, 0, 100),
        energyPct: clampNum(g.e, DEFAULT_GEO.energyPct, 0, 100),
        taiwanCrisis: isTaiwan(g.t) ? g.t : DEFAULT_GEO.taiwanCrisis,
      };
    }

    if (obj.t === 'infrawheel' || obj.t === 'geopolitical') out.activeTab = obj.t;

    if (Array.isArray(obj.m)) {
      const metrics = obj.m.filter((x): x is MetricKey => typeof x === 'string');
      if (metrics.length) out.selectedMetrics = metrics;
    }

    if (typeof obj.s === 'string') out.activeScenario = obj.s;

    if (obj.c && typeof obj.c === 'object') {
      const incoming = obj.c as Record<string, unknown>;
      const c: Partial<SimulationConfig> = {};
      for (const k of CONFIG_KEYS) {
        const v = incoming[k];
        if (typeof v === 'number' && Number.isFinite(v)) c[k] = v;
      }
      out.config = { ...DEFAULT_CONFIG, ...c };
    }

    return out;
  } catch {
    return {};
  }
}

function clampNum(v: unknown, fallback: number, lo: number, hi: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;
}

function isTaiwan(v: unknown): v is TaiwanCrisis {
  return typeof v === 'string' && (TAIWAN_STAGES as readonly string[]).includes(v);
}
