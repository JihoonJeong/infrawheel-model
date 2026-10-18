/**
 * InfraWheel Simulator — Type Definitions
 * Based on infrawheel-model.md v2.2 (20 parameters, 8 nodes)
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
    /** C1: CAPEX reinvestment ratio (% of operating cash flow) — range 15~100 */
    reinvestRatio: number;
    /** C2: Policy CAPEX exogenous ($B/year) — range 0~80 */
    policyCAPEX: number;
    /** C3 (v2.1): Blended cost of capital for AI infrastructure (% / year) — range 3~14.
     *  Rates + credit spread on the debt that finances DCs/GPUs (hyperscaler IG ↔ neocloud HY). */
    costOfCapital: number;
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
    /** D3 (v2.1): Demand elasticity to the price of intelligence — range 0.3~2.0.
     *  1.0 = unit-elastic (efficiency gains neither add nor remove revenue; the v2.0 assumption).
     *  >1 = Jevons rebound (cheaper answers → disproportionately more use).
     *  <1 = "60x cheaper, 10x more use → 1/6 revenue" (price collapse outruns usage). */
    demandElasticity: number;
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
  /** Digital AI revenue ceiling per effective-inference unit ($B/unit) — serving-capacity cap (⑤) */
  digitalRevenuePerInferenceUnit: number;
  /** Margin uplift (pp) per algo-efficiency index point above the Base Case anchor (F channel) */
  marginAlgoCoeff: number;
  /** v2.2: Neutral blended cost of capital (%) — the rate at which funding is not a constraint */
  neutralCostOfCapital: number;
  /** v2.1: Elasticity of reinvestment to cost of capital — factor = (neutral C3 / C3)^k */
  capitalCostElasticity: number;
  /** v2.2: Elasticity of the capital-node bottleneck ratio (debt affordability) to C3 */
  capitalBottleneckElasticity: number;
  /** v2.2: CAPEX share of operating cash flow fundable internally (%); above it, external capital is needed */
  selfFundingCap: number;
  /** v2.2: Half-life (quarters) for C3 to revert toward neutral; 0 = rates stay where set */
  capitalStressHalfLifeQ: number;
  /** v2.2: Operator AI-RAN rollout roadmap — [years from start, required % of metro BS] (spatial requirement) */
  spatialRolloutPath: ReadonlyArray<readonly [number, number]>;
  /** v2.1: Share of each quarter's AI output that is kept (stored, indexed, reused) */
  dataRetention: number;
  /** v2.1: Quarterly decay of the accumulated data stock (deletion / obsolescence) */
  dataDecayQ: number;
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
  /** Algo-adjusted gross margin actually applied to cash flow (F channel) */
  effectiveMargin: number;
  /** Physical AI */
  physicalAIActive: boolean;
  physicalRevenue: number;
  physicalCashFlow: number;
  /** Capital */
  bottleneckNode: NodeId;
  bottleneckRatio: number;
  confidence: number;
  /** v2.1: reinvestment multiplier from cost of capital (1 at Base C3) */
  capitalCostFactor: number;
  effectiveReinvest: number;
  totalCAPEX: number;
  /** v2.1: Volume of intelligence served (index, ≈1 at 2025Q1 base). Revenue ÷ unit price. */
  intelligenceVolume: number;
  /** v2.1: Accumulated AI output kept for reuse (index). Coal turns to ash; intelligence accumulates. */
  dataStock: number;
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
