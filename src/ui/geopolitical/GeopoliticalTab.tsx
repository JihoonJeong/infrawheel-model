import { useSimStore } from '../store';
import { useI18n } from '../i18n';
import { GEO_PRESETS, getAdjustmentPcts } from './geoMapping';
import { GeoMatrix } from './GeoMatrix';
import { TimelineChart } from '../components/TimelineChart';
import type { TaiwanCrisis } from './geoMapping';
import type { TranslationKey } from '../i18n';

const TAIWAN_STAGES: { value: TaiwanCrisis; labelKey: TranslationKey }[] = [
  { value: 'off',        labelKey: 'geo.taiwanOff' },
  { value: 'islands',    labelKey: 'geo.taiwanIslands' },
  { value: 'quarantine', labelKey: 'geo.taiwanQuarantine' },
  { value: 'blockade',   labelKey: 'geo.taiwanBlockade' },
  { value: 'invasion',   labelKey: 'geo.taiwanInvasion' },
];

const PRESET_LABELS: Record<string, TranslationKey> = {
  goldenAge: 'geo.presetGolden',
  tripolarAbundance: 'geo.presetTripolarAbundance',
  globalBottleneck: 'geo.presetGlobalBottleneck',
  tripolarScarcity: 'geo.presetTripolarScarcity',
  taiwanBlockade: 'geo.presetTaiwanBlockade',
  koreaOptimal: 'geo.presetKoreaOptimal',
};

/** Top affected params, sorted by absolute adjustment */
const DISPLAY_PARAMS: { key: string; labelKey: TranslationKey }[] = [
  { key: 'packaging', labelKey: 'param.packaging' },
  { key: 'policyCAPEX', labelKey: 'param.policyCAPEX' },
  { key: 'bwMemory', labelKey: 'param.bwMemory' },
  { key: 'reinvestRatio', labelKey: 'param.reinvestRatio' },
  { key: 'algorithmicEfficiency', labelKey: 'param.algorithmicEfficiency' },
  { key: 'deliverablePower', labelKey: 'param.deliverablePower' },
  { key: 'leadTime', labelKey: 'param.leadTime' },
  { key: 'transferRatio', labelKey: 'param.transferRatio' },
  { key: 'revenueGrowth', labelKey: 'param.revenueGrowth' },
  { key: 'deploymentRate', labelKey: 'param.deploymentRate' },
];

export function GeopoliticalTab() {
  const { t } = useI18n();
  const geo = useSimStore((s) => s.geoState);
  const setBloc = useSimStore((s) => s.setGeoBloc);
  const setEnergy = useSimStore((s) => s.setGeoEnergy);
  const setTaiwan = useSimStore((s) => s.setGeoTaiwan);
  const applyPreset = useSimStore((s) => s.applyGeoPreset);

  const adjustments = getAdjustmentPcts(geo);

  return (
    <main className="geo-layout">
      {/* Left: Controls */}
      <aside className="geo-controls">
        <div className="panel-header">
          <h2>{t('geo.title')}</h2>
        </div>
        <div className="panel-scroll">
          {/* Bloc slider */}
          <div className="geo-slider-group">
            <div className="geo-slider-header">
              <span>{t('geo.blocLabel')}</span>
              <span className="geo-slider-val">{geo.blocPct}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={geo.blocPct}
              onChange={(e) => setBloc(Number(e.target.value))}
            />
            <div className="geo-slider-range">
              <span>{t('geo.blocMin')}</span>
              <span>{t('geo.blocMid')}</span>
              <span>{t('geo.blocMax')}</span>
            </div>
          </div>

          {/* Energy slider */}
          <div className="geo-slider-group">
            <div className="geo-slider-header">
              <span>{t('geo.energyLabel')}</span>
              <span className="geo-slider-val">{geo.energyPct}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={geo.energyPct}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <div className="geo-slider-range">
              <span>{t('geo.energyMin')}</span>
              <span>{t('geo.energyMid')}</span>
              <span>{t('geo.energyMax')}</span>
            </div>
          </div>

          {/* Taiwan crisis */}
          <div className="geo-taiwan">
            <h3>{t('geo.taiwanLabel')}</h3>
            <div className="taiwan-stages">
              {TAIWAN_STAGES.map((s) => (
                <button
                  key={s.value}
                  className={`taiwan-btn ${geo.taiwanCrisis === s.value ? 'active' : ''} ${s.value !== 'off' ? 'danger' : ''}`}
                  onClick={() => setTaiwan(s.value)}
                >
                  {t(s.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="geo-presets">
            <h3>{t('geo.presets')}</h3>
            <div className="preset-grid">
              {GEO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  className="preset-btn"
                  onClick={() => applyPreset(p.blocPct, p.energyPct, p.taiwanCrisis)}
                >
                  {t(PRESET_LABELS[p.id]!)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Center: Matrix + Affected params */}
      <section className="geo-center">
        <GeoMatrix blocPct={geo.blocPct} energyPct={geo.energyPct} />
        <div className="geo-adjustments">
          <h3>{t('geo.adjustments')}</h3>
          <div className="adj-list">
            {DISPLAY_PARAMS.map(({ key, labelKey }) => {
              const adj = adjustments[key] ?? 0;
              if (Math.abs(adj) < 0.001) return null;
              const pct = Math.round(adj * 100);
              return (
                <div key={key} className="adj-row">
                  <span className="adj-label">{t(labelKey)}</span>
                  <div className="adj-bar-track">
                    <div
                      className={`adj-bar ${pct >= 0 ? 'positive' : 'negative'}`}
                      style={{ width: `${Math.min(Math.abs(pct), 100)}%` }}
                    />
                  </div>
                  <span className={`adj-pct ${pct >= 0 ? 'positive' : 'negative'}`}>
                    {pct > 0 ? '+' : ''}{pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right: Timeline (reuses same component, but reads geoResults) */}
      <TimelineChart useGeoResults />
    </main>
  );
}
