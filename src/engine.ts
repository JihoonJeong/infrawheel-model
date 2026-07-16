/**
 * InfraWheel Simulation Engine
 *
 * Pure TypeScript module — no side effects, no UI dependencies.
 * Implements the Flywheel Equation from infrawheel-model.md v2.0.
 *
 * Input:  18 parameters (InfraWheelParams) + config
 * Output: 40-quarter time series (CycleOutput[])
 */

import type {
  InfraWheelParams,
  SimulationConfig,
  CycleOutput,
  NodeOutputs,
  NodeId,
} from './types';
import { DEFAULT_PARAMS } from './defaults';

/** Base Case algo-efficiency index (I1/100) — anchor so the F margin channel is zero-offset at base. */
const BASE_ALGO_INDEX = DEFAULT_PARAMS.intelligence.algorithmicEfficiency / 100;

/**
 * Base Case compute density (E3) — anchor for the energy bottleneck ratio.
 * Normalising usable-compute (power × density) against (PARAM_MAX.power × BASE density)
 * makes the base-case energy ratio identical to the old power-only formula, while letting
 * compute density become a live *upward* lever: better perf/watt relieves the power ceiling.
 */
const BASE_COMPUTE_DENSITY = DEFAULT_PARAMS.energy.computeDensity;

// ─── Quarter helpers ───────────────────────────────────────────

/** Parse "2025Q1" → { year: 2025, q: 1 } */
function parseQuarter(s: string): { year: number; q: number } {
  const m = s.match(/^(\d{4})Q([1-4])$/);
  if (!m) throw new Error(`Invalid quarter format: ${s}`);
  return { year: Number(m[1]), q: Number(m[2]) };
}

/** Advance a quarter by n steps */
function advanceQuarter(year: number, q: number, n: number): { year: number; q: number } {
  const total = (year * 4 + (q - 1)) + n;
  return { year: Math.floor(total / 4), q: (total % 4) + 1 };
}

function quarterLabel(year: number, q: number): string {
  return `${year}Q${q}`;
}

/** Count quarters between start (inclusive) and end (inclusive) */
function quarterCount(start: string, end: string): number {
  const s = parseQuarter(start);
  const e = parseQuarter(end);
  return (e.year * 4 + e.q) - (s.year * 4 + s.q) + 1;
}

// ─── Spatial latency model ────────────────────────────────────

/**
 * Derived latency from node density and per-node TOPS.
 * Uses sqrt-based model: initial coverage improvements yield larger latency gains.
 * Accounts for metroBSCount and coveredArea so Korea vs US differences are expressed.
 *
 *   density = (deployPct/100 * metroBSCount) / coveredAreaKm2  (nodes/km²)
 *   latency = baseLatency / (1 + 2 * sqrt(density) * capacityFactor)
 */
function computeSpatialLatency(
  deployPct: number,
  perNodeTOPS: number,
  metroBSCount: number,
  coveredAreaKm2: number,
): number {
  if (deployPct <= 0) return 999;
  const nodesDeployed = (deployPct / 100) * metroBSCount;
  const density = nodesDeployed / coveredAreaKm2; // nodes per km²
  const capacityFactor = perNodeTOPS / 500;
  const baseLatency = 50; // fallback cloud latency (ms)
  const latency = baseLatency / (1 + 2 * Math.sqrt(density) * capacityFactor);
  return Math.max(1, latency);
}

// ─── Bottleneck detection ─────────────────────────────────────

interface BottleneckEntry {
  node: NodeId;
  ratio: number;
}

function findBottleneck(entries: BottleneckEntry[]): { node: NodeId; ratio: number } {
  let worst: BottleneckEntry = entries[0]!;
  for (const e of entries) {
    if (e.ratio < worst.ratio) worst = e;
  }
  return worst;
}

// ─── Parameter ranges for normalization (potential output) ────

const PARAM_MAX = {
  bwMemory: 120,
  capMemory: 2000,
  packaging: 200,
  deliverablePower: 80,
  computeDensity: 50,
  bisectionBW: 200,
  utilization: 75,
  deploymentRate: 60,
  perNodeTOPS: 2000,
  algorithmicEfficiency: 2000,
  transferRatio: 80,
  revenueGrowth: 80,
  grossMargin: 75,   // realistic cap (mature SaaS ~80%, AI carries inference cost). Do NOT raise to
                     // chase algoBreakthrough endpoint divergence — see the F note in simulateCycle.
  reinvestRatio: 50,
  fleetDeployment: 2000,
  unitEconomics: 1.5,
} as const;

