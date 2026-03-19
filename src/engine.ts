/**
 * InfraWheel Simulation Engine
 *
 * Pure TypeScript module — no side effects, no UI dependencies.
 * Implements the Flywheel Equation from infrawheel-model.md v2.0.
 *
 * Input:  19 parameters (InfraWheelParams) + config
 * Output: 40-quarter time series (CycleOutput[])
 */

import type {
  InfraWheelParams,
  SimulationConfig,
  CycleOutput,
  NodeOutputs,
  NodeId,
} from './types';

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
  algorithmicEfficiency: 1000,
  transferRatio: 80,
  revenueGrowth: 80,
  grossMargin: 75,
  reinvestRatio: 50,
  fleetDeployment: 2000,
  unitEconomics: 1.5,
} as const;

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

  // Digital AI
  const quarterlyGrowth = Math.pow(1 + digitalAI.revenueGrowth / 100, 0.25) - 1; // YoY → quarterly
  const digitalRevenue = prevDigitalRevenue * (1 + quarterlyGrowth);
  const digitalCashFlow = digitalRevenue * (digitalAI.grossMargin / 100);

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

  // Bottleneck ratio: min(actual/potential) across chain
  const bottleneckEntries: BottleneckEntry[] = [
    {
      node: 'silicon',
      ratio: Math.min(
        silicon.bwMemory / PARAM_MAX.bwMemory,
        silicon.capMemory / PARAM_MAX.capMemory,
        silicon.packaging / PARAM_MAX.packaging,
      ),
    },
    {
      node: 'energy',
      ratio: energy.deliverablePower / PARAM_MAX.deliverablePower,
    },
    {
      node: 'hyperscaleDC',
      ratio: Math.min(
        hyperscaleDC.bisectionBW / PARAM_MAX.bisectionBW,
        hyperscaleDC.utilization / PARAM_MAX.utilization,
      ),
    },
    {
      node: 'spatialCompute',
      ratio: Math.min(
        spatialCompute.deploymentRate / PARAM_MAX.deploymentRate,
        spatialCompute.perNodeTOPS / PARAM_MAX.perNodeTOPS,
      ),
    },
    {
      node: 'intelligence',
      ratio: Math.min(
        intelligence.algorithmicEfficiency / PARAM_MAX.algorithmicEfficiency,
        intelligence.transferRatio / PARAM_MAX.transferRatio,
      ),
    },
  ];

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
    physicalAIActive,
    physicalRevenue,
    physicalCashFlow,
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

  // Dequeue lagged CAPEX if available
  const laggedIdx = cycleIndex - config.capexLagQuarters;
  const effectiveCAPEX = (laggedIdx >= 0 && laggedIdx < capexQueue.length)
    ? (capexQueue[laggedIdx] ?? 0)
    : 0;

  if (effectiveCAPEX <= 0) return;

  const { capexAllocation } = config;
  const siliconCAPEX = effectiveCAPEX * capexAllocation.silicon;
  const energyCAPEX = effectiveCAPEX * capexAllocation.energy;
  const dcCAPEX = effectiveCAPEX * capexAllocation.dc;
  const spatialCAPEX = effectiveCAPEX * capexAllocation.spatial;

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

  // ── Energy: deliverable power grows, modulated by lead time ──
  const leadTimeFactor = 36 / params.energy.leadTime;
  const energyGrowthRate = 0.015 * (energyCAPEX / 5) * leadTimeFactor;
  params.energy.deliverablePower = Math.min(
    PARAM_MAX.deliverablePower,
    params.energy.deliverablePower * (1 + energyGrowthRate),
  );

  // Compute density improves slowly (technology-driven)
  params.energy.computeDensity = Math.min(
    PARAM_MAX.computeDensity,
    params.energy.computeDensity * 1.005, // ~2% annual improvement
  );

  // ── Hyperscale DC: interconnect BW improves with investment ──
  params.hyperscaleDC.bisectionBW = Math.min(
    PARAM_MAX.bisectionBW,
    params.hyperscaleDC.bisectionBW * (1 + 0.01 * (dcCAPEX / 3)),
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

  // ── Intelligence: algorithmic efficiency improves autonomously ──
  params.intelligence.algorithmicEfficiency = Math.min(
    PARAM_MAX.algorithmicEfficiency,
    params.intelligence.algorithmicEfficiency * 1.07, // 분기 7%, 연 ~30% — observed real-world pace
  );
  // Transfer ratio improves with frontier+distillation progress
  params.intelligence.transferRatio = Math.min(
    PARAM_MAX.transferRatio,
    params.intelligence.transferRatio * 1.005,
  );

  // Physical AI fleet grows when active (handled by activation check)
  // Fleet growth is proportional to unit economics
  if (params.physicalAI.unitEconomics > 0.33) {
    const fleetGrowthRate = 0.03 * params.physicalAI.unitEconomics; // better economics → faster growth
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

    // Find bottleneck node
    const bottleneckEntries: BottleneckEntry[] = [
      { node: 'silicon', ratio: Math.min(evolving.silicon.bwMemory / PARAM_MAX.bwMemory, evolving.silicon.packaging / PARAM_MAX.packaging) },
      { node: 'energy', ratio: evolving.energy.deliverablePower / PARAM_MAX.deliverablePower },
      { node: 'hyperscaleDC', ratio: Math.min(evolving.hyperscaleDC.bisectionBW / PARAM_MAX.bisectionBW, evolving.hyperscaleDC.utilization / PARAM_MAX.utilization) },
      { node: 'spatialCompute', ratio: Math.min(evolving.spatialCompute.deploymentRate / PARAM_MAX.deploymentRate, evolving.spatialCompute.perNodeTOPS / PARAM_MAX.perNodeTOPS) },
      { node: 'intelligence', ratio: Math.min(evolving.intelligence.algorithmicEfficiency / PARAM_MAX.algorithmicEfficiency, evolving.intelligence.transferRatio / PARAM_MAX.transferRatio) },
    ];
    const bottleneck = findBottleneck(bottleneckEntries);

    results.push({
      quarter: label,
      nodeOutputs: outputs,
      bottleneckNode: bottleneck.node,
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
