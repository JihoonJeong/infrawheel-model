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

  // Landing
  'landing.navSimulator': '시뮬레이터',
  'landing.eyebrow': 'AI 산업 플라이휠 시뮬레이터',
  'landing.title': 'AI 산업은 하나의 엔진입니다.\nInfraWheel이 그 회전을 보여줍니다.',
  'landing.subtitle': '실리콘에서 캐피탈까지, 19개 변수가 만드는 순환을 탐색하세요. 슬라이더를 움직이면 미래가 바뀝니다.',
  'landing.cta': '시뮬레이터 시작',
  'landing.statNodes': '노드',
  'landing.statParams': '파라미터',
  'landing.statQuarters': '분기',
  'landing.statLoops': '루프',
  'landing.loopsTitle': '두 개의 바퀴',
  'landing.hyperscaleTitle': '하이퍼스케일 루프',
  'landing.hyperscaleDesc': '이미 돌고 있는 바퀴. 대규모 데이터센터에서 AI 모델을 학습하고, 클라우드 서비스로 매출을 만드는 경로. 이미 들리는 엔진 소리.',
  'landing.spatialTitle': '스페이셜 루프',
  'landing.spatialDesc': '활성화에 접근 중인 바퀴. AI-RAN 기지국과 6G 인프라가 추론을 물리 세계로 가져옵니다 — 로봇, 자율주행, 모든 것.',
  'landing.nodesTitle': '8개의 노드, 하나의 엔진',
  'landing.nodeSilicon': '메모리와 패키징 — AI 연산의 물리적 천장.',
  'landing.nodeEnergy': '발전이 아니라 전달. 리드타임이 바퀴 속도를 결정.',
  'landing.nodeHyperscale': '칩과 전력을 유효 컴퓨트로 변환. 깊이.',
  'landing.nodeSpatial': '물리 공간 전체에 추론을 입힘. 넓이.',
  'landing.nodeIntelligence': '두 엔진이 만나는 곳. 양쪽 루프의 순수 SW 레버.',
  'landing.nodeDigital': 'SaaS 대체 + AI-native 창조. 클라우드 매출.',
  'landing.nodePhysical': '로봇, 자율주행, 스마트 인프라. 실물경제 매출.',
  'landing.nodeCapital': '현금이 다시 실리콘으로. 순환을 닫는 관절.',
  'landing.howTitle': '사용법',
  'landing.step1': '19개 파라미터를 조정하세요 — 메모리 공급, 전력 전달, 알고리즘 효율 등.',
  'landing.step2': '플라이휠이 실시간으로 반응합니다. 어떤 노드가 병목이 되는지, 신뢰도가 어떻게 변하는지 확인하세요.',
  'landing.step3': '시나리오를 탐색하세요: 에너지가 정체되면? 한국이 Spatial을 선도하면? 타임라인이 10년 앞을 보여줍니다.',
  'landing.bottomTagline': '두 루프의 시간차 — 그곳에 투자 타이밍이 있습니다.',
  'landing.footer': 'InfraWheel은 정지훈(JJ)의 저서 『하루 만에 읽는 AI 투자 지도』(한빛미디어)의 핵심 프레임워크입니다.',
  'landing.backToHome': '← 돌아가기',
};
