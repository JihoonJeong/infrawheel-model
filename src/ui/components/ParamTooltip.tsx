import { useState } from 'react';
import { useI18n } from '../i18n';
import { getParamDescription } from '../content/paramDescriptions';
import type { Confidence } from '../content/paramDescriptions';

const CONFIDENCE_DOT: Record<Confidence, { color: string; label: Record<string, string> }> = {
  high:   { color: '#22c55e', label: { en: 'High confidence', ko: '높은 신뢰도' } },
  medium: { color: '#eab308', label: { en: 'Medium confidence', ko: '중간 신뢰도' } },
  low:    { color: '#ef4444', label: { en: 'Low confidence', ko: '낮은 신뢰도' } },
};

export function ParamTooltip({ paramKey }: { paramKey: string }) {
  const [open, setOpen] = useState(false);
  const { locale } = useI18n();
  const desc = getParamDescription(paramKey, locale);

  if (!desc) return null;

  const conf = CONFIDENCE_DOT[desc.confidence];

  return (
    <span className="tooltip-wrapper">
      <button
        className="tooltip-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Info"
      >
        ⓘ
      </button>
      {open && (
        <>
          <div className="tooltip-backdrop" onClick={() => setOpen(false)} />
          <div className="tooltip-popover">
            <div className="tooltip-confidence">
              <span className="confidence-dot" style={{ backgroundColor: conf.color }} />
              <span className="confidence-label">{conf.label[locale] ?? conf.label['en']}</span>
            </div>
            <p className="tooltip-desc">{desc.description}</p>
            <div className="tooltip-meta">
              <div className="tooltip-range">{desc.range}</div>
              <div className="tooltip-source">{desc.source}</div>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