// ─── Bottleneck entries (8 nodes — single source of truth) ────

/**
 * Per-node actual/potential ratios across all 8 nodes.
 * The 3 new nodes (digitalAI/physicalAI/capital) use *efficiency* params, not scale,
 * so a small initial scale (e.g. fleet 50/2000) isn't read as a permanent bottleneck.
 */
function computeBottleneckEntries(p: InfraWheelParams, digitalServingRatio = 1): BottleneckEntry[] {
  return [
    { node: 'silicon', ratio: Math.min(
        p.silicon.bwMemory / PARAM_MAX.bwMemory,
        p.silicon.capMemory / PARAM_MAX.capMemory,
        p.silicon.packaging / PARAM_MAX.packaging) },
    // Energy supplies *usable compute* (power × density), so both levers relieve the ceiling.
    // Normalised so base = old power-only value; raising density can push it up to 1 (no longer binding).
    { node: 'energy', ratio: Math.min(1,
        (p.energy.deliverablePower * p.energy.computeDensity) /
        (PARAM_MAX.deliverablePower * BASE_COMPUTE_DENSITY)) },
    { node: 'hyperscaleDC', ratio: Math.min(
        p.hyperscaleDC.bisectionBW / PARAM_MAX.bisectionBW,
        p.hyperscaleDC.utilization / PARAM_MAX.utilization) },
    { node: 'spatialCompute', ratio: Math.min(
        p.spatialCompute.deploymentRate / PARAM_MAX.deploymentRate,
        p.spatialCompute.perNodeTOPS / PARAM_MAX.perNodeTOPS) },
    { node: 'intelligence', ratio: Math.min(
        p.intelligence.algorithmicEfficiency / PARAM_MAX.algorithmicEfficiency,
        p.intelligence.transferRatio / PARAM_MAX.transferRatio) },
    // ── new 3 nodes: efficiency-based ──
    { node: 'digitalAI', ratio: Math.min(
        p.digitalAI.grossMargin / PARAM_MAX.grossMargin,
        digitalServingRatio) },                                       // 마진 건강성 + 서빙 제약(1A)
    { node: 'physicalAI', ratio: p.physicalAI.unitEconomics / PARAM_MAX.unitEconomics }, // 페이백 건강성
    { node: 'capital', ratio: p.capital.reinvestRatio / PARAM_MAX.reinvestRatio },       // 재투자 의지
  ];
}

// ─── Deep clone utility ───────────────────────────────────────

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

// ─── Core simulation ──────────────────────────────────────────

/**
 * Run one simulation cycle (quarter) and return outputs.
 * Pure function: takes current params + state, returns outputs.
 */
