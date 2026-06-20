import { describe, it, expect, beforeEach } from 'vitest';
import { useSimStore } from '../ui/store';
import type { SerializableState } from '../ui/urlState';
import { encodeState, decodeState } from '../ui/urlState';
import { simulate } from '../engine';

const s = () => useSimStore.getState();
const serializable = (): SerializableState => {
  const st = s();
  return {
    params: st.params,
    geoState: st.geoState,
    activeTab: st.activeTab,
    selectedMetrics: st.selectedMetrics,
    activeScenario: st.activeScenario,
    config: st.config,
  };
};
const lastRev = (r: ReturnType<typeof simulate>) => r[r.length - 1]!.totalRevenue;

beforeEach(() => {
  s().resetParams();
  s().setGeoBloc(50);
});

describe('store integration (the actions the UI calls)', () => {
  it('applyScenario loads preset params + config and labels the selection', () => {
    s().applyScenario('aiWinter');
    expect(s().activeScenario).toBe('aiWinter');
    expect(s().config.sensitivity).toBe(0.9);            // config override applied
    expect(s().params.digitalAI.revenueGrowth).toBe(15); // param override applied
    expect(s().results).toHaveLength(44);
  });

  it('manual setParam flips the selection to custom', () => {
    s().applyScenario('aiWinter');
    s().setParam('silicon', 'packaging', 99);
    expect(s().activeScenario).toBe('custom');
    expect(s().params.silicon.packaging).toBe(99);
  });

  it('resetParams returns to base2026 with default config', () => {
    s().applyScenario('koreaFirstSpatial');
    s().resetParams();
    expect(s().activeScenario).toBe('base2026');
    expect(s().config.coveredAreaKm2).toBe(50_000);
  });

  it('share round-trip (encode → decode → re-simulate) reproduces the curve', () => {
    s().applyScenario('memoryWall');
    s().setParam('energy', 'deliverablePower', 22);
    const decoded = decodeState(encodeState(serializable()));
    const reRun = simulate(decoded.params!, decoded.config ?? s().config);
    expect(lastRev(reRun)).toBeCloseTo(lastRev(s().results), 2);
  });

  it('bloc slider 50 → 0 (integration) speeds the geo flywheel', () => {
    const before = s().geoResults[s().geoResults.length - 1]!.nodeOutputs.hyperscaleEffective;
    s().setGeoBloc(0);
    const after = s().geoResults[s().geoResults.length - 1]!.nodeOutputs.hyperscaleEffective;
    expect(s().geoState.blocPct).toBe(0);
    expect(after).toBeGreaterThan(before);
  });
});
