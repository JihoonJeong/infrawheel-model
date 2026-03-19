/**
 * Node descriptions for diagram click popovers.
 * Tone: practical investor perspective, not academic.
 */

import type { Locale } from '../i18n';

export interface NodeDescription {
  name: string;
  role: string;
  transition: string;
  paramKeys: string[];
}

type NodeDescMap = Record<string, NodeDescription>;

const ko: NodeDescMap = {
  silicon: {
    name: '실리콘',
    role: 'AI 연산의 물리적 기반. GPU가 아니라 메모리와 패키징이 진짜 병목입니다. BW 메모리는 모델 크기의 천장, Capacity 메모리는 배포 규모를 결정합니다.',
    transition: '→ Energy: compute 증가 → 전력 수요 증가. 수요 > 공급 시 Energy가 병목.',
    paramKeys: ['bwMemory', 'capMemory', 'packaging'],
  },
  energy: {
    name: '에너지',
    role: 'AI를 굴리는 연료. 발전 능력이 아니라 실제 DC에 전달 가능한 전력이 핵심. 리드타임이 길수록 바퀴 전체의 가속이 느려집니다.',
    transition: '→ Hyperscale DC / Spatial Compute: 전력이 두 인프라 경로로 분기.',
    paramKeys: ['deliverablePower', 'leadTime', 'computeDensity'],
  },
  hyperscale: {
    name: '하이퍼스케일 DC',
    role: '깊이의 엔진. 칩과 전력을 받아 유효 compute로 변환하는 효율의 문제. 인터커넥트 대역폭과 GPU 활용률이 변환 효율을 결정합니다.',
    transition: '→ Intelligence: 유효 학습/추론 FLOPS → 모델 frontier 진전 속도.',
    paramKeys: ['bisectionBW', 'utilization'],
  },
  spatial: {
    name: '스페이셜 컴퓨트',
    role: '넓이의 엔진. AI-RAN 기지국을 통해 물리 공간 전체에 추론 능력을 입힘. 배포 밀도 × 노드당 성능이 Physical AI 활성화 조건을 결정합니다.',
    transition: '→ Intelligence: 분산 추론 throughput × coverage = real-world AI 접근성.',
    paramKeys: ['deploymentRate', 'perNodeTOPS'],
  },
  intelligence: {
    name: '인텔리전스',
    role: '두 엔진이 만나는 곳. 알고리즘 효율은 양쪽 루프를 모두 가속하고, Frontier→Edge 전달율은 Spatial 루프를 추가로 가속합니다.',
    transition: '→ Digital AI: cloud inference cost가 revenue/query 이하면 확장. → Physical AI: edge capability + spatial latency 이중 키.',
    paramKeys: ['algorithmicEfficiency', 'transferRatio'],
  },
  digital: {
    name: '디지털 AI',
    role: 'Hyperscale 루프의 매출 엔진. SaaS 대체 + AI-native 창조 경제. Gross margin이 60%를 넘으면 루프가 자생적으로 가속합니다.',
    transition: '→ Capital: Revenue × Gross margin → 재투자 가능 현금.',
    paramKeys: ['revenueGrowth', 'grossMargin'],
  },
  physical: {
    name: '피지컬 AI',
    role: 'Spatial 루프의 매출 엔진. 로봇·자율주행·스마트 인프라의 실물경제 매출. Unit economics가 payback 3년(ratio > 0.33)을 넘으면 배포가 폭발합니다.',
    transition: '→ Capital: Fleet × Revenue/unit → 실물경제 매출 = 기술 침체에 강한 수입원.',
    paramKeys: ['fleetDeployment', 'unitEconomics'],
  },
  capital: {
    name: '캐피탈',
    role: '바퀴의 연료. 매출에서 나온 현금을 다시 Silicon으로 재투자하는 관절. 재투자 비율이 바퀴의 스로틀이고, 정책 CAPEX가 외부 부스터입니다.',
    transition: '→ Silicon: CAPEX → 6-18개월 시차 후 칩 공급 증가. Boom-bust oscillation의 구조적 원인.',
    paramKeys: ['reinvestRatio', 'policyCAPEX'],
  },
};

const en: NodeDescMap = {
  silicon: {
    name: 'Silicon',
    role: 'The physical foundation of AI compute. Not GPUs but memory and packaging are the real bottlenecks. BW memory sets the ceiling on model size; capacity memory determines deployment scale.',
    transition: '→ Energy: more compute → more power demand. When demand > supply, Energy becomes the bottleneck.',
    paramKeys: ['bwMemory', 'capMemory', 'packaging'],
  },
  energy: {
    name: 'Energy',
    role: 'The fuel that powers AI. Not generation capacity but actual power delivered to DCs. Longer lead times = slower acceleration of the entire wheel.',
    transition: '→ Hyperscale DC / Spatial Compute: power forks into two infrastructure paths.',
    paramKeys: ['deliverablePower', 'leadTime', 'computeDensity'],
  },
  hyperscale: {
    name: 'Hyperscale DC',
    role: 'The engine of depth. Converts chips + power into effective compute. Interconnect bandwidth and GPU utilization determine conversion efficiency.',
    transition: '→ Intelligence: effective training/inference FLOPS → model frontier advancement speed.',
    paramKeys: ['bisectionBW', 'utilization'],
  },
  spatial: {
    name: 'Spatial Compute',
    role: 'The engine of reach. Blankets physical space with inference via AI-RAN base stations. Deployment density × per-node capacity determines Physical AI activation.',
    transition: '→ Intelligence: distributed inference throughput × coverage = real-world AI access.',
    paramKeys: ['deploymentRate', 'perNodeTOPS'],
  },
  intelligence: {
    name: 'Intelligence',
    role: 'Where both engines meet. Algorithmic efficiency accelerates both loops; frontier-to-edge transfer ratio additionally accelerates the Spatial loop.',
    transition: '→ Digital AI: when cloud inference cost < revenue/query → scale. → Physical AI: dual-key gate (edge capability + spatial latency).',
    paramKeys: ['algorithmicEfficiency', 'transferRatio'],
  },
  digital: {
    name: 'Digital AI',
    role: 'Revenue engine of the Hyperscale loop. SaaS displacement + AI-native creative economy. When gross margin exceeds 60%, the loop becomes self-sustaining.',
    transition: '→ Capital: Revenue × Gross margin → reinvestable cash flow.',
    paramKeys: ['revenueGrowth', 'grossMargin'],
  },
  physical: {
    name: 'Physical AI',
    role: 'Revenue engine of the Spatial loop. Real-economy revenue from robots, AVs, smart infrastructure. When unit economics exceed 0.33 (payback < 3yr), deployment explodes.',
    transition: '→ Capital: Fleet × Revenue/unit → real-economy revenue = recession-resilient income.',
    paramKeys: ['fleetDeployment', 'unitEconomics'],
  },
  capital: {
    name: 'Capital',
    role: 'The fuel of the wheel. Reinvests cash from applications back into Silicon. Reinvestment ratio is the throttle; policy CAPEX is the external booster.',
    transition: '→ Silicon: CAPEX → 6-18 month lag → chip supply increase. The structural cause of boom-bust oscillation.',
    paramKeys: ['reinvestRatio', 'policyCAPEX'],
  },
};

const dictionaries: Record<Locale, NodeDescMap> = { ko, en };

export function getNodeDescription(nodeId: string, locale: Locale): NodeDescription | undefined {
  return dictionaries[locale][nodeId];
}