function simulateCycle(
  params: InfraWheelParams,
  config: SimulationConfig,
  prevDigitalRevenue: number,
): NodeOutputs {
  const { silicon, energy, intelligence, capital, hyperscaleDC, digitalAI, spatialCompute, physicalAI } = params;

  // ── 1. Silicon output ──
  // Training-class: min(BW memory, Packaging) × hyperscale allocation
  const trainingSilicon =
    Math.min(silicon.bwMemory, silicon.packaging) * config.hyperscaleAllocRatio;

  // Inference-class: min(Capacity memory, Packaging) × (hyperscale + spatial allocation)
  const inferenceSilicon =
    Math.min(silicon.capMemory, silicon.packaging); // full allocation (both loops)

  // ── 2. Energy constraint ──
  // Usable compute = Deliverable power × Compute density
  const usableCompute = energy.deliverablePower * energy.computeDensity; // PFLOPS

  // Split usable compute between hyperscale and spatial
  const usableComputeH = usableCompute * config.hyperscaleAllocRatio;

  // ── 3. Infrastructure conversion ──

  // Hyperscale DC: effective compute
  // = min(Usable_Compute_H, Training_Silicon) × min(1, H1_BW/required_BW) × H2_Util
  const interconnectFactor = Math.min(1, hyperscaleDC.bisectionBW / config.requiredBW);
  const hyperscaleEffective =
    Math.min(usableComputeH, trainingSilicon) *
    interconnectFactor *
    (hyperscaleDC.utilization / 100);

  // Spatial Compute: total distributed inference
  // = Deployment rate(%) × Metro BS count × Per-node TOPS
  const spatialEffective =
    (spatialCompute.deploymentRate / 100) *
    config.metroBSCount *
    spatialCompute.perNodeTOPS;

  // ── 4. Intelligence ──

  // Frontier capability = Hyperscale effective × Algorithmic efficiency (normalized)
  const frontierCapability = hyperscaleEffective * (intelligence.algorithmicEfficiency / 100);

  // Edge capability = Frontier × Transfer ratio
  const edgeCapability = frontierCapability * (intelligence.transferRatio / 100);

  // Spatial latency (derived)
  const spatialLatency = computeSpatialLatency(
    spatialCompute.deploymentRate,
    spatialCompute.perNodeTOPS,
    config.metroBSCount,
    config.coveredAreaKm2,
  );

  // ── 5. Applications ──

  // Digital AI — growth capped by *effective inference capacity* (⑤): the inference-side
  // twin of hyperscaleEffective. Folds in power×density (usableComputeH), memory/packaging
  // (inferenceSilicon), cluster utilization (H2) and algorithmic efficiency (I1) — so energy
  // and algo scenarios bind revenue, not just silicon.
  const quarterlyGrowth = Math.pow(1 + digitalAI.revenueGrowth / 100, 0.25) - 1; // YoY → quarterly
  const growthRevenue = prevDigitalRevenue * (1 + quarterlyGrowth);
  const inferenceEffective =
    Math.min(usableComputeH, inferenceSilicon) *
    (hyperscaleDC.utilization / 100) *
    (intelligence.algorithmicEfficiency / 100);
  const digitalRevenueCeiling = inferenceEffective * config.digitalRevenuePerInferenceUnit;
  const digitalRevenue = Math.min(growthRevenue, digitalRevenueCeiling);
  // F: algorithmic efficiency flows to the *cost* side (margin), not demand — ⑤'s min() can only
  // cap revenue, never lift it. Anchored to the Base Case algo index so base margin is unchanged.
  //
  // ⚠️ INTENDED BEHAVIOUR — endpoint convergence is by design, NOT a bug. Algorithmic advantage
  // diffuses (MoE / quantization / speculative decoding replicate within months — cf. DeepSeek), so
  // a breakthrough PULLS FORWARD margin expansion but the market catches up; both base and the
  // scenario saturate the 75% margin clamp late, so the endpoint gap → ~0. Supply constraints
  // (memory / energy / packaging) are physical and stay binding — that durable-vs-transient
  // asymmetry is the teaching point. Do NOT "fix" the convergence by raising PARAM_MAX.grossMargin
  // (>75% AI-services GM is unrealistic) or slowing algoEff growth (distorts the real trajectory).
  // The lead is surfaced as the "quarters earlier to 75% margin vs Base" indicator (store.marginLeadVsBase).
  const effectiveMargin = Math.max(20, Math.min(75,
    digitalAI.grossMargin +
    config.marginAlgoCoeff * (intelligence.algorithmicEfficiency / 100 - BASE_ALGO_INDEX),
  ));
  const digitalCashFlow = digitalRevenue * (effectiveMargin / 100);
  // 서빙 제약도(0~1): 1 미만이면 공급(전력·메모리·가동률·효율)이 매출을 깎았다는 뜻 → 1B digitalAI 병목에 반영
  const digitalServingRatio = growthRevenue > 0 ? Math.min(1, digitalRevenueCeiling / growthRevenue) : 1;

  // Physical AI — dual-key activation
  const key1 = intelligence.transferRatio >= config.physicalAITaskThreshold;
  const key2 = spatialLatency <= config.physicalAILatencyThreshold;
  const physicalAIActive = key1 && key2;

  let physicalRevenue = 0;
  let physicalCashFlow = 0;
  if (physicalAIActive) {
    // Revenue = Fleet × (Unit economics ratio × Unit cost) → annual, convert to quarterly
    physicalRevenue =
      physicalAI.fleetDeployment * // K units
      (physicalAI.unitEconomics * config.physicalAIUnitCost) / // annual rev per unit ($K)
      4; // quarterly
    // Cash flow = Revenue × Operating margin
    physicalCashFlow = physicalRevenue * config.physicalAIOpMargin;
  }

  // ── 6. Capital (with confidence feedback) ──

  // Bottleneck ratio: min(actual/potential) across all 8 nodes (single source of truth)
  const bottleneckEntries = computeBottleneckEntries(params, digitalServingRatio);
  const bottleneck = findBottleneck(bottleneckEntries);
  const bottleneckRatio = Math.max(0.01, Math.min(1, bottleneck.ratio));

  // Confidence-adjusted reinvestment
  const confidence = Math.pow(bottleneckRatio, config.sensitivity);
  const effectiveReinvest = (capital.reinvestRatio / 100) * confidence;

  // Total CAPEX
  const totalCashFlow = digitalCashFlow + physicalCashFlow;
  const policyCAPEXQuarterly = capital.policyCAPEX / 4; // annual → quarterly
  const totalCAPEX = totalCashFlow * effectiveReinvest + policyCAPEXQuarterly;

  return {
    trainingSilicon,
    inferenceSilicon,
    usableCompute,
    hyperscaleEffective,
    spatialEffective,
    frontierCapability,
    edgeCapability,
    spatialLatency,
    digitalRevenue,
    digitalCashFlow,
    effectiveMargin,
    physicalAIActive,
    physicalRevenue,
    physicalCashFlow,
    bottleneckNode: bottleneck.node,
    bottleneckRatio,
    confidence,
    effectiveReinvest,
    totalCAPEX,
  };
}

