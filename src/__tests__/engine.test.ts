import { describe, it, expect } from 'vitest';
import { simulate, parseQuarter, advanceQuarter, quarterCount, computeSpatialLatency } from '../engine';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import type { InfraWheelParams } from '../types';

/** Helper: get first result (asserted non-null) */
function first<T>(arr: T[]): T { return arr[0]!; }
/** Helper: get last result (asserted non-null) */
function last<T>(arr: T[]): T { return arr[arr.length - 1]!; }

// ─── Quarter helpers ──────────────────────────────────────────

describe('Quarter helpers', () => {
  it('parses valid quarter strings', () => {
    expect(parseQuarter('2025Q1')).toEqual({ year: 2025, q: 1 });
    expect(parseQuarter('2035Q4')).toEqual({ year: 2035, q: 4 });
  });

  it('throws on invalid quarter format', () => {
    expect(() => parseQuarter('2025-Q1')).toThrow();
    expect(() => parseQuarter('2025Q5')).toThrow();
  });

  it('advances quarters correctly', () => {
    expect(advanceQuarter(2025, 1, 0)).toEqual({ year: 2025, q: 1 });
    expect(advanceQuarter(2025, 1, 1)).toEqual({ year: 2025, q: 2 });
    expect(advanceQuarter(2025, 4, 1)).toEqual({ year: 2026, q: 1 });
    expect(advanceQuarter(2025, 1, 4)).toEqual({ year: 2026, q: 1 });
  });

  it('counts quarters correctly', () => {
    expect(quarterCount('2025Q1', '2025Q4')).toBe(4);
    expect(quarterCount('2025Q1', '2035Q4')).toBe(44);
    expect(quarterCount('2025Q1', '2025Q1')).toBe(1);
  });
});

// ─── Spatial latency ──────────────────────────────────────────

// Korea: 500K BS, 50K km²  |  US: 400K BS, 300K km²
const KOREA_BS = 500_000;
const KOREA_AREA = 50_000;
const US_BS = 400_000;
const US_AREA = 300_000;

describe('Spatial latency model', () => {
  it('returns high latency when deployment is low', () => {
    expect(computeSpatialLatency(1, 100, KOREA_BS, KOREA_AREA)).toBeGreaterThan(20);
  });

  it('returns low latency when deployment and TOPS are high', () => {
    expect(computeSpatialLatency(60, 2000, KOREA_BS, KOREA_AREA)).toBeLessThan(5);
  });

  it('returns 999 when deployment is zero', () => {
    expect(computeSpatialLatency(0, 500, KOREA_BS, KOREA_AREA)).toBe(999);
  });

  it('Korea has lower latency than US at same deployPct (higher density)', () => {
    const deployPct = 20;
    const tops = 500;
    const koreaLatency = computeSpatialLatency(deployPct, tops, KOREA_BS, KOREA_AREA);
    const usLatency = computeSpatialLatency(deployPct, tops, US_BS, US_AREA);
    expect(koreaLatency).toBeLessThan(usLatency);
  });

  it('latency improvement follows sqrt curve (diminishing returns)', () => {
    // Going from 10%→20% should improve more than 40%→50%
    const improvement10to20 =
      computeSpatialLatency(10, 500, KOREA_BS, KOREA_AREA) -
      computeSpatialLatency(20, 500, KOREA_BS, KOREA_AREA);
    const improvement40to50 =
      computeSpatialLatency(40, 500, KOREA_BS, KOREA_AREA) -
      computeSpatialLatency(50, 500, KOREA_BS, KOREA_AREA);
    expect(improvement10to20).toBeGreaterThan(improvement40to50);
  });
});

// ─── Core simulation ─────────────────────────────────────────

