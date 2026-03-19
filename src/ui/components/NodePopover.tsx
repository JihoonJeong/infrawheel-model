import { useI18n } from '../i18n';
import { useSimStore } from '../store';
import { getNodeDescription } from '../content/nodeDescriptions';
import type { InfraWheelParams } from '../../types';

/** Map diagram node id → engine param node key */
const NODE_TO_PARAM: Record<string, keyof InfraWheelParams> = {
  silicon: 'silicon',
  energy: 'energy',
  hyperscale: 'hyperscaleDC',
  spatial: 'spatialCompute',
  intelligence: 'intelligence',
  digital: 'digitalAI',
  physical: 'physicalAI',
  capital: 'capital',
};

export function NodePopover({
  nodeId,
  onClose,
}: {
  nodeId: string;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const desc = getNodeDescription(nodeId, locale);
  const params = useSimStore((s) => s.params);
  const bottleneckNode = useSimStore(
    (s) => s.results[s.results.length - 1]?.bottleneckNode,
  );

  if (!desc) return null;

  const paramNodeKey = NODE_TO_PARAM[nodeId];
  const engineBnId = bottleneckNode;

  // Check if this node is the current bottleneck
  const isBottleneck =
    paramNodeKey && engineBnId === paramNodeKey;

  // Get current param values
  const paramValues = paramNodeKey
    ? (params[paramNodeKey] as Record<string, number>)
    : {};

  return (
    <>
      <div className="popover-backdrop" onClick={onClose} />
      <div className="node-popover">
        <div className="popover-header">
          <h3>{desc.name}</h3>
          {isBottleneck && (
            <span className="popover-bottleneck">
              {locale === 'ko' ? '현재 병목' : 'Current bottleneck'}
            </span>
          )}
          <button className="popover-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="popover-role">{desc.role}</p>
        <div className="popover-params">
          <h4>{locale === 'ko' ? '파라미터' : 'Parameters'}</h4>
          {desc.paramKeys.map((key) => (
            <div key={key} className="popover-param-row">
              <span className="popover-param-key">{key}</span>
              <span className="popover-param-val">
                {paramValues[key] !== undefined
                  ? typeof paramValues[key] === 'number' && paramValues[key]! % 1 !== 0
                    ? paramValues[key]!.toFixed(2)
                    : paramValues[key]
                  : '—'}
              </span>
            </div>
          ))}
        </div>
        <p className="popover-transition">{desc.transition}</p>
      </div>
    </>
  );
}
