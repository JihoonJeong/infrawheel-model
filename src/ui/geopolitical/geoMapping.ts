/**
 * Geopolitical Overlay → InfraWheel parameter mapping.
 *
 * Two macro axes + Taiwan crisis event → adjustments to 18 params.
 * Tables from geopolitical-overlay-framework.md §6.
 */

import { DEFAULT_PARAMS } from '../../defaults';
import type { InfraWheelParams } from '../../types';

export type TaiwanCrisis = 'off' | 'islands' | 'quarantine' | 'blockade' | 'invasion';

export interface GeoState {
  /** 0 = global integrated, 50 = bipolar (current), 100 = tripolar */
  blocPct: number;
  /** 0 = scarce, 50 = current, 100 = abundant */
  energyPct: number;
  /** Taiwan crisis stage */
  taiwanCrisis: TaiwanCrisis;
}

export const DEFAULT_GEO: GeoState = {
  blocPct: 50,
  energyPct: 50,
  taiwanCrisis: 'off',
};

// ─── Presets ──────────────────────────────────────────────────

export interface GeoPreset {
  id: string;
  blocPct: number;
  energyPct: number;
  taiwanCrisis: TaiwanCrisis;
}

export const GEO_PRESETS: GeoPreset[] = [
  { id: 'goldenAge',       blocPct: 10,  energyPct: 85, taiwanCrisis: 'off' },
  { id: 'tripolarAbundance', blocPct: 80, energyPct: 80, taiwanCrisis: 'off' },
  { id: 'globalBottleneck', blocPct: 40,  energyPct: 25, taiwanCrisis: 'off' },
  { id: 'tripolarScarcity', blocPct: 85,  energyPct: 20, taiwanCrisis: 'off' },
  { id: 'taiwanBlockade',   blocPct: 50,  energyPct: 50, taiwanCrisis: 'blockade' },
  { id: 'koreaOptimal',     blocPct: 75,  energyPct: 75, taiwanCrisis: 'off' },
];

// ─── Mapping logic ───────────────────────────────────────────

/** Linearly interpolate: at pct=refPct returns 0 adjustment */
function lerp(pct: number, refPct: number, lowAdj: number, highAdj: number): number {
  if (pct <= refPct) {
    return lowAdj * (1 - pct / refPct);
  }
  return highAdj * ((pct - refPct) / (100 - refPct));
}

/**
 * X-axis (bloc): 0%=global, 50%=bipolar(ref), 100%=tripolar.
 * Returns multiplier adjustments per param.
 */
function blocAdjustments(blocPct: number): Partial<Record<string, number>> {
  // DEFAULT_PARAMS represent the current (~50%, bipolar) world, so blocPct=50 is the no-adjust
  // baseline. Moving to 0% *removes* fragmentation → the sign-flip of the 50%-column penalty
  // (integration heals packaging, frees model transfer, expands TAM, cuts sovereign CAPEX).
  // 100% deepens fragmentation. (highAdj kept as previously tuned; only lowAdj filled — P2.)
  return {
    packaging:             lerp(blocPct, 50,  0.15, -0.35),  // 0%: +15% recovery · 100%: -35%
    bwMemory:              lerp(blocPct, 50,  0.05, -0.15),
    policyCAPEX:           lerp(blocPct, 50, -0.30,  0.80),  // 0%: sovereign CAPEX recedes
    reinvestRatio:         lerp(blocPct, 50,  0.05, -0.15),
    algorithmicEfficiency: lerp(blocPct, 50, -0.05,  0.15),  // inverse: integration eases efficiency pressure
    transferRatio:         lerp(blocPct, 50,  0.10, -0.25),  // 0%: models move freely
    deploymentRate:        lerp(blocPct, 50,  0.00,  0.10),  // framework: no 0% effect
    revenueGrowth:         lerp(blocPct, 50,  0.05, -0.15),  // 0%: TAM expands
  };
}

/**
 * Y-axis (energy): 0%=scarce, 50%=current(ref), 100%=abundant.
 */
function energyAdjustments(energyPct: number): Partial<Record<string, number>> {
  return {
    deliverablePower: lerp(energyPct, 50, -0.30, 0.40),
    leadTime:         lerp(energyPct, 50,  0.50, -0.40),  // scarce → +50% (longer)
    computeDensity:   lerp(energyPct, 50, -0.10, 0.20),
    utilization:      lerp(energyPct, 50, -0.05, 0.05),
  };
}

/**
 * Taiwan crisis: immediate shock applied on top of axes.
 */
