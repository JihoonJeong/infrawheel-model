import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useSimStore } from '../store';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { CycleOutput } from '../../types';

// ─── Node layout (fixed positions on the wheel) ───────────────

interface WheelNode {
  id: string;
  labelKey: TranslationKey;
  color: string;
  loop: 'shared' | 'hyperscale' | 'spatial';
  angle: number; // degrees, 0 = top
}

const NODES: WheelNode[] = [
  { id: 'silicon',    labelKey: 'wheel.silicon',      color: '#6366f1', loop: 'shared',     angle: 0 },
  { id: 'energy',     labelKey: 'wheel.energy',       color: '#f59e0b', loop: 'shared',     angle: 45 },
  { id: 'hyperscale', labelKey: 'wheel.hyperscale',   color: '#3b82f6', loop: 'hyperscale', angle: 90 },
  { id: 'spatial',    labelKey: 'wheel.spatial',       color: '#14b8a6', loop: 'spatial',    angle: 135 },
  { id: 'intelligence', labelKey: 'wheel.intelligence', color: '#a855f7', loop: 'shared',   angle: 180 },
  { id: 'digital',    labelKey: 'wheel.digital',      color: '#ec4899', loop: 'hyperscale', angle: 225 },
  { id: 'physical',   labelKey: 'wheel.physical',     color: '#10b981', loop: 'spatial',    angle: 270 },
  { id: 'capital',    labelKey: 'wheel.capital',       color: '#ef4444', loop: 'shared',     angle: 315 },
];

// Edges: [from, to] — following the flywheel flow
const EDGES: [string, string][] = [
  ['silicon', 'energy'],
  ['energy', 'hyperscale'],
  ['energy', 'spatial'],
  ['hyperscale', 'intelligence'],
  ['spatial', 'intelligence'],
  ['intelligence', 'digital'],
  ['intelligence', 'physical'],
  ['digital', 'capital'],
  ['physical', 'capital'],
  ['capital', 'silicon'],
];

function getNodePos(angle: number, cx: number, cy: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── Component ────────────────────────────────────────────────

export function InfraWheelDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { t } = useI18n();
  const results = useSimStore((s) => s.results);
  const lastCycle = results[results.length - 1];

  useEffect(() => {
    if (!svgRef.current || !lastCycle) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const cx = width / 2;
    const cy = height / 2 - 10;
    const r = Math.min(cx, cy) * 0.7;

    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Arrow marker
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 28)
      .attr('refY', 5)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#475569');

    // Node positions
    const nodePos = new Map<string, { x: number; y: number }>();
    for (const node of NODES) {
      nodePos.set(node.id, getNodePos(node.angle, cx, cy, r));
    }

    // Draw edges
    svg
      .selectAll('line.edge')
      .data(EDGES)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', (d) => nodePos.get(d[0])!.x)
      .attr('y1', (d) => nodePos.get(d[0])!.y)
      .attr('x2', (d) => nodePos.get(d[1])!.x)
      .attr('y2', (d) => nodePos.get(d[1])!.y)
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    // Draw nodes
    const bottleneckId = mapBottleneckToNodeId(lastCycle.bottleneckNode);

    const nodeG = svg
      .selectAll('g.node')
      .data(NODES)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => {
        const pos = nodePos.get(d.id)!;
        return `translate(${pos.x},${pos.y})`;
      });

    // Node circle
    nodeG
      .append('circle')
      .attr('r', 22)
      .attr('fill', (d) => d.color + '30')
      .attr('stroke', (d) => (d.id === bottleneckId ? '#f59e0b' : d.color))
      .attr('stroke-width', (d) => (d.id === bottleneckId ? 3 : 1.5));

    // Bottleneck pulse animation
    nodeG
      .filter((d) => d.id === bottleneckId)
      .append('circle')
      .attr('r', 22)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', '22;30;22')
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite')
      .attr('attributeType', 'XML');

    nodeG
      .filter((d) => d.id === bottleneckId)
      .select('circle:last-of-type')
      .append('animate')
      .attr('attributeName', 'opacity')
      .attr('values', '0.6;0;0.6')
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite');

    // Node label
    nodeG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => t(d.labelKey));

  }, [lastCycle, t]);

  if (!lastCycle) return null;

  const { bottleneckNode, bottleneckRatio, loopSpeeds, nodeOutputs } = lastCycle;

  return (
    <section className="diagram-panel">
      <h2>{t('infrawheel')}</h2>
      <div className="diagram-svg-wrapper">
        <svg ref={svgRef} className="diagram-svg" />
      </div>
      <div className="diagram-stats">
        <div className="stat">
          <span className="stat-label">{t('bottleneck')}</span>
          <span className="stat-value bottleneck">{bottleneckNode}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('bottleneckRatioLabel')}</span>
          <span className="stat-value">{(bottleneckRatio * 100).toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('confidenceLabel')}</span>
          <span className="stat-value">{(nodeOutputs.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('hyperscaleLoop')}</span>
          <span className="stat-value">{loopSpeeds.hyperscale.toFixed(1)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('spatialLoop')}</span>
          <span className="stat-value">{loopSpeeds.spatial.toFixed(1)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('physicalAIStatus')}</span>
          <span className={`stat-value ${nodeOutputs.physicalAIActive ? 'active' : 'inactive'}`}>
            {nodeOutputs.physicalAIActive ? t('active') : t('inactive')}
          </span>
        </div>
      </div>
    </section>
  );
}

/** Map engine's bottleneckNode id to diagram node id */
function mapBottleneckToNodeId(bn: string): string {
  const map: Record<string, string> = {
    silicon: 'silicon',
    energy: 'energy',
    hyperscaleDC: 'hyperscale',
    spatialCompute: 'spatial',
    intelligence: 'intelligence',
    digitalAI: 'digital',
    physicalAI: 'physical',
    capital: 'capital',
  };
  return map[bn] ?? bn;
}
