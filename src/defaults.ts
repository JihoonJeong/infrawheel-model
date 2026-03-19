/**
 * InfraWheel Simulator — Default parameters & configuration
 * Base Case 2026: current trend values (tuned by Luca review)
 */

import type { InfraWheelParams, SimulationConfig } from './types';

/** Base Case 2026 parameters */
export const DEFAULT_PARAMS: InfraWheelParams = {
  silicon: {
    bwMemory: 65,         // 3사 HBM 출하 2026 반영
    capMemory: 400,       // 400 TB deployed/Q
    packaging: 80,        // 80K wafers/Q — CoWoS+FOWLP
  },
  energy: {
    deliverablePower: 35, // 35 GW online — 보수적→중간
    leadTime: 36,         // 36 months avg
    computeDensity: 15,   // 15 PFLOPS/MW
  },
  intelligence: {
    algorithmicEfficiency: 150, // 1.5x base
    transferRatio: 40,          // Phi-4, Gemma 등 소형 모델 진전 반영
  },
  capital: {
    reinvestRatio: 33,    // Big 4 현재 30-35% 중간값
    policyCAPEX: 20,      // $20B/year
  },
  hyperscaleDC: {
    bisectionBW: 50,      // 50 Tbps/cluster
    utilization: 40,      // 40% MFU
  },
  digitalAI: {
    revenueGrowth: 35,    // 2025 대비 약간 둔화
    grossMargin: 45,      // 45%
  },
  spatialCompute: {
    deploymentRate: 2,    // 2026은 아직 파일럿 수준
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
  metroBSCount: 500_000,
  hyperscaleAllocRatio: 0.7,
  requiredBW: 100,
  physicalAIOpMargin: 0.25,
  physicalAIUnitCost: 100,
  coveredAreaKm2: 50_000,         // Korea default
  capexAllocation: {
    silicon: 0.50,
    energy: 0.20,
    dc: 0.20,
    spatial: 0.10,
  },
  capexLagQuarters: 4,
  digitalAIInitialRevenue: 25,    // $25B/Q — 글로벌 AI SW 시장 반영
  physicalAITaskThreshold: 50,
  physicalAILatencyThreshold: 10,
};
