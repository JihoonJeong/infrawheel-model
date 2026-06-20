/**
 * InfraWheel Simulator — Default parameters & configuration
 * Base Case 2026: current trend values (tuned by Luca review)
 */

import type { InfraWheelParams, SimulationConfig } from './types';

/** Base Case 2026 parameters */
export const DEFAULT_PARAMS: InfraWheelParams = {
  silicon: {
    bwMemory: 85,         // 2026 HBM 슈퍼사이클 — HBM4 양산 진입 (Luca 재보정)
    capMemory: 550,       // AI 서버 DRAM/NAND + KV캐시·컨텍스트 메모리 수요
    packaging: 110,       // TSMC CoWoS 공격적 증설 — 여전히 binding leg
  },
  energy: {
    deliverablePower: 45, // AI DC 온라인 전력 ~40-45GW
    leadTime: 33,         // 가스 피커·비하인드미터 비중↑로 가중평균 소폭 단축
    computeDensity: 20,   // 액냉 채택, Blackwell급 효율
  },
  intelligence: {
    algorithmicEfficiency: 190, // 효율 ~8-16개월 배증, MoE·추론최적화 누적
    transferRatio: 48,          // 소형 모델이 frontier의 ~45-55% 도달
  },
  capital: {
    reinvestRatio: 40,    // Meta54·MS47·구글46·아마존25 가중 ~40%
    policyCAPEX: 30,      // 소버린 AI 확대 + CHIPS 집행
  },
  hyperscaleDC: {
    bisectionBW: 75,      // GB200 NVL72, 800G→1.6T 트랜시버
    utilization: 43,      // MFU SW 최적화 소폭 개선
  },
  digitalAI: {
    revenueGrowth: 45,    // 구글클라우드 +63%, MS AI $37B 런레이트
    grossMargin: 50,      // 추론비용 하락으로 마진 확대
  },
  spatialCompute: {
    deploymentRate: 3,    // AI-RAN 파일럿 수준 — 낮게 유지가 책 논지
    perNodeTOPS: 350,     // 엣지 NPU 진전 (퀄컴/미디어텍, LPDDR5X)
  },
  physicalAI: {
    fleetDeployment: 70,  // AI통합 산업로봇·AMR·AV 누적
    unitEconomics: 0.35,  // HW 비용 하락 + 능력 향상 (아직 <3yr 경계)
  },
};

export const DEFAULT_CONFIG: SimulationConfig = {
  startQuarter: '2025Q1',
  endQuarter: '2035Q4',
  cycleUnit: 'quarter',
  sensitivity: 0.5,
  metroBSCount: 500_000,
  hyperscaleAllocRatio: 0.7,
  requiredBW: 100,
  physicalAIOpMargin: 0.25,
  physicalAIUnitCost: 100,
  coveredAreaKm2: 50_000,         // Korea default
  capexAllocation: {
    silicon: 0.50,
    energy: 0.20,
    dc: 0.20,
    spatial: 0.10,
  },
  capexLagQuarters: 4,
  digitalAIInitialRevenue: 35,    // $35B/Q — 글로벌 AI SW/서비스 ~$140B/yr (⑤ 천장과 연동)
  digitalRevenuePerInferenceUnit: 1.5, // ⑤ 유효 추론용량 천장 환산계수 — 새 공식+base 기준 실측 튜닝
  marginAlgoCoeff: 5,             // F: algo효율 index 1.0↑당 마진 +5pp — algoBreakthrough를 마진 채널로
  physicalAITaskThreshold: 50,
  physicalAILatencyThreshold: 10,
};
