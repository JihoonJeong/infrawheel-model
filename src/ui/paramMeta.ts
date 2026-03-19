/**
 * Metadata for the 19 parameters — labels, ranges, units, step sizes.
 * Used by the ParameterPanel to render sliders.
 */

import type { InfraWheelParams } from '../types';

export interface ParamDef {
  node: keyof InfraWheelParams;
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export interface NodeGroup {
  node: keyof InfraWheelParams;
  label: string;
  color: string;
  params: ParamDef[];
}

export const NODE_GROUPS: NodeGroup[] = [
  {
    node: 'silicon',
    label: 'Silicon',
    color: '#6366f1',
    params: [
      { node: 'silicon', key: 'bwMemory', label: 'BW Memory Supply', unit: 'GB/Q', min: 20, max: 120, step: 1 },
      { node: 'silicon', key: 'capMemory', label: 'Capacity Memory Pool', unit: 'TB/Q', min: 50, max: 2000, step: 10 },
      { node: 'silicon', key: 'packaging', label: 'Packaging Throughput', unit: 'K wafers/Q', min: 30, max: 200, step: 1 },
    ],
  },
  {
    node: 'energy',
    label: 'Energy',
    color: '#f59e0b',
    params: [
      { node: 'energy', key: 'deliverablePower', label: 'Deliverable Power', unit: 'GW', min: 15, max: 80, step: 1 },
      { node: 'energy', key: 'leadTime', label: 'Pipeline Lead Time', unit: 'months', min: 12, max: 60, step: 1 },
      { node: 'energy', key: 'computeDensity', label: 'Compute Density', unit: 'PFLOPS/MW', min: 5, max: 50, step: 1 },
    ],
  },
  {
    node: 'hyperscaleDC',
    label: 'Hyperscale DC',
    color: '#3b82f6',
    params: [
      { node: 'hyperscaleDC', key: 'bisectionBW', label: 'Bisection BW', unit: 'Tbps', min: 10, max: 200, step: 1 },
      { node: 'hyperscaleDC', key: 'utilization', label: 'Utilization', unit: '%', min: 30, max: 75, step: 1 },
    ],
  },
  {
    node: 'spatialCompute',
    label: 'Spatial Compute',
    color: '#14b8a6',
    params: [
      { node: 'spatialCompute', key: 'deploymentRate', label: 'AI-RAN Deploy Rate', unit: '%', min: 0, max: 60, step: 1 },
      { node: 'spatialCompute', key: 'perNodeTOPS', label: 'Per-node Capacity', unit: 'TOPS', min: 50, max: 2000, step: 10 },
    ],
  },
  {
    node: 'intelligence',
    label: 'Intelligence',
    color: '#a855f7',
    params: [
      { node: 'intelligence', key: 'algorithmicEfficiency', label: 'Algorithmic Efficiency', unit: 'index', min: 100, max: 2000, step: 10 },
      { node: 'intelligence', key: 'transferRatio', label: 'Frontier→Edge Transfer', unit: '%', min: 10, max: 80, step: 1 },
    ],
  },
  {
    node: 'digitalAI',
    label: 'Digital AI',
    color: '#ec4899',
    params: [
      { node: 'digitalAI', key: 'revenueGrowth', label: 'Revenue Growth', unit: '% YoY', min: 15, max: 80, step: 1 },
      { node: 'digitalAI', key: 'grossMargin', label: 'Gross Margin', unit: '%', min: 20, max: 75, step: 1 },
    ],
  },
  {
    node: 'physicalAI',
    label: 'Physical AI',
    color: '#10b981',
    params: [
      { node: 'physicalAI', key: 'fleetDeployment', label: 'Fleet Deployment', unit: 'K units', min: 10, max: 2000, step: 10 },
      { node: 'physicalAI', key: 'unitEconomics', label: 'Unit Economics', unit: 'rev/cost', min: 0.2, max: 1.5, step: 0.05 },
    ],
  },
  {
    node: 'capital',
    label: 'Capital',
    color: '#ef4444',
    params: [
      { node: 'capital', key: 'reinvestRatio', label: 'Reinvestment Ratio', unit: '%', min: 15, max: 50, step: 1 },
      { node: 'capital', key: 'policyCAPEX', label: 'Policy CAPEX', unit: '$B/yr', min: 0, max: 80, step: 1 },
    ],
  },
];
