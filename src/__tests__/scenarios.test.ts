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
  it('has 8 presets with unique ids, base first', () => {
    expect(SCENARIOS).toHaveLength(8);
    expect(SCENARIOS[0]!.id).toBe(BASE_SCENARIO_ID);
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(8);
  });

  it('base2026 reproduces DEFAULT_PARAMS', () => {
    expect(SCENARIO_BY_ID[BASE_SCENARIO_ID]!.params).toEqual(DEFAULT_PARAMS);
  });

  it('every preset simulates a full horizon without error', () => {
    for (const s of SCENARIOS) {
      const r = simulate(s.params, { ...DEFAULT_CONFIG, ...(s.config ?? {}) });
      expect(r).toHaveLength(44);
    }
  });

  it('physicalAITakeoff trips the Physical AI dual-key', () => {
    expect(run('physicalAITakeoff').some((c) => c.nodeOutputs.physicalAIActive)).toBe(true);
  });

  it('memoryWall binds the serving ceiling → lower revenue than base', () => {
    expect(finalRevenue('memoryWall')).toBeLessThan(finalRevenue(BASE_SCENARIO_ID));
  });

  it('aiWinter collapses revenue to well under half of base', () => {
    expect(finalRevenue('aiWinter')).toBeLessThan(finalRevenue(BASE_SCENARIO_ID) * 0.5);
  });
});
