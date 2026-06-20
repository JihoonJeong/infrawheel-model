import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from '../ui/urlState';
import type { SerializableState } from '../ui/urlState';
import { DEFAULT_PARAMS, DEFAULT_CONFIG } from '../defaults';
import { DEFAULT_GEO } from '../ui/geopolitical/geoMapping';

const sample: SerializableState = {
  params: { ...DEFAULT_PARAMS, silicon: { bwMemory: 72.5, capMemory: 410, packaging: 88 } },
  geoState: { blocPct: 20, energyPct: 75, taiwanCrisis: 'blockade' },
  activeTab: 'geopolitical',
  selectedMetrics: ['totalRevenue', 'confidence'],
  activeScenario: 'memoryWall',
  config: { ...DEFAULT_CONFIG, sensitivity: 0.9, coveredAreaKm2: 300_000 },
};

describe('urlState round-trip', () => {
  it('encodes and decodes back to equivalent state', () => {
    const decoded = decodeState(encodeState(sample));
    expect(decoded.params!.silicon).toEqual({ bwMemory: 72.5, capMemory: 410, packaging: 88 });
    expect(decoded.geoState).toEqual({ blocPct: 20, energyPct: 75, taiwanCrisis: 'blockade' });
    expect(decoded.activeTab).toBe('geopolitical');
    expect(decoded.selectedMetrics).toEqual(['totalRevenue', 'confidence']);
    expect(decoded.activeScenario).toBe('memoryWall');
    expect(decoded.config!.sensitivity).toBe(0.9);
    expect(decoded.config!.coveredAreaKm2).toBe(300_000);
  });

  it('tolerates a leading # and is stable on re-encode', () => {
    const hash = encodeState(sample);
    const reencoded = encodeState({ ...sample, ...decodeState('#' + hash) } as SerializableState);
    expect(reencoded).toBe(hash);
  });

  it('returns {} for empty / malformed hashes without throwing', () => {
    expect(decodeState('')).toEqual({});
    expect(decodeState('not-json')).toEqual({});
    expect(decodeState('%')).toEqual({}); // invalid URI component
  });

  it('fills missing fields from defaults (legacy/partial hash)', () => {
    const partial = encodeURIComponent(JSON.stringify({ t: 'infrawheel' }));
    const decoded = decodeState(partial);
    expect(decoded.activeTab).toBe('infrawheel');
    expect(decoded.params).toBeUndefined();
  });

  it('drops out-of-range / wrong-type values defensively', () => {
    const bad = encodeURIComponent(
      JSON.stringify({ g: { b: 999, e: 'x', t: 'nope' }, c: { sensitivity: 'high' } }),
    );
    const decoded = decodeState(bad);
    expect(decoded.geoState!.blocPct).toBe(100); // clamped
    expect(decoded.geoState!.energyPct).toBe(DEFAULT_GEO.energyPct); // fallback
    expect(decoded.geoState!.taiwanCrisis).toBe('off'); // invalid stage → default
    expect(decoded.config!.sensitivity).toBe(DEFAULT_CONFIG.sensitivity); // non-number ignored
  });
});
