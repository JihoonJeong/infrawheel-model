/**
 * InfraWheel direct-parameter scenario presets.
 *
 * Each preset is a *relative override* on DEFAULT_PARAMS (Base Case 2026), so the
 * presets stay valid after the base values are recalibrated for publication.
 * Distinct from geopolitical presets (geoMapping.GEO_PRESETS), which adjust params
 * via the overlay rather than setting them directly.
 *
 * Directions follow simulator-spec.md; threshold-sensitive values were verified against
 * the engine so each scenario visibly exercises its intended dynamic (see notes).
 */

import { DEFAULT_PARAMS } from './defaults';
import type { InfraWheelParams, SimulationConfig } from './types';

export interface Scenario {
  /** matches i18n key `scenario.<id>` */
  id: string;
  /** complete param set (DEFAULT_PARAMS merged with the override) */
  params: InfraWheelParams;
  /** optional config overrides (merged onto DEFAULT_CONFIG when applied) */
  config?: Partial<SimulationConfig>;
}

/** Merge a partial, node-wise override onto DEFAULT_PARAMS. */
type ParamOverride = {
  [N in keyof InfraWheelParams]?: Partial<InfraWheelParams[N]>;
};

function ov(o: ParamOverride): InfraWheelParams {
  return {
    silicon: { ...DEFAULT_PARAMS.silicon, ...o.silicon },
    energy: { ...DEFAULT_PARAMS.energy, ...o.energy },
    intelligence: { ...DEFAULT_PARAMS.intelligence, ...o.intelligence },
    capital: { ...DEFAULT_PARAMS.capital, ...o.capital },
    hyperscaleDC: { ...DEFAULT_PARAMS.hyperscaleDC, ...o.hyperscaleDC },
    digitalAI: { ...DEFAULT_PARAMS.digitalAI, ...o.digitalAI },
    spatialCompute: { ...DEFAULT_PARAMS.spatialCompute, ...o.spatialCompute },
    physicalAI: { ...DEFAULT_PARAMS.physicalAI, ...o.physicalAI },
  };
}

export const BASE_SCENARIO_ID = 'base2026';
/** Sentinel id shown when the user edits params away from any preset. */
export const CUSTOM_SCENARIO_ID = 'custom';

export const SCENARIOS: Scenario[] = [
  { id: 'base2026', params: ov({}) },

  // Energy is the binding constraint: scarce power + long lead time (1C delays the ramp).
  { id: 'energyBottleneck', params: ov({ energy: { deliverablePower: 20, leadTime: 54 } }) },

  // Confidence collapse: low reinvestment + low revenue growth + high sensitivity.
  {
    id: 'aiWinter',
    params: ov({ capital: { reinvestRatio: 18 }, digitalAI: { revenueGrowth: 15 } }),
    config: { sensitivity: 0.9 },
  },

  // Korea leads spatial: high AI-RAN deployment + capable nodes over a dense metro footprint.
  {
    id: 'koreaFirstSpatial',
    params: ov({ spatialCompute: { deploymentRate: 25, perNodeTOPS: 400 } }),
    config: { coveredAreaKm2: 50_000, metroBSCount: 500_000 },
  },

  // Software lever jumps: efficiency + frontier→edge transfer.
  { id: 'algoBreakthrough', params: ov({ intelligence: { algorithmicEfficiency: 400, transferRatio: 60 } }) },

  // Memory wall — note: the serving ceiling (1A) is min(capMemory, packaging); in reality the
  // memory wall is largely advanced-packaging (CoWoS/HBM-integration) limited, so packaging is
  // lowered too. Verified this actually binds the Digital AI serving ceiling.
  { id: 'memoryWall', params: ov({ silicon: { bwMemory: 35, capMemory: 150, packaging: 40 } }) },

  // Physical AI takeoff — dual-key needs latency <= threshold; perNodeTOPS raised to 600 so the
  // spatial-latency key actually trips at deploymentRate 25–35 (verified active).
  {
    id: 'physicalAITakeoff',
    params: ov({
      physicalAI: { unitEconomics: 0.9 },
      spatialCompute: { deploymentRate: 35, perNodeTOPS: 600 },
      intelligence: { transferRatio: 60 },
    }),
  },

  // Sovereign capital floods in: large exogenous policy CAPEX.
  { id: 'policyBoostKorea', params: ov({ capital: { policyCAPEX: 70 } }) },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);