/**
 * Apply CAPEX feedback: grow parameters based on reinvested capital.
 * Models the CAPEX → Silicon lag and parameter evolution.
 */
function applyCapexFeedback(
  params: InfraWheelParams,
  capexQueue: number[],
  currentCAPEX: number,
  config: SimulationConfig,
  cycleIndex: number,
): void {
  // Enqueue current CAPEX
  capexQueue.push(currentCAPEX);

  // Dequeue CAPEX from `lagQ` quarters ago (per-subsystem lag)
  const dequeue = (lagQ: number) =>
    cycleIndex - lagQ >= 0 ? (capexQueue[cycleIndex - lagQ] ?? 0) : 0;

  const { capexAllocation } = config;

  // Silicon / DC / spatial: standard build lag
  const baseCAPEX = dequeue(config.capexLagQuarters);
  const siliconCAPEX = baseCAPEX * capexAllocation.silicon;
  const dcCAPEX = baseCAPEX * capexAllocation.dc;
  const spatialCAPEX = baseCAPEX * capexAllocation.spatial;

  // Energy: comes online on its own E2 lead-time clock (months → quarters) — 1C
  const energyLagQ = Math.max(1, Math.round(params.energy.leadTime / 3));
  const energyCAPEX = dequeue(energyLagQ) * capexAllocation.energy;

  // Nothing has landed yet → no feedback this cycle
  if (baseCAPEX <= 0 && energyCAPEX <= 0) return;

  // ── Silicon: grow proportionally with differentiated rates ──
  const siliconGrowthRate = 0.02 * (siliconCAPEX / 5); // 2% growth per $5B invested
  params.silicon.bwMemory = Math.min(
    PARAM_MAX.bwMemory,
    params.silicon.bwMemory * (1 + siliconGrowthRate * 1.0),   // BW memory: baseline
  );
  params.silicon.capMemory = Math.min(
    PARAM_MAX.capMemory,
    params.silicon.capMemory * (1 + siliconGrowthRate * 1.5),   // Capacity: heterogeneous pool, grows faster
  );
  params.silicon.packaging = Math.min(
    PARAM_MAX.packaging,
    params.silicon.packaging * (1 + siliconGrowthRate * 0.5),   // Packaging: duopoly + physical build, slow
  );

  // ── Energy: deliverable power grows; lead time governs *timing* (dequeue lag), not rate — 1C ──
  const energyGrowthRate = 0.015 * (energyCAPEX / 5);
  params.energy.deliverablePower = Math.min(
    PARAM_MAX.deliverablePower,
    params.energy.deliverablePower * (1 + energyGrowthRate),
  );

  // Compute density improves slowly (technology-driven)
  params.energy.computeDensity = Math.min(
    PARAM_MAX.computeDensity,
    params.energy.computeDensity * 1.005, // ~2% annual improvement
  );

  // ── Hyperscale DC: interconnect BW improves slowly (organic optical-transceiver gains) ──
  // Interconnect upgrades are discrete, reader-driven tech events (CPO/photonic — Ch4 lever), not a
  // smooth function of generic CAPEX. The old (1 + 0.01·dcCAPEX/3) growth pushed bisectionBW past
  // requiredBW within ~5yr regardless of its start, so at the 2035 endpoint every setting saturated to
  // interconnect = 1 and the reader's "Bisection 대역폭" slider had no visible effect (Ch4 exercise
  // step 1 was inert). A slow organic rate keeps the reader's chosen bandwidth the endpoint driver.
  params.hyperscaleDC.bisectionBW = Math.min(
    PARAM_MAX.bisectionBW,
    params.hyperscaleDC.bisectionBW * 1.003,
  );
  // Utilization improves slowly (SW optimization)
  params.hyperscaleDC.utilization = Math.min(
    PARAM_MAX.utilization,
    params.hyperscaleDC.utilization * 1.003,
  );

  // ── Spatial compute: deployment rate grows with investment ──
  params.spatialCompute.deploymentRate = Math.min(
    PARAM_MAX.deploymentRate,
    params.spatialCompute.deploymentRate * (1 + 0.02 * (spatialCAPEX / 3)),
  );
  params.spatialCompute.perNodeTOPS = Math.min(
    PARAM_MAX.perNodeTOPS,
    params.spatialCompute.perNodeTOPS * 1.008, // ~3% annual improvement
  );

  // ── Intelligence: algorithmic efficiency — diminishing returns as it approaches ceiling ──
  const effDiminishing = 1 - (params.intelligence.algorithmicEfficiency / PARAM_MAX.algorithmicEfficiency) * 0.5;
  params.intelligence.algorithmicEfficiency = Math.min(
    PARAM_MAX.algorithmicEfficiency,
    params.intelligence.algorithmicEfficiency * (1 + 0.07 * effDiminishing),
  );

  // Transfer ratio — same diminishing pattern
  const trDiminishing = 1 - (params.intelligence.transferRatio / PARAM_MAX.transferRatio) * 0.5;
  params.intelligence.transferRatio = Math.min(
    PARAM_MAX.transferRatio,
    params.intelligence.transferRatio * (1 + 0.005 * trDiminishing),
  );

  // ── Physical AI fleet growth — the two payback thresholds (PA2, Ch8) ──
  // > 0.33 (payback < 3yr): fast expansion.  > 1.0 (payback < 1yr): *explosive* deployment.
  // The 1.0 line is a step-function on the growth rate, not a smooth ramp — Ch8 exercise step 1
  // ("1.0을 넘으면 폭발적 배포가 시작된다") reads the kink as fleet growth visibly accelerating.
  const ue = params.physicalAI.unitEconomics;
  if (ue > 0.33) {
    const explosive = ue > 1.0 ? 2.0 : 1.0; // payback < 1yr → deployment goes explosive
    const fleetGrowthRate = 0.03 * ue * explosive; // better economics → faster growth
    params.physicalAI.fleetDeployment = Math.min(
      PARAM_MAX.fleetDeployment,
      params.physicalAI.fleetDeployment * (1 + fleetGrowthRate),
    );
  }
}

