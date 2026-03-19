/**
 * InfraWheel Simulator — Default parameters & configuration
 * Base Case 2026: current trend values
 */

import type { InfraWheelParams, SimulationConfig } from './types';

/** Base Case 2026 parameters — mid-range estimates for each parameter */
export const DEFAULT_PARAMS: InfraWheelParams = {
  silicon: {
    bwMemory: 50,         // 50 GB/Q — current HBM supply ~mid range
    capMemory: 400,       // 400 TB deployed/Q
    packaging: 80,        // 80K wafers/Q — CoWoS+FOWLP
  },
  energy: {
    deliverablePower: 30, // 30 GW online for AI DC
    leadTime: 36,         // 36 months avg
    computeDensity: 15,   // 15 PFLOPS/MW
  },
  intelligence: {
    algorithmicEfficiency: 150, // 1.5x base
    transferRatio: 35,          // 35% frontier→edge retention
  },
  capital: {
    reinvestRatio: 30,    // 30% of cash flow
    policyCAPEX: 20,      // $20B/year
  },
  hyperscaleDC: {
    bisectionBW: 50,      // 50 Tbps/cluster
    utilization: 40,      // 40% MFU
  },
  digitalAI: {
    revenueGrowth: 40,    // 40% YoY
    grossMargin: 45,      // 45%
  },
  spatialCompute: {
    deploymentRate: 5,    // 5% of metro BS
    perNodeTOPS: 200,     // 200 TOPS/node
  },
  physicalAI: {
    fleetDeployment: 50,  // 50K units
    unitEconomics: 0.3,   // payback ~3.3yr
  },
};

export const DEFAULT_CONFIG: SimulationConfig = {
  startQuarter: '2025Q1',
  endQuarter: '2035Q4',
  cycleUnit: 'quarter',
  sensitivity: 0.5,
  metroBSCount: 500_000,          // global metro BS estimate
  hyperscaleAllocRatio: 0.7,      // 70% to hyperscale, 30% to spatial
  requiredBW: 100,                // 100 Tbps required for current training
  physicalAIOpMargin: 0.25,       // 25% operating margin
  physicalAIUnitCost: 100,        // $100K per unit
  siliconCAPEXShare: 0.4,         // 40% of CAPEX goes to silicon
  capexLagQuarters: 4,            // ~12 months lag
  digitalAIInitialRevenue: 20,    // $20B/quarter initial
  physicalAITaskThreshold: 50,    // 50% transfer ratio needed
  physicalAILatencyThreshold: 10, // 10ms
};