describe('simulate()', () => {
  it('returns correct number of quarters (44: 2025Q1 to 2035Q4)', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    expect(results).toHaveLength(44);
  });

  it('returns shorter range when configured', () => {
    const config = { ...DEFAULT_CONFIG, endQuarter: '2025Q4' };
    const results = simulate(DEFAULT_PARAMS, config);
    expect(results).toHaveLength(4);
  });

  it('first and last quarter labels are correct', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    expect(first(results).quarter).toBe('2025Q1');
    expect(last(results).quarter).toBe('2035Q4');
  });

  it('digital revenue grows over time', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    expect(last(results).nodeOutputs.digitalRevenue)
      .toBeGreaterThan(first(results).nodeOutputs.digitalRevenue);
  });

  it('total CAPEX is always non-negative', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    for (const r of results) {
      expect(r.totalCAPEX).toBeGreaterThanOrEqual(0);
    }
  });

  it('bottleneckRatio is between 0 and 1', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    for (const r of results) {
      expect(r.bottleneckRatio).toBeGreaterThan(0);
      expect(r.bottleneckRatio).toBeLessThanOrEqual(1);
    }
  });

  it('identifies a bottleneck node each quarter', () => {
    const validNodes = ['silicon', 'energy', 'hyperscaleDC', 'spatialCompute', 'intelligence', 'digitalAI', 'physicalAI', 'capital'];
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    for (const r of results) {
      expect(validNodes).toContain(r.bottleneckNode);
    }
  });

  it('effectiveParams evolve over time (silicon.bwMemory grows)', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    expect(last(results).effectiveParams.silicon.bwMemory)
      .toBeGreaterThan(first(results).effectiveParams.silicon.bwMemory);
  });
});

// ─── Confidence-adjusted reinvestment ─────────────────────────

describe('Confidence mechanism', () => {
  it('higher sensitivity reduces effective reinvestment when bottleneck is tight', () => {
    const configLow = { ...DEFAULT_CONFIG, sensitivity: 0.3, endQuarter: '2026Q4' };
    const configHigh = { ...DEFAULT_CONFIG, sensitivity: 1.0, endQuarter: '2026Q4' };

    const resultsLow = simulate(DEFAULT_PARAMS, configLow);
    const resultsHigh = simulate(DEFAULT_PARAMS, configHigh);

    expect(last(resultsHigh).nodeOutputs.confidence)
      .toBeLessThanOrEqual(last(resultsLow).nodeOutputs.confidence);
  });

  it('confidence approaches 1 as bottleneck ratio approaches 1', () => {
    const maxParams: InfraWheelParams = {
      silicon: { bwMemory: 115, capMemory: 1900, packaging: 195 },
      energy: { deliverablePower: 75, leadTime: 12, computeDensity: 48 },
      intelligence: { algorithmicEfficiency: 1900, transferRatio: 75 },
      capital: { reinvestRatio: 45, policyCAPEX: 70 },
      hyperscaleDC: { bisectionBW: 190, utilization: 72 },
      digitalAI: { revenueGrowth: 75, grossMargin: 70 },
      spatialCompute: { deploymentRate: 55, perNodeTOPS: 1900 },
      physicalAI: { fleetDeployment: 1800, unitEconomics: 1.4 },
    };

    const config = { ...DEFAULT_CONFIG, endQuarter: '2025Q2' };
    const results = simulate(maxParams, config);

    expect(first(results).nodeOutputs.confidence).toBeGreaterThan(0.8);
  });
});

// ─── Physical AI dual-key activation ──────────────────────────

describe('Physical AI dual-key activation', () => {
  it('is inactive when transfer ratio is below threshold', () => {
    const params: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      intelligence: { algorithmicEfficiency: 150, transferRatio: 30 },
      spatialCompute: { deploymentRate: 40, perNodeTOPS: 1000 },
    };
    const config = { ...DEFAULT_CONFIG, endQuarter: '2025Q2' };
    const results = simulate(params, config);
    expect(first(results).nodeOutputs.physicalAIActive).toBe(false);
  });

  it('is inactive when spatial latency is too high', () => {
    const params: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      intelligence: { algorithmicEfficiency: 150, transferRatio: 60 },
      spatialCompute: { deploymentRate: 2, perNodeTOPS: 100 },
    };
    const config = { ...DEFAULT_CONFIG, endQuarter: '2025Q2' };
    const results = simulate(params, config);
    expect(first(results).nodeOutputs.physicalAIActive).toBe(false);
  });

  it('activates when both keys are satisfied', () => {
    const params: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      intelligence: { algorithmicEfficiency: 150, transferRatio: 60 },
      spatialCompute: { deploymentRate: 40, perNodeTOPS: 1000 },
    };
    const config = { ...DEFAULT_CONFIG, endQuarter: '2025Q2' };
    const results = simulate(params, config);
    expect(first(results).nodeOutputs.physicalAIActive).toBe(true);
    expect(first(results).nodeOutputs.physicalRevenue).toBeGreaterThan(0);
  });
});

