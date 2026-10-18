/**
 * InfraWheel Simulator — Default parameters & configuration
 * Base Case 2026Q4 (model v2.2 quarterly recalibration, 2026-10-18).
 * (est.) = estimate; sources in infrawheel-model.md §Calibration log.
 */

import type { InfraWheelParams, SimulationConfig } from './types';

/** Base Case 2026Q4 parameters */
export const DEFAULT_PARAMS: InfraWheelParams = {
  silicon: {
    bwMemory: 95,         // HBM4 양산(삼성 풀가동), 2027년까지 공급제약·완판 (TrendForce 9/29, Micron 9/30)
    capMemory: 600,       // 서버 DRAM·eSSD 4Q 계약가 +10~20%, "수급 균형 시계 없음" (est.)
    packaging: 130,       // TSMC CoWoS 2026말 ~130K/월, 2028말 ~260K 목표 (TrendForce 9/14)
  },
  energy: {
    deliverablePower: 42, // AI DC 온라인 전력 2026말 38~44GW 추정치 중간 (Epoch 등, est.)
    leadTime: 38,         // GE Vernova 가스터빈 백로그 116GW·납기 2031 — 가중평균 상승 (est.)
    computeDensity: 22,   // 설치 기반은 아직 블랙웰 중심, 루빈은 4Q부터 양산 램프 (est.)
  },
  intelligence: {
    algorithmicEfficiency: 280, // 고정 능력당 가격 연 50배↓(Epoch), 딥시크 V4.1 플래시 등 — 보수적 유효치 (est.)
    transferRatio: 52,          // 최상위 오픈모델이 프론티어의 ~80%, 소형·엣지 모델은 그 아래 (est.)
  },
  capital: {
    reinvestRatio: 65,    // 빅4 2026 CAPEX $735~750B ≈ 영업현금흐름의 ~90%, AI 비중 70~75% 적용
    policyCAPEX: 40,      // 소버린 AI 컴퓨트 한정 ~$40B (한국 2027 AI예산 9.4조 등, est.)
    costOfCapital: 8.5,   // 혼합 조달금리: 하이퍼스케일러 IG ~6.5~7%(국채10년 5.1~5.2%) · 오라클 장기채 8%+ ·
                          // 앤트로픽 칩금융 10%+(블랙스톤) · 코어위브 2032년물 15% 가중 (est.)
  },
  hyperscaleDC: {
    bisectionBW: 90,      // 1.6T 트랜시버 확산, 루빈 CX-9 1.6T·NVLink6 (CPO는 아직 초기, est.)
    utilization: 45,      // 학습 MFU 35~50%, 수요>공급으로 배분은 빡빡 (est.)
  },
  digitalAI: {
    revenueGrowth: 65,    // 앤트로픽 3Q 매출 +45% QoQ, 오픈AI 런레이트 ~$70B, 구글클라우드 +82%·애저 +43%
    grossMargin: 48,      // 앤트로픽 컴퓨트 $1당 매출 $1.7(≈41%), 오픈AI ~33% · 가격전쟁 (est.)
    demandElasticity: 1.0, // 단위탄력(중립). >1 제번스 반등, <1 가격붕괴 우세
  },
  spatialCompute: {
    deploymentRate: 2,    // GPU형 AI-RAN은 2026말 파일럿·2027 상용·2028 대량 (노키아/엔비디아 7/15)
    perNodeTOPS: 400,     // 엣지 NPU 진전 (Jetson Thor 1,035 TOPS 등, est.)
  },
  physicalAI: {
    fleetDeployment: 75,  // 로보택시(웨이모 4천+대 등)·휴머노이드·AI 통합 로봇 (정의 의존, est.)
    unitEconomics: 0.40,  // 웨이모 0.6~0.8, 휴머노이드·초기 AMR이 끌어내림 (est.)
  },
};

export const DEFAULT_CONFIG: SimulationConfig = {
  startQuarter: '2026Q4',         // v2.2: 시뮬레이션은 "지금"에서 시작 — 1년 뒤/3년 뒤 병목 전망의 기준점
  endQuarter: '2036Q3',           // 40분기 = 10년
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
  digitalAIInitialRevenue: 35,    // $35B/Q 앵커 (⑤ 천장과 연동)
  digitalRevenuePerInferenceUnit: 1.5, // ⑤ 유효 추론용량 천장 환산계수
  marginAlgoCoeff: 5,             // F: algo효율 index 1.0↑당 마진 +5pp (Base 앵커 기준)
  neutralCostOfCapital: 6.0,      // v2.2: 2024~25년 수준 혼합 조달금리 — 자금이 제약이 아닌 "정상" 금리 (est.)
  capitalCostElasticity: 1.0,     // v2.2: 재투자 × (6/C3)^1 — C3 8.5%면 ×0.71
  capitalBottleneckElasticity: 2.0, // v2.2: 자본 노드 부채감당력 (6/C3)^2
  selfFundingCap: 50,             // v2.2: 영업현금흐름의 50%까지는 자체 조달, 넘으면 외부 자본 필요 (est.)
  capitalStressHalfLifeQ: 6,      // v2.2: 신용 경색 반감기 1.5년 (2015~16 하이일드·2022 긴축 사례 기준 가정)
  spatialRolloutPath: [           // v2.2: 통신사 AI-RAN 로드맵이 요구하는 배포율 (% of metro BS, est.)
    [0, 2], [1, 4], [2, 8], [4, 15], [7, 30], [10, 40],
  ],
  dataRetention: 0.5,             // 산출의 절반이 저장·색인·재사용됨
  dataDecayQ: 0.02,               // 분기 2% 삭제·노후화
  physicalAITaskThreshold: 50,
  physicalAILatencyThreshold: 10,
};
