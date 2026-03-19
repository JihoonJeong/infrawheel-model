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
      intelligence: { algorithmicEfficiency: 950, transferRatio: 75 },
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

// ─── Performance ──────────────────────────────────────────────

describe('Performance', () => {
  it('44 quarter simulation completes in <10ms', () => {
    const start = performance.now();
    simulate(DEFAULT_PARAMS, DEFAULT_CONFIG);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
