import type { TranslationKey } from './en';

export const ko: Record<TranslationKey, string> = {
  // Header
  appTitle: 'InfraWheel 시뮬레이터',
  phaseBadge: 'Phase 2 프리뷰',
  langToggle: 'EN',

  // Parameter panel
  parameters: '파라미터',
  reset: '초기화',

  // Node groups
  'node.silicon': '실리콘',
  'node.energy': '에너지',
  'node.hyperscaleDC': '하이퍼스케일 DC',
  'node.spatialCompute': '스페이셜 컴퓨트',
  'node.intelligence': '인텔리전스',
  'node.digitalAI': '디지털 AI',
  'node.physicalAI': '피지컬 AI',
  'node.capital': '캐피탈',

  // Silicon params
  'param.bwMemory': 'BW 메모리 공급',
  'param.capMemory': '용량 메모리 풀',
  'param.packaging': '패키징 처리량',

  // Energy params
  'param.deliverablePower': '공급 가능 전력',
  'param.leadTime': '파이프라인 리드타임',
  'param.computeDensity': '컴퓨트 밀도',

  // Hyperscale DC params
  'param.bisectionBW': 'Bisection 대역폭',
  'param.utilization': '가동률',

  // Spatial Compute params
  'param.deploymentRate': 'AI-RAN 배포율',
  'param.perNodeTOPS': '노드당 연산력',

  // Intelligence params
  'param.algorithmicEfficiency': '알고리즘 효율',
  'param.transferRatio': 'Frontier→Edge 전이율',

  // Digital AI params
  'param.revenueGrowth': '매출 성장률',
  'param.grossMargin': '매출총이익률',

  // Physical AI params
  'param.fleetDeployment': '플릿 배포',
  'param.unitEconomics': '유닛 이코노믹스',

  // Capital params
  'param.reinvestRatio': '재투자 비율',
  'param.policyCAPEX': '정책 CAPEX',

  // Timeline chart
  timelineProjection: '타임라인 프로젝션',

  // Metrics
  'metric.totalRevenue': '총 AI 매출 ($B/Q)',
  'metric.totalCAPEX': '총 CAPEX ($B/Q)',
  'metric.bottleneckRatio': '병목 비율',
  'metric.digitalRevenue': '디지털 AI 매출 ($B/Q)',
  'metric.physicalRevenue': '피지컬 AI 매출 ($B/Q)',
  'metric.hyperscaleEffective': '하이퍼스케일 유효 컴퓨트',
  'metric.spatialEffective': '스페이셜 유효 컴퓨트',
  'metric.frontierCapability': '프론티어 능력',
  'metric.confidence': '시장 신뢰도',

  // Diagram
  infrawheel: 'InfraWheel',
  bottleneck: '병목',
  bottleneckRatioLabel: '병목 비율',
  confidenceLabel: '신뢰도',
  hyperscaleLoop: '하이퍼스케일 루프',
  spatialLoop: '스페이셜 루프',
  physicalAIStatus: '피지컬 AI',
  active: '활성',
  inactive: '비활성',

  // Diagram nodes (wheel)
  'wheel.silicon': '실리콘',
  'wheel.energy': '에너지',
  'wheel.hyperscale': '하이퍼스케일',
  'wheel.spatial': '스페이셜',
  'wheel.intelligence': '인텔리전스',
  'wheel.digital': '디지털 AI',
  'wheel.physical': '피지컬 AI',
  'wheel.capital': '캐피탈',

  // Scenarios
  scenario: '시나리오',
  'scenario.base2026': 'Base Case 2026',
  'scenario.energyBottleneck': '에너지 병목',
  'scenario.aiWinter': 'AI 겨울',
  'scenario.koreaFirstSpatial': 'Korea-first Spatial',
  'scenario.algoBreakthrough': '알고리즘 돌파',
  'scenario.memoryWall': '메모리 월',
  'scenario.physicalAITakeoff': 'Physical AI 이륙',
  'scenario.policyBoostKorea': '정책 부스트 (한국)',
};