// ─── Scenario tests ───────────────────────────────────────────

describe('Scenario: Energy Bottleneck', () => {
  it('constrained energy reduces hyperscale effective compute when energy-bound', () => {
    const highSiliconParams: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      silicon: { bwMemory: 120, capMemory: 2000, packaging: 200 },
    };
    const normalResults = simulate(highSiliconParams, { ...DEFAULT_CONFIG, endQuarter: '2025Q4' });

    const constrainedParams: InfraWheelParams = {
      ...highSiliconParams,
      energy: { deliverablePower: 15, leadTime: 60, computeDensity: 5 },
    };
    const constrainedResults = simulate(constrainedParams, { ...DEFAULT_CONFIG, endQuarter: '2025Q4' });

    expect(first(constrainedResults).nodeOutputs.hyperscaleEffective)
      .toBeLessThan(first(normalResults).nodeOutputs.hyperscaleEffective);
  });

  it('constrained energy widens hyperscale gap over time', () => {
    const highSiliconParams: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      silicon: { bwMemory: 120, capMemory: 2000, packaging: 200 },
    };
    const normalResults = simulate(highSiliconParams, { ...DEFAULT_CONFIG, endQuarter: '2030Q4' });

    const constrainedParams: InfraWheelParams = {
      ...highSiliconParams,
      energy: { deliverablePower: 15, leadTime: 60, computeDensity: 5 },
    };
    const constrainedResults = simulate(constrainedParams, { ...DEFAULT_CONFIG, endQuarter: '2030Q4' });

    expect(last(constrainedResults).nodeOutputs.hyperscaleEffective)
      .toBeLessThan(last(normalResults).nodeOutputs.hyperscaleEffective);
  });
});

describe('Scenario: AI Winter', () => {
  it('low confidence + low growth results in much lower CAPEX', () => {
    const winterParams: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      capital: { reinvestRatio: 15, policyCAPEX: 0 },
      digitalAI: { revenueGrowth: 15, grossMargin: 20 },
    };
    const config = { ...DEFAULT_CONFIG, sensitivity: 1.0, endQuarter: '2030Q4' };
    const results = simulate(winterParams, config);
    const normalResults = simulate(DEFAULT_PARAMS, { ...DEFAULT_CONFIG, endQuarter: '2030Q4' });

    expect(last(results).totalCAPEX).toBeLessThan(last(normalResults).totalCAPEX * 0.5);
  });
});

// ─── Digital AI serving ceiling (1A) ──────────────────────────

describe('Digital AI serving ceiling (1A)', () => {
  it('a tight serving-ceiling coefficient caps late digital revenue', () => {
    const tight = { ...DEFAULT_CONFIG, digitalRevenuePerInferenceUnit: 1.0 };
    const loose = { ...DEFAULT_CONFIG, digitalRevenuePerInferenceUnit: 100 };
    const rTight = simulate(DEFAULT_PARAMS, tight);
    const rLoose = simulate(DEFAULT_PARAMS, loose);
    // Late horizon: the tight ceiling binds → strictly lower digital revenue
    expect(last(rTight).nodeOutputs.digitalRevenue)
      .toBeLessThan(last(rLoose).nodeOutputs.digitalRevenue);
    // First quarter sits below both ceilings → identical (ceiling not yet binding)
    expect(first(rTight).nodeOutputs.digitalRevenue)
      .toBeCloseTo(first(rLoose).nodeOutputs.digitalRevenue, 5);
  });

  it('Base Case digital revenue is not artificially flattened (tracks revenue growth)', () => {
    const r = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const a = r[r.length - 2]!.nodeOutputs.digitalRevenue;
    const b = r[r.length - 1]!.nodeOutputs.digitalRevenue;
    // Final q/q growth stays near the ~7.8% quarterly trend, not a flat ceiling crawl
    expect(b / a - 1).toBeGreaterThan(0.07);
  });

  it('low packaging lowers the ceiling enough to bind even at default coefficient', () => {
    const lowPack: InfraWheelParams = {
      ...DEFAULT_PARAMS,
      silicon: { ...DEFAULT_PARAMS.silicon, packaging: 40 },
    };
    const rBase = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const rLow = simulate(lowPack, DEFAULT_CONFIG);
    expect(last(rLow).nodeOutputs.digitalRevenue)
      .toBeLessThan(last(rBase).nodeOutputs.digitalRevenue);
  });
});

