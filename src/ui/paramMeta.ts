/**
 * Metadata for the 19 parameters — i18n keys, ranges, units, step sizes.
 */

import type { InfraWheelParams } from '../types';
import type { TranslationKey } from './i18n';

export interface ParamDef {
  node: keyof InfraWheelParams;
  key: string;
  labelKey: TranslationKey;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export interface NodeGroup {
  node: keyof InfraWheelParams;
  labelKey: TranslationKey;
  color: string;
  params: ParamDef[];
}

export const NODE_GROUPS: NodeGroup[] = [
  {
    node: 'silicon',
    labelKey: 'node.silicon',
    color: '#6366f1',
    params: [
      { node: 'silicon', key: 'bwMemory', labelKey: 'param.bwMemory', unit: 'GB/Q', min: 20, max: 120, step: 1 },
      { node: 'silicon', key: 'capMemory', labelKey: 'param.capMemory', unit: 'TB/Q', min: 50, max: 2000, step: 10 },
      { node: 'silicon', key: 'packaging', labelKey: 'param.packaging', unit: 'K wafers/Q', min: 30, max: 200, step: 1 },
    ],
  },
  {
    node: 'energy',
    labelKey: 'node.energy',
    color: '#f59e0b',
    params: [
      { node: 'energy', key: 'deliverablePower', labelKey: 'param.deliverablePower', unit: 'GW', min: 15, max: 80, step: 1 },
      { node: 'energy', key: 'leadTime', labelKey: 'param.leadTime', unit: 'months', min: 12, max: 60, step: 1 },
      { node: 'energy', key: 'computeDensity', labelKey: 'param.computeDensity', unit: 'PFLOPS/MW', min: 5, max: 50, step: 1 },
    ],
  },
  {
    node: 'hyperscaleDC',
    labelKey: 'node.hyperscaleDC',
    color: '#3b82f6',
    params: [
      { node: 'hyperscaleDC', key: 'bisectionBW', labelKey: 'param.bisectionBW', unit: 'Tbps', min: 10, max: 200, step: 1 },
      { node: 'hyperscaleDC', key: 'utilization', labelKey: 'param.utilization', unit: '%', min: 30, max: 75, step: 1 },
    ],
  },
  {
    node: 'spatialCompute',
    labelKey: 'node.spatialCompute',
    color: '#14b8a6',
    params: [
      { node: 'spatialCompute', key: 'deploymentRate', labelKey: 'param.deploymentRate', unit: '%', min: 0, max: 60, step: 1 },
      { node: 'spatialCompute', key: 'perNodeTOPS', labelKey: 'param.perNodeTOPS', unit: 'TOPS', min: 50, max: 2000, step: 10 },
    ],
  },
  {
    node: 'intelligence',
    labelKey: 'node.intelligence',
    color: '#a855f7',
    params: [
      { node: 'intelligence', key: 'algorithmicEfficiency', labelKey: 'param.algorithmicEfficiency', unit: 'index', min: 100, max: 2000, step: 10 },
      { node: 'intelligence', key: 'transferRatio', labelKey: 'param.transferRatio', unit: '%', min: 10, max: 80, step: 1 },
    ],
  },
  {
    node: 'digitalAI',
    labelKey: 'node.digitalAI',
    color: '#ec4899',
    params: [
      { node: 'digitalAI', key: 'revenueGrowth', labelKey: 'param.revenueGrowth', unit: '% YoY', min: 15, max: 80, step: 1 },
      { node: 'digitalAI', key: 'grossMargin', labelKey: 'param.grossMargin', unit: '%', min: 20, max: 75, step: 1 },
    ],
  },
  {
    node: 'physicalAI',
    labelKey: 'node.physicalAI',
    color: '#10b981',
    params: [
      { node: 'physicalAI', key: 'fleetDeployment', labelKey: 'param.fleetDeployment', unit: 'K units', min: 10, max: 2000, step: 10 },
      { node: 'physicalAI', key: 'unitEconomics', labelKey: 'param.unitEconomics', unit: 'rev/cost', min: 0.2, max: 1.5, step: 0.05 },
    ],
  },
  {
    node: 'capital',
    labelKey: 'node.capital',
    color: '#ef4444',
    params: [
      { node: 'capital', key: 'reinvestRatio', labelKey: 'param.reinvestRatio', unit: '%', min: 15, max: 50, step: 1 },
      { node: 'capital', key: 'policyCAPEX', labelKey: 'param.policyCAPEX', unit: '$B/yr', min: 0, max: 80, step: 1 },
    ],
  },
];