// ─── Main simulate() function ─────────────────────────────────

/**
 * Run the full InfraWheel simulation.
 *
 * @param params  - 19 input parameters
 * @param config  - Simulation configuration
 * @returns Array of CycleOutput, one per quarter
 */
export function simulate(
  params: InfraWheelParams,
  config: SimulationConfig,
): CycleOutput[] {
  const numCycles = quarterCount(config.startQuarter, config.endQuarter);
  const results: CycleOutput[] = [];
  const capexQueue: number[] = [];

  // Evolving parameters (mutated each cycle by feedback)
  const evolving = cloneParams(params);

  // Track digital revenue across cycles
  let prevDigitalRevenue = config.digitalAIInitialRevenue;

  const start = parseQuarter(config.startQuarter);

  for (let i = 0; i < numCycles; i++) {
    const { year, q } = advanceQuarter(start.year, start.q, i);
    const label = quarterLabel(year, q);

    // Run one cycle
    const outputs = simulateCycle(evolving, config, prevDigitalRevenue);

    // Compute loop speeds (relative throughput indicators)
    const hyperscaleSpeed = outputs.hyperscaleEffective * (evolving.intelligence.algorithmicEfficiency / 100);
    const spatialSpeed = outputs.spatialEffective * (evolving.intelligence.transferRatio / 100);

    results.push({
      quarter: label,
      nodeOutputs: outputs,
      bottleneckNode: outputs.bottleneckNode,
      bottleneckRatio: outputs.bottleneckRatio,
      loopSpeeds: {
        hyperscale: hyperscaleSpeed,
        spatial: spatialSpeed,
      },
      totalCAPEX: outputs.totalCAPEX,
      totalRevenue: outputs.digitalRevenue + outputs.physicalRevenue,
      effectiveParams: cloneParams(evolving),
    });

    // Update state for next cycle
    prevDigitalRevenue = outputs.digitalRevenue;

    // Apply CAPEX feedback (mutates evolving params)
    applyCapexFeedback(evolving, capexQueue, outputs.totalCAPEX, config, i);
  }

  return results;
}

// ─── Utility exports ──────────────────────────────────────────

export { parseQuarter, advanceQuarter, quarterLabel, quarterCount, computeSpatialLatency };