// ─── Effective-inference ceiling channels — ⑤ ────────────────

describe('Effective-inference ceiling (⑤)', () => {
  it('energy scarcity binds digital revenue (power enters the ceiling via usableComputeH)', () => {
    const cfg = { ...DEFAULT_CONFIG, digitalRevenuePerInferenceUnit: 1.0 }; // ceiling active
    const abundant = simulate(DEFAULT_PARAMS, cfg);
    const scarce = simulate(
      { ...DEFAULT_PARAMS, energy: { ...DEFAULT_PARAMS.energy, deliverablePower: 12, computeDensity: 7 } },
      cfg,
    );
    expect(last(scarce).nodeOutputs.digitalRevenue)
      .toBeLessThan(last(abundant).nodeOutputs.digitalRevenue);
  });

  it('algorithmic efficiency lifts the ceiling when revenue is ceiling-limited', () => {
    const cfg = { ...DEFAULT_CONFIG, digitalRevenuePerInferenceUnit: 0.5 }; // tightly ceiling-limited
    const baseEff = simulate(DEFAULT_PARAMS, cfg);
    const highEff = simulate(
      { ...DEFAULT_PARAMS, intelligence: { ...DEFAULT_PARAMS.intelligence, algorithmicEfficiency: 600 } },
      cfg,
    );
    expect(last(highEff).nodeOutputs.digitalRevenue)
      .toBeGreaterThan(last(baseEff).nodeOutputs.digitalRevenue);
  });
});

// ─── Algo-efficiency margin channel — F ──────────────────────

describe('Algo-efficiency margin channel (F)', () => {
  it('is zero-offset at the Base Case anchor (base margin unchanged)', () => {
    const o = first(simulate(DEFAULT_PARAMS, DEFAULT_CONFIG)).nodeOutputs;
    expect(o.digitalCashFlow).toBeCloseTo(o.digitalRevenue * (DEFAULT_PARAMS.digitalAI.grossMargin / 100), 6);
  });

  it('higher algo efficiency lifts margin → CAPEX (cost channel), leaving the unbound revenue path intact', () => {
    const base = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const highAlgo = simulate(
      { ...DEFAULT_PARAMS, intelligence: { ...DEFAULT_PARAMS.intelligence, algorithmicEfficiency: 390 } },
      DEFAULT_CONFIG,
    );
    const margin = (r: typeof base, q: number) =>
      (100 * r[q]!.nodeOutputs.digitalCashFlow) / r[q]!.nodeOutputs.digitalRevenue;
    // early: clear margin uplift (+~10pp at the anchor offset)
    expect(margin(highAlgo, 0)).toBeGreaterThan(margin(base, 0) + 5);
    // near-mid horizon: CAPEX lifted via the margin channel (both saturate the 75% clamp late)
    expect(highAlgo[16]!.totalCAPEX).toBeGreaterThan(base[16]!.totalCAPEX);
    // revenue path is demand-driven and unbound → unchanged
    expect(last(highAlgo).nodeOutputs.digitalRevenue).toBeCloseTo(last(base).nodeOutputs.digitalRevenue, 2);
  });
});

// ─── Bottleneck nodes: capital / digital / physical (1B) ──────

