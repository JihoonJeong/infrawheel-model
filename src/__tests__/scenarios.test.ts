import { describe, it, expect } from 'vitest';
import { simulate } from '../engine';
import { DEFAULT_CONFIG, DEFAULT_PARAMS } from '../defaults';
import { SCENARIOS, SCENARIO_BY_ID, BASE_SCENARIO_ID } from '../scenarios';

function run(id: string) {
  const s = SCENARIO_BY_ID[id]!;
  return simulate(s.params, { ...DEFAULT_CONFIG, ...(s.config ?? {}) });
}
const finalRevenue = (id: string) => {
  const r = run(id);
  return r[r.length - 1]!.totalRevenue;
};

describe('Scenario presets', () => {
  it('has 10 presets with unique ids, base first', () => {
    expect(SCENARIOS).toHaveLength(10);
    expect(SCENARIOS[0]!.id).toBe(BASE_SCENARIO_ID);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(10);
  });

  it('base2026 reproduces DEFAULT_PARAMS', () => {
    expect(SCENARIO_BY_ID[BASE_SCENARIO_ID]!.params).toEqual(DEFAULT_PARAMS);
  });

  it('every preset simulates a full horizon without error', () => {
    for (const s of SCENARIOS) {
      const r = simulate(s.params, { ...DEFAULT_CONFIG, ...(s.config ?? {}) });
      expect(r).toHaveLength(40);
    }
  });

  it('physicalAITakeoff trips the Physical AI dual-key', () => {
    expect(run('physicalAITakeoff').some((c) => c.nodeOutputs.physicalAIActive)).toBe(true);
  });

  it('memoryWall binds the serving ceiling → lower revenue than base', () => {
    const cumRev = (id: string) => run(id).reduce((sum, c) => sum + c.totalRevenue, 0);
    expect(cumRev('memoryWall')).toBeLessThan(cumRev(BASE_SCENARIO_ID));
  });

  it('aiWinter collapses revenue to well under half of base', () => {
    expect(finalRevenue('aiWinter')).toBeLessThan(finalRevenue(BASE_SCENARIO_ID) * 0.5);
  });

  it('energyBottleneck now binds the serving ceiling on the revenue channel (⑤)', () => {
    const dig = (id: string) => {
      const r = run(id);
      return r[r.length - 1]!.nodeOutputs.digitalRevenue;
    };
    expect(dig('energyBottleneck')).toBeLessThan(dig(BASE_SCENARIO_ID));
  });

  it('energyBottleneck: energy is the binding node (not masked by nascent spatial)', () => {
    // Regression: with spatial at the pilot floor (3) its 0.05 ratio masked energy, so the
    // "energy bottleneck" scenario read as spatial-bound. deploymentRate 6 keeps energy binding.
    const r = run('energyBottleneck');
    expect(r[r.length - 1]!.bottleneckNode).toBe('energy');
  });

  it('energyBottleneck: raising compute density RELIEVES the bottleneck (both directions)', () => {
    // The reported bug: raising compute density did nothing to the loops/bottleneck (it only entered
    // usableCompute inside a min()-cap, and the energy ratio ignored density entirely). Now density
    // is a live upward lever. Endpoint (what the diagram shows) must rise monotonically with density.
    const scn = SCENARIO_BY_ID['energyBottleneck']!;
    const at = (cd: number) => {
      const p = { ...scn.params, energy: { ...scn.params.energy, computeDensity: cd } };
      const r = simulate(p, { ...DEFAULT_CONFIG, ...(scn.config ?? {}) });
      const e = r[r.length - 1]!;
      return { brat: e.bottleneckRatio, spatial: e.loopSpeeds.spatial };
    };
    const lo = at(5); // slider min
    const base = at(8); // preset default
    const hi = at(12); // above base — the direction that used to be inert
    // Upward: raising density above base now lifts both the bottleneck ratio and the spatial loop.
    expect(hi.brat).toBeGreaterThan(base.brat);
    expect(hi.spatial).toBeGreaterThan(base.spatial);
    // Downward: lowering density still tightens the bottleneck (unchanged, sanity anchor).
    expect(lo.brat).toBeLessThan(base.brat);
    expect(lo.spatial).toBeLessThan(base.spatial);
  });

  it('algoBreakthrough diverges via CAPEX (margin channel F) through the near-mid horizon', () => {
    // algoEff (hence margin) saturates the 75% clamp late for base too, so this is a near-mid effect
    const capAt = (id: string, q: number) => run(id)[q]!.totalCAPEX;
    expect(capAt('algoBreakthrough', 16)).toBeGreaterThan(capAt(BASE_SCENARIO_ID, 16) * 1.05);
  });

  it('every preset spins coherently across the full horizon (finite, positive, in-range)', () => {
    for (const s of SCENARIOS) {
      const r = simulate(s.params, { ...DEFAULT_CONFIG, ...(s.config ?? {}) });
      for (const c of r) {
        expect(Number.isFinite(c.totalRevenue)).toBe(true);
        expect(c.totalRevenue).toBeGreaterThan(0);
        expect(Number.isFinite(c.totalCAPEX)).toBe(true);
        expect(c.totalCAPEX).toBeGreaterThanOrEqual(0);
        expect(c.bottleneckRatio).toBeGreaterThan(0);
        expect(c.bottleneckRatio).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('v2.1 scenarios', () => {
  const run = (id: string) => simulate(SCENARIO_BY_ID[id]!.params, { ...DEFAULT_CONFIG, ...(SCENARIO_BY_ID[id]!.config ?? {}) });
  const cum = (r: ReturnType<typeof simulate>) => r.reduce((s, c) => s + c.totalCAPEX, 0);
  const base = run(BASE_SCENARIO_ID);

  it('intelligencePriceCollapse: less revenue and CAPEX than base, yet usage grows', () => {
    const r = run('intelligencePriceCollapse');
    // first 5 years (before both runs meet the late energy ceiling, which ×2 algo also lifts)
    const rev5 = (x: typeof r) => x.slice(0, 20).reduce((sum, c) => sum + c.totalRevenue, 0);
    expect(rev5(r)).toBeLessThan(rev5(base));
    expect(cum(r)).toBeLessThan(cum(base));
    expect(r[r.length - 1]!.nodeOutputs.intelligenceVolume).toBeGreaterThan(r[0]!.nodeOutputs.intelligenceVolume * 10);
  });

  it('capitalCrunch: demand beats base, but near-term CAPEX is throttled and capital binds', () => {
    const r = run('capitalCrunch');
    expect(r[r.length - 1]!.totalRevenue).toBeGreaterThan(base[base.length - 1]!.totalRevenue);
    expect(r[r.length - 1]!.nodeOutputs.dataStock).toBeGreaterThan(base[base.length - 1]!.nodeOutputs.dataStock);
    for (let i = 0; i < 4; i++) {
      expect(r[i]!.totalCAPEX).toBeLessThan(base[i]!.totalCAPEX);
      expect(r[i]!.bottleneckNode).toBe('capital');
    }
  });
});