function taiwanAdjustments(crisis: TaiwanCrisis): Partial<Record<string, number>> {
  switch (crisis) {
    case 'off':
      return {};
    case 'islands':
      return {
        packaging: -0.05,
        reinvestRatio: -0.15,
        policyCAPEX: 0.20,
      };
    case 'quarantine':
      return {
        packaging: -0.30,
        bwMemory: -0.10,
        reinvestRatio: -0.30,
        policyCAPEX: 0.50,
      };
    case 'blockade':
      return {
        packaging: -0.80,
        bwMemory: -0.20,
        reinvestRatio: -0.50,
        policyCAPEX: 1.00,
      };
    case 'invasion':
      return {
        packaging: -0.95,
        bwMemory: -0.30,
        reinvestRatio: -0.70,
        policyCAPEX: 1.50,
      };
  }
}

/** Flatten param key → node + key for applying adjustments */
const PARAM_NODE_MAP: Record<string, { node: keyof InfraWheelParams; key: string }> = {
  bwMemory:              { node: 'silicon', key: 'bwMemory' },
  capMemory:             { node: 'silicon', key: 'capMemory' },
  packaging:             { node: 'silicon', key: 'packaging' },
  deliverablePower:      { node: 'energy', key: 'deliverablePower' },
  leadTime:              { node: 'energy', key: 'leadTime' },
  computeDensity:        { node: 'energy', key: 'computeDensity' },
  bisectionBW:           { node: 'hyperscaleDC', key: 'bisectionBW' },
  utilization:           { node: 'hyperscaleDC', key: 'utilization' },
  deploymentRate:        { node: 'spatialCompute', key: 'deploymentRate' },
  perNodeTOPS:           { node: 'spatialCompute', key: 'perNodeTOPS' },
  algorithmicEfficiency: { node: 'intelligence', key: 'algorithmicEfficiency' },
  transferRatio:         { node: 'intelligence', key: 'transferRatio' },
  revenueGrowth:         { node: 'digitalAI', key: 'revenueGrowth' },
  grossMargin:           { node: 'digitalAI', key: 'grossMargin' },
  fleetDeployment:       { node: 'physicalAI', key: 'fleetDeployment' },
  unitEconomics:         { node: 'physicalAI', key: 'unitEconomics' },
  reinvestRatio:         { node: 'capital', key: 'reinvestRatio' },
  policyCAPEX:           { node: 'capital', key: 'policyCAPEX' },
};

/**
 * Apply geopolitical state to base params → adjusted params.
 * Pure function. Does not mutate inputs.
 */
export function applyGeoOverlay(base: InfraWheelParams, geo: GeoState): InfraWheelParams {
  // Merge all adjustments (additive for same param)
  const combined: Record<string, number> = {};

  for (const [key, adj] of Object.entries(blocAdjustments(geo.blocPct))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }
  for (const [key, adj] of Object.entries(energyAdjustments(geo.energyPct))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }
  for (const [key, adj] of Object.entries(taiwanAdjustments(geo.taiwanCrisis))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }

  // Deep clone base
  const result: InfraWheelParams = {
    silicon: { ...base.silicon },
    energy: { ...base.energy },
    intelligence: { ...base.intelligence },
    capital: { ...base.capital },
    hyperscaleDC: { ...base.hyperscaleDC },
    digitalAI: { ...base.digitalAI },
    spatialCompute: { ...base.spatialCompute },
    physicalAI: { ...base.physicalAI },
  };

  // Apply adjustments as multipliers: newVal = baseVal × (1 + adj)
  for (const [paramKey, adj] of Object.entries(combined)) {
    const mapping = PARAM_NODE_MAP[paramKey];
    if (!mapping) continue;
    const nodeObj = result[mapping.node] as Record<string, number>;
    const baseVal = nodeObj[mapping.key];
    if (baseVal === undefined) continue;
    nodeObj[mapping.key] = Math.max(0, baseVal * (1 + adj));
  }

  return result;
}

/**
 * Get per-parameter adjustment percentages for display.
 */
export function getAdjustmentPcts(geo: GeoState): Record<string, number> {
  const combined: Record<string, number> = {};
  for (const [key, adj] of Object.entries(blocAdjustments(geo.blocPct))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }
  for (const [key, adj] of Object.entries(energyAdjustments(geo.energyPct))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }
  for (const [key, adj] of Object.entries(taiwanAdjustments(geo.taiwanCrisis))) {
    combined[key] = (combined[key] ?? 0) + (adj ?? 0);
  }
  return combined;
}
