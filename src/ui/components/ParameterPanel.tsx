import { useState } from 'react';
import { useSimStore } from '../store';
import { NODE_GROUPS } from '../paramMeta';
import type { InfraWheelParams } from '../../types';
import type { NodeGroup, ParamDef } from '../paramMeta';

function ParamSlider({ def }: { def: ParamDef }) {
  const value = useSimStore(
    (s) => (s.params[def.node] as Record<string, number>)[def.key]!,
  );
  const setParam = useSimStore((s) => s.setParam);

  return (
    <div className="param-slider">
      <div className="param-header">
        <span className="param-label">{def.label}</span>
        <span className="param-value">
          {def.step < 1 ? value.toFixed(2) : value} <span className="param-unit">{def.unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) =>
          setParam(
            def.node,
            def.key as keyof InfraWheelParams[typeof def.node],
            Number(e.target.value),
          )
        }
      />
    </div>
  );
}

function NodeSection({ group }: { group: NodeGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="node-section">
      <button
        className="node-header"
        onClick={() => setOpen(!open)}
        style={{ borderLeftColor: group.color }}
      >
        <span className="node-label">{group.label}</span>
        <span className="node-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="node-params">
          {group.params.map((p) => (
            <ParamSlider key={`${p.node}-${p.key}`} def={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ParameterPanel() {
  const resetParams = useSimStore((s) => s.resetParams);

  return (
    <aside className="parameter-panel">
      <div className="panel-header">
        <h2>Parameters</h2>
        <button className="reset-btn" onClick={resetParams}>
          Reset
        </button>
      </div>
      <div className="panel-scroll">
        {NODE_GROUPS.map((g) => (
          <NodeSection key={g.node} group={g} />
        ))}
      </div>
    </aside>
  );
}
