import { useSimStore } from '../store';

/**
 * Placeholder for the InfraWheel D3 live diagram.
 * Shows current bottleneck + loop speeds until D3 implementation.
 */
export function DiagramPlaceholder() {
  const results = useSimStore((s) => s.results);
  const last = results[results.length - 1];
  if (!last) return null;

  const { bottleneckNode, bottleneckRatio, loopSpeeds, nodeOutputs } = last;

  return (
    <section className="diagram-panel">
      <h2>InfraWheel</h2>
      <div className="diagram-placeholder">
        <div className="diagram-visual">
          <div className="wheel-ring">
            {['Silicon', 'Energy', 'Infra', 'Intelligence', 'Apps', 'Capital'].map(
              (label, i) => {
                const angle = (i / 6) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const r = 90;
                const x = 50 + r * Math.cos(rad) / 1.1;
                const y = 50 + r * Math.sin(rad) / 1.1;
                return (
                  <span
                    key={label}
                    className="wheel-node"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {label}
                  </span>
                );
              },
            )}
          </div>
        </div>

        <div className="diagram-stats">
          <div className="stat">
            <span className="stat-label">Bottleneck</span>
            <span className="stat-value bottleneck">{bottleneckNode}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Bottleneck Ratio</span>
            <span className="stat-value">{(bottleneckRatio * 100).toFixed(1)}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Confidence</span>
            <span className="stat-value">{(nodeOutputs.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Hyperscale Loop</span>
            <span className="stat-value">{loopSpeeds.hyperscale.toFixed(1)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Spatial Loop</span>
            <span className="stat-value">{loopSpeeds.spatial.toFixed(1)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Physical AI</span>
            <span className={`stat-value ${nodeOutputs.physicalAIActive ? 'active' : 'inactive'}`}>
              {nodeOutputs.physicalAIActive ? 'ACTIVE' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
