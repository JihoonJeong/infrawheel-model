/**
 * InfraWheel Simulator — Type Definitions
 * Based on infrawheel-model.md v2.0 (19 parameters, 8 nodes)
 */

/** 19 input parameters grouped by node */
export interface InfraWheelParams {
  silicon: {
    /** S1: BW memory supply (GB/quarter) — range 20G~120G */
    bwMemory: number;
    /** S2: Capacity memory pool (TB deployed/Q) — range 50~2000 */
    capMemory: number;
    /** S3: Packaging throughput (K wafers/Q) — range 30~200 */
    packaging: number;
  };
  energy: {
    /** E1: Deliverable power (GW online) — range 15~80 */
    deliverablePower: number;
    /** E2: Pipeline lead time (months) — range 12~60 */
    leadTime: number;
    /** E3: Compute density/MW (PFLOPS/MW) — range 5~50 */
    computeDensity: number;
  };
  intelligence: {
    /** I1: Algorithmic efficiency (index, base=100) — range 100~1000 */
    algorithmicEfficiency: number;
    /** I2: Frontier-to-edge transfer ratio (%) — range 10~80 */
    transferRatio: number;
  };
  capital: {
    /** C1: CAPEX reinvestment ratio (%) — range 15~50 */
    reinvestRatio: number;
    /** C2: Policy CAPEX exogenous ($B/year) — range 0~80 */
    policyCAPEX: number;
  };
  hyperscaleDC: {
    /** H1: Cluster bisection BW (Tbps/cluster) — range 10~200 */
    bisectionBW: number;
    /** H2: Cluster utilization rate (%) — range 30~75 */
    utilization: number;
  };
  digitalAI: {
    /** D1: AI revenue growth rate blended (% YoY) — range 15~80 */
    revenueGrowth: number;
    /** D2: AI gross margin (%) — range 20~75 */
    grossMargin: number;
  };
  spatialCompute: {
    /** SC1: AI-RAN deployment rate (% of metro BS) — range 0~60 */
    deploymentRate: number;
    /** SC2: Per-node inference capacity (TOPS/node) — range 50~2000 */
    perNodeTOPS: number;
  };
  physicalAI: {
    /** PA1: Fleet deployment (K units deployed) — range 10~2000 */
    fleetDeployment: number;
    /** PA2: Unit economics ratio (annual rev / unit cost) — range 0.2~1.5 */
    unitEconomics: number;
  };
}

export interface SimulationConfig {
  /** e.g., "2025Q1" */
  startQuarter: string;
  /** e.g., "2035Q4" */
  endQuarter: string;
  /** Simulation resolution */
  cycleUnit: 'quarter' | 'month';
  /** Confidence mechanism sensitivity — range 0.3~1.0 */
  sensitivity: number;
  /** Total metro base station count (country-dependent) */
  metroBSCount: number;
  /** Fraction of silicon allocated to hyperscale vs spatial — range 0~1 */
  hyperscaleAllocRatio: number;
  /** Required interconnect BW for current training workloads (Tbps) */
  requiredBW: number;
  /** Physical AI operating margin (%) */
  physicalAIOpMargin: number;
  /** Unit cost per Physical AI unit ($K) */
  physicalAIUnitCost: number;
  /** Covered area for spatial latency model (km²) — Korea ~50,000, US ~300,000 */
  coveredAreaKm2: number;
  /** CAPEX allocation ratios across subsystems (must sum to ~1.0) */
  capexAllocation: {
    silicon: number;
    energy: number;
    dc: number;
    spatial: number;
  };
  /** CAPEX-to-silicon lag in quarters */
  capexLagQuarters: number;
  /** Digital AI initial revenue ($B/quarter) */
  digitalAIInitialRevenue: number;
  /** Task threshold for Physical AI activation (transfer ratio %) */
  physicalAITaskThreshold: number;
  /** Latency threshold for Physical AI (ms) */
  physicalAILatencyThreshold: number;
}

export type NodeId =
  | 'silicon'
  | 'energy'
  | 'hyperscaleDC'
  | 'spatialCompute'
  | 'intelligence'
  | 'digitalAI'
  | 'physicalAI'
  | 'capital';

export interface NodeOutputs {
  /** Silicon: training-class + inference-class output */
  trainingSilicon: number;
  inferenceSilicon: number;
  /** Energy: usable compute (PFLOPS) */
  usableCompute: number;
  /** Hyperscale DC: effective compute */
  hyperscaleEffective: number;
  /** Spatial Compute: total distributed inference (TOPS) */
  spatialEffective: number;
  /** Intelligence: frontier & edge capability */
  frontierCapability: number;
  edgeCapability: number;
  spatialLatency: number;
  /** Digital AI */
  digitalRevenue: number;
  digitalCashFlow: number;
  /** Physical AI */
  physicalAIActive: boolean;
  physicalRevenue: number;
  physicalCashFlow: number;
  /** Capital */
  bottleneckRatio: number;
  confidence: number;
  effectiveReinvest: number;
  totalCAPEX: number;
}

export interface CycleOutput {
  quarter: string;
  nodeOutputs: NodeOutputs;
  bottleneckNode: NodeId;
  bottleneckRatio: number;
  loopSpeeds: { hyperscale: number; spatial: number };
  totalCAPEX: number;
  totalRevenue: number;
  /** Current effective parameter values (after dynamic growth) */
  effectiveParams: InfraWheelParams;
}