describe('Bottleneck includes capital/digital/physical nodes (1B)', () => {
  // All node ratios comfortably >= ~0.40, so knocking one down isolates the bottleneck
  const balanced: InfraWheelParams = {
    silicon: { bwMemory: 80, capMemory: 1000, packaging: 120 },
    energy: { deliverablePower: 50, leadTime: 24, computeDensity: 25 },
    intelligence: { algorithmicEfficiency: 800, transferRatio: 50 },
    capital: { reinvestRatio: 40, policyCAPEX: 30 },
    hyperscaleDC: { bisectionBW: 120, utilization: 50 },
    digitalAI: { revenueGrowth: 35, grossMargin: 50 },
    spatialCompute: { deploymentRate: 40, perNodeTOPS: 1000 },
    physicalAI: { fleetDeployment: 500, unitEconomics: 0.9 },
  };
  const shortCfg = { ...DEFAULT_CONFIG, endQuarter: '2025Q1' };

  it('very low reinvest ratio surfaces capital as the bottleneck node', () => {
    const p: InfraWheelParams = { ...balanced, capital: { reinvestRatio: 15, policyCAPEX: 30 } };
    expect(first(simulate(p, shortCfg)).bottleneckNode).toBe('capital');
  });

  it('very low gross margin surfaces digitalAI as the bottleneck node', () => {
    const p: InfraWheelParams = { ...balanced, digitalAI: { revenueGrowth: 35, grossMargin: 20 } };
    expect(first(simulate(p, shortCfg)).bottleneckNode).toBe('digitalAI');
  });

  it('weak unit economics surfaces physicalAI as the bottleneck node', () => {
    const p: InfraWheelParams = { ...balanced, physicalAI: { fleetDeployment: 500, unitEconomics: 0.3 } };
    expect(first(simulate(p, shortCfg)).bottleneckNode).toBe('physicalAI');
  });

  it('displayed bottleneckNode matches the ratio that drives confidence (single source)', () => {
    // bottleneckRatio (from outputs) and bottleneckNode now come from the same computation
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    for (const r of results) {
      expect(r.bottleneckNode).toBe(r.nodeOutputs.bottleneckNode);
      expect(r.bottleneckRatio).toBe(r.nodeOutputs.bottleneckRatio);
    }
  });
});

// ─── Lead time governs energy timing (1C) ─────────────────────

describe('Lead time governs energy timing (1C)', () => {
  const mk = (lt: number) =>
    simulate({ ...DEFAULT_PARAMS, energy: { ...DEFAULT_PARAMS.energy, leadTime: lt } }, DEFAULT_CONFIG);
  const pwr = (r: ReturnType<typeof mk>, q: number) => r[q]!.effectiveParams.energy.deliverablePower;

  it('longer lead time delays the deliverable-power ramp', () => {
    const fast = mk(18);
    const slow = mk(54);
    // Mid-horizon: shorter lead time has more power online
    expect(pwr(fast, 24)).toBeGreaterThan(pwr(slow, 24));
  });

  it('power stays at baseline before the lead-time lag has elapsed', () => {
    const slow = mk(54); // energyLagQ = round(54/3) = 18 quarters
    expect(pwr(slow, 8)).toBeCloseTo(DEFAULT_PARAMS.energy.deliverablePower, 5);
  });
});

// ─── Diminishing returns ──────────────────────────────────────

describe('Algorithmic efficiency diminishing returns', () => {
  it('efficiency is still growing in final quarter (not stuck at ceiling)', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const lastParams = last(results).effectiveParams;
    const secondLastParams = results[results.length - 2]!.effectiveParams;
    expect(lastParams.intelligence.algorithmicEfficiency)
      .toBeGreaterThan(secondLastParams.intelligence.algorithmicEfficiency);
  });

  it('growth rate slows down over time', () => {
    const results = simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    // Compare quarterly growth rate at Q8 vs Q36
    const earlyGrowth = results[8]!.effectiveParams.intelligence.algorithmicEfficiency /
                         results[7]!.effectiveParams.intelligence.algorithmicEfficiency - 1;
    const lateGrowth = results[36]!.effectiveParams.intelligence.algorithmicEfficiency /
                        results[35]!.effectiveParams.intelligence.algorithmicEfficiency - 1;
    expect(earlyGrowth).toBeGreaterThan(lateGrowth);
  });
});

// ─── Performance ──────────────────────────────────────────────

describe('Performance', () => {
  it('44 quarter simulation completes in <10ms', () => {
    const start = performance.now();
    simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
