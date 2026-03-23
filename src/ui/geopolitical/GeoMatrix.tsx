import { useI18n } from '../i18n';

/**
 * 2×2 matrix visualization.
 * X: bloc (0=global → 100=tripolar), right-to-left so tripolar is left.
 * Y: energy (0=scarce → 100=abundant), bottom-to-top.
 * Current position shown as animated dot.
 */
export function GeoMatrix({ blocPct, energyPct }: { blocPct: number; energyPct: number }) {
  const { t } = useI18n();

  // Dot position: X maps bloc (0=right, 100=left), Y maps energy (0=bottom, 100=top)
  const dotX = 100 - blocPct; // global=right, tripolar=left
  const dotY = 100 - energyPct; // abundant=top, scarce=bottom

  return (
    <div className="geo-matrix">
      {/* Axis labels */}
      <div className="matrix-y-label top">{t('geo.matrixAbundant')}</div>
      <div className="matrix-y-label bottom">{t('geo.matrixScarce')}</div>
      <div className="matrix-x-label left">{t('geo.matrixTripolar')}</div>
      <div className="matrix-x-label right">{t('geo.matrixGlobal')}</div>

      {/* Grid */}
      <div className="matrix-grid">
        <div className="matrix-quadrant q-tl">
          <span className="q-label">{t('geo.presetTripolarAbundance')}</span>
        </div>
        <div className="matrix-quadrant q-tr">
          <span className="q-label">{t('geo.presetGolden')}</span>
        </div>
        <div className="matrix-quadrant q-bl">
          <span className="q-label">{t('geo.presetTripolarScarcity')}</span>
        </div>
        <div className="matrix-quadrant q-br">
          <span className="q-label">{t('geo.presetGlobalBottleneck')}</span>
        </div>

        {/* Dot */}
        <div
          className="matrix-dot"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
        >
          <div className="matrix-dot-pulse" />
          <div className="matrix-dot-core" />
        </div>
      </div>
    </div>
  );
}
