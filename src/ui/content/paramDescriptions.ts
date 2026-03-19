/**
 * Parameter tooltip content — descriptions, range rationale, sources, confidence.
 * Tone: "그래서 투자에 무슨 의미?" — every description ends with impact on timeline.
 */

import type { Locale } from '../i18n';

export type Confidence = 'high' | 'medium' | 'low';

export interface ParamDescription {
  description: string;
  range: string;
  source: string;
  confidence: Confidence;
}

type ParamDescMap = Record<string, ParamDescription>;

const ko: ParamDescMap = {
  // ── Silicon ──
  bwMemory: {
    description:
      '고대역폭 메모리(HBM 등) 공급량. 이 값이 부족하면 대형 AI 모델 학습이 지연되고, GPU가 있어도 출하할 수 없습니다. 슬라이더를 줄여보면 하류 전체가 위축되는 걸 타임라인에서 확인할 수 있습니다.',
    range: '20~120 GB/Q (현재 주요 3사 합산 분기 출하 기준)',
    source: 'SK하이닉스·Samsung·Micron 분기 실적, TrendForce',
    confidence: 'high',
  },
  capMemory: {
    description:
      '추론 서빙·컨텍스트 저장·엣지 배포에 쓰이는 이질적 메모리 풀(SRAM, LPDDR, NAND). 배포 가능한 AI 인스턴스 수와 context length를 결정합니다. 이 값을 올리면 Spatial 루프 쪽 영향이 큽니다.',
    range: '50~2,000 TB/Q (AI 서버 출하량 × 평균 메모리 탑재량)',
    source: 'Gartner/IDC 서버 시장 데이터, 서버용 DRAM/NAND 출하 통계',
    confidence: 'medium',
  },
  packaging: {
    description:
      'CoWoS·FOWLP 등 어드밴스드 패키징 처리량. 메모리가 충분해도 bonding 못 하면 칩 출하 불가 — 물리적 상한. TSMC·Samsung 듀오폴리로 18-24개월 리드타임. 이 병목이 풀리면 다음 병목(메모리)으로 이동합니다.',
    range: '30~200K wafers/Q (CoWoS + FOWLP 월간 캐파 × 3)',
    source: 'TSMC·Samsung Foundry 실적 발표, 업계 캐파 추정',
    confidence: 'medium',
  },

  // ── Energy ──
  deliverablePower: {
    description:
      '발전 능력이 아닌 실제 DC에 연결된 전력. 송전 제약, 인허가, 변전소 포함. AI DC 전력 수요가 공급을 초과하면 Hyperscale 루프 전체가 정체됩니다.',
    range: '15~80 GW (글로벌 AI DC 연결 전력 추정)',
    source: 'IEA Data Centre Energy Tracker, US EIA, 한전 전력통계',
    confidence: 'medium',
  },
  leadTime: {
    description:
      '전력 인프라 CAPEX 집행부터 실제 전력 공급까지 걸리는 시간. 이 값이 길수록 InfraWheel 전체의 가속이 느려집니다. 에너지원(가스·태양광·SMR·원전)마다 리드타임이 다르며, 혁신 기술이 등장하면 이 값이 급격히 줄 수 있습니다.',
    range: '12~60개월 (가스 피커 12-18mo ~ 원전 재가동 36-48mo 가중 평균)',
    source: 'FERC interconnection queue, IEA, 산업 보고서',
    confidence: 'medium',
  },
  computeDensity: {
    description:
      'MW당 AI 연산 성능. 냉각 기술(공랭→액냉→침지)과 칩 전력 효율에 의해 결정. 같은 GW에서 더 많은 compute를 뽑아냄. 이 값이 오르면 에너지 병목을 부분적으로 우회할 수 있습니다.',
    range: '5~50 PFLOPS/MW (DC IT load ÷ 총 전력 × chip FLOPS/W)',
    source: '상위 DC 사업자 PUE 공시, 랙 밀도 보고서',
    confidence: 'medium',
  },

  // ── Hyperscale DC ──
  bisectionBW: {
    description:
      'DC 내부 네트워크 대역폭. 대규모 학습은 communication-bound — AllReduce 등 collective operation이 fabric 포화 시 stall. 광트랜시버 세대(400G→800G→1.6T) 전환이 step-function 개선을 만듭니다.',
    range: '10~200 Tbps/cluster (최대 공개 클러스터 bisection BW 기준)',
    source: 'NVIDIA·Broadcom 실적, LightCounting 광트랜시버 출하 데이터',
    confidence: 'medium',
  },
  utilization: {
    description:
      '배포된 GPU 중 실제 유용한 작업 비율(MFU). 현재 대형 학습 30-45%. Communication overhead, pipeline bubble, fault recovery로 손실. MFU가 35%→65%면 칩 추가 없이 유효 compute가 거의 2배 — "숨은 CAPEX".',
    range: '30~75% (MLPerf 최고 MFU + 실무 추정 할인)',
    source: 'MLPerf Training 결과, hyperscaler 공시',
    confidence: 'low',
  },

  // ── Spatial Compute ──
  deploymentRate: {
    description:
      'AI 추론 가능 하드웨어가 장착된 도시 기지국 비율. 이 값이 30%를 넘고 노드 성능이 충분하면 Physical AI 활성화 조건이 충족됩니다. 한국은 기지국 밀도 세계 최고 수준이라 같은 비율이라도 커버리지 밀도가 높습니다.',
    range: '0~60% (주요 통신사 AI-RAN 기지국 / 전체 도시 기지국)',
    source: '통신사 공시, GSMA Intelligence, 3GPP 표준화 진행',
    confidence: 'low',
  },
  perNodeTOPS: {
    description:
      '각 spatial 노드의 연산력. LPDDR 기반 가속기, 모바일 SoC NPU 등. 전력 제약(10-100kW/node)으로 TOPS/W가 raw throughput보다 중요. 이 값과 배포율이 함께 올라야 latency가 10ms 이하로 떨어집니다.',
    range: '50~2,000 TOPS/node (상용 AI-RAN 노드 대표 스펙)',
    source: 'Edge AI chip 벤치마크, 통신장비 스펙 시트',
    confidence: 'medium',
  },

  // ── Intelligence ──
  algorithmicEfficiency: {
    description:
      '단위 FLOP당 유용한 산출량. 아키텍처 혁신, 학습 레시피, 추론 최적화를 포함. 하드웨어 투자 없이 양쪽 루프를 모두 가속하는 순수 SW 레버. 스케일링 법칙 논쟁이 여기에 위치합니다.',
    range: '100~2,000 (base=100, 동일 벤치마크 달성 FLOPS 감소율 지수화)',
    source: 'Stanford AI Index, Epoch AI compute tracking',
    confidence: 'medium',
  },
  transferRatio: {
    description:
      'Frontier 모델 능력의 몇 %가 엣지 크기로 압축 후 유지되는지. Distillation, quantization, 소형 아키텍처(Phi, Gemma). 이 값이 두 루프의 시간차를 결정하는 가장 흥미로운 변수입니다.',
    range: '10~80% (7B-class best / frontier best score)',
    source: 'Open LLM Leaderboard, 주요 소형 모델 벤치마크',
    confidence: 'high',
  },

  // ── Digital AI ──
  revenueGrowth: {
    description:
      'AI SW/서비스 매출 성장률. Enterprise SaaS 대체(느린 채택, 고ARPU)와 AI-native 창조(바이럴, 저ARPU×대볼륨)의 합산. B2C가 선행, Enterprise가 후행합니다.',
    range: '15~80% YoY (글로벌 AI SW/서비스 매출 YoY)',
    source: 'Synergy Research, IDC AI 시장 전망, 상위 AI 기업 실적',
    confidence: 'medium',
  },
  grossMargin: {
    description:
      'AI 서비스 매출총이익률. 전통 SaaS 70-80% 대비 AI 서비스는 compute cost가 높아 마진이 낮음. 60%를 넘으면 Hyperscale 루프가 자생적으로 가속하는 변곡점입니다.',
    range: '20~75% (AI-specific 세그먼트 공시 마진 가중 평균)',
    source: 'OpenAI/Anthropic 추정, Microsoft AI·Google Cloud 세그먼트',
    confidence: 'low',
  },

  // ── Physical AI ──
  fleetDeployment: {
    description:
      '누적 배포된 AI 물리 시스템(산업 로봇, AMR, 휴머노이드, 자율주행). 각 unit이 매출원이자 데이터 생성기. S-curve 성장이며, 물류 AMR이 선행, 휴머노이드는 초기 단계입니다.',
    range: '10~2,000K units (IFR 산업·서비스 로봇 + AV fleet, AI-integrated만)',
    source: 'IFR World Robotics, 자율주행 fleet 추적',
    confidence: 'medium',
  },
  unitEconomics: {
    description:
      '연간 unit 수익 ÷ 취득 비용. 0.33 초과(payback < 3년)이면 빠른 확산, 1.0 초과(payback < 1년)이면 폭발적 배포. RaaS 모델도 포함합니다.',
    range: '0.2~1.5 (대표 섹터별 평균)',
    source: '개별 기업 case study, 산업 ROI 보고서',
    confidence: 'low',
  },

  // ── Capital ──
  reinvestRatio: {
    description:
      '영업현금흐름의 AI 인프라 재투자 비율. 바퀴의 스로틀. 현 hyperscaler CAPEX/Revenue 25-35%. 이 비율이 높으면 바퀴가 빨리 돌고, 낮으면 느려집니다.',
    range: '15~50% (Big 4 AI CAPEX / AI-attributed revenue)',
    source: 'Microsoft·Google·Amazon·Meta 분기 실적 CAPEX guidance',
    confidence: 'high',
  },
  policyCAPEX: {
    description:
      '시장 외부 자본: 정부 보조금, 국부펀드, 국가 AI 전략 예산. 매출 없이도 바퀴를 돌릴 수 있는 "시동 모터". 한국 반도체 인센티브, US CHIPS Act, 중동 sovereign AI가 대표적.',
    range: '0~80 $B/yr (주요국 AI 관련 정부 지출 합산)',
    source: '각국 정부 예산안, CHIPS Act 집행 현황, 산업부 공시',
    confidence: 'high',
  },
};

const en: ParamDescMap = {
  // ── Silicon ──
  bwMemory: {
    description:
      'High-bandwidth memory (HBM etc.) supply. When insufficient, large AI model training stalls — GPUs exist but can\'t ship. Drag this slider down and watch the entire downstream shrink in the timeline.',
    range: '20–120 GB/Q (top 3 suppliers combined quarterly shipment)',
    source: 'SK hynix, Samsung, Micron quarterly earnings; TrendForce',
    confidence: 'high',
  },
  capMemory: {
    description:
      'Heterogeneous memory pool for inference serving, context storage, and edge deployment (SRAM, LPDDR, NAND). Determines deployable AI instances × context length. Raising this disproportionately boosts the Spatial loop.',
    range: '50–2,000 TB/Q (AI server shipments × avg memory per server)',
    source: 'Gartner/IDC server market data, server DRAM/NAND shipment stats',
    confidence: 'medium',
  },
  packaging: {
    description:
      'Advanced packaging throughput (CoWoS, FOWLP). Even with enough memory, chips can\'t ship without bonding — a hard physical ceiling. TSMC–Samsung duopoly with 18-24 month lead times. When this bottleneck clears, the next one (memory) takes over.',
    range: '30–200K wafers/Q (CoWoS + FOWLP monthly capa × 3)',
    source: 'TSMC, Samsung Foundry earnings calls; industry capa estimates',
    confidence: 'medium',
  },

  // ── Energy ──
  deliverablePower: {
    description:
      'Not generation capacity but actual power connected to DCs. Includes transmission constraints, permitting, and substations. When AI DC demand exceeds supply, the entire Hyperscale loop stalls.',
    range: '15–80 GW (global AI DC connected power estimate)',
    source: 'IEA Data Centre Energy Tracker, US EIA, KEPCO stats',
    confidence: 'medium',
  },
  leadTime: {
    description:
      'Time from power infra CAPEX commitment to actual delivery. Longer = slower InfraWheel acceleration. Different energy sources have wildly different timelines. A breakthrough technology can slash this dramatically.',
    range: '12–60 months (gas peaker 12-18mo to nuclear restart 36-48mo weighted avg)',
    source: 'FERC interconnection queue, IEA, industry reports',
    confidence: 'medium',
  },
  computeDensity: {
    description:
      'AI compute per MW. Driven by cooling tech (air→liquid→immersion) and chip power efficiency. Higher values let you extract more compute from the same GW — a partial bypass around energy bottlenecks.',
    range: '5–50 PFLOPS/MW (DC IT load ÷ total power × chip FLOPS/W)',
    source: 'Top DC operators PUE disclosures, rack density reports',
    confidence: 'medium',
  },

  // ── Hyperscale DC ──
  bisectionBW: {
    description:
      'DC internal network bandwidth. Large-scale training is communication-bound — collective ops stall when fabric saturates. Optical transceiver generational shifts (400G→800G→1.6T) create step-function improvements.',
    range: '10–200 Tbps/cluster (largest public cluster bisection BW)',
    source: 'NVIDIA, Broadcom earnings; LightCounting transceiver shipment data',
    confidence: 'medium',
  },
  utilization: {
    description:
      'Fraction of deployed GPUs doing useful work (MFU). Currently 30-45% for large training. Lost to communication overhead, pipeline bubbles, fault recovery. Going from 35%→65% nearly doubles effective compute with zero additional chips — "hidden CAPEX."',
    range: '30–75% (MLPerf top MFU + practical discount)',
    source: 'MLPerf Training results, hyperscaler disclosures',
    confidence: 'low',
  },

  // ── Spatial Compute ──
  deploymentRate: {
    description:
      'Fraction of metro base stations equipped with AI inference hardware. Above ~30% with sufficient per-node capacity, Physical AI activation conditions are met. Korea\'s world-leading base station density means the same % yields higher coverage density.',
    range: '0–60% (AI-RAN base stations / total metro BS by major telcos)',
    source: 'Telco disclosures, GSMA Intelligence, 3GPP standardization progress',
    confidence: 'low',
  },
  perNodeTOPS: {
    description:
      'Compute capacity per spatial node. LPDDR-based accelerators, mobile SoC NPUs. Power-constrained (10-100kW/node) so TOPS/W matters more than raw throughput. This plus deployment rate together determine if latency drops below 10ms.',
    range: '50–2,000 TOPS/node (commercial AI-RAN node representative specs)',
    source: 'Edge AI chip benchmarks, telecom equipment spec sheets',
    confidence: 'medium',
  },

  // ── Intelligence ──
  algorithmicEfficiency: {
    description:
      'Useful output per FLOP. Encompasses architecture innovations, training recipes, and inference optimization. The pure SW lever that accelerates both loops without hardware investment. The scaling law debate lives here.',
    range: '100–2,000 (base=100, indexed by FLOPS reduction for same benchmark)',
    source: 'Stanford AI Index, Epoch AI compute tracking',
    confidence: 'medium',
  },
  transferRatio: {
    description:
      'What % of frontier model capability survives compression to edge size. Distillation, quantization (INT4/INT2), small architectures (Phi, Gemma). The most interesting variable — it determines the time gap between the two loops.',
    range: '10–80% (7B-class best / frontier best score)',
    source: 'Open LLM Leaderboard, small model benchmarks',
    confidence: 'high',
  },

  // ── Digital AI ──
  revenueGrowth: {
    description:
      'Blended AI SW/services revenue growth. Enterprise SaaS displacement (slow adoption, high ARPU) + AI-native creation (viral, low ARPU × high volume). B2C leads, Enterprise follows.',
    range: '15–80% YoY (global AI SW/services revenue growth)',
    source: 'Synergy Research, IDC AI market forecasts, top AI company earnings',
    confidence: 'medium',
  },
  grossMargin: {
    description:
      'AI service gross margin. Traditional SaaS runs 70-80%, but AI services have real compute costs. Above 60% is the inflection point where the Hyperscale loop becomes self-sustaining.',
    range: '20–75% (AI-specific segment disclosed margins, weighted avg)',
    source: 'OpenAI/Anthropic estimates, Microsoft AI, Google Cloud segments',
    confidence: 'low',
  },

  // ── Physical AI ──
  fleetDeployment: {
    description:
      'Cumulative deployed AI physical systems (industrial robots, AMRs, humanoids, AVs). Each unit is both a revenue source and data generator. S-curve growth — warehouse AMRs lead, humanoids are early stage.',
    range: '10–2,000K units (IFR industrial + service robots + AV fleet, AI-integrated only)',
    source: 'IFR World Robotics, autonomous fleet tracking',
    confidence: 'medium',
  },
  unitEconomics: {
    description:
      'Annual unit revenue ÷ acquisition cost. Above 0.33 (payback < 3yr) = rapid scaling. Above 1.0 (payback < 1yr) = explosive deployment. Includes RaaS models.',
    range: '0.2–1.5 (representative sector averages)',
    source: 'Individual company case studies, industry ROI reports',
    confidence: 'low',
  },

  // ── Capital ──
  reinvestRatio: {
    description:
      'Share of operating cash flow reinvested in AI infrastructure. The flywheel\'s throttle. Current hyperscaler CAPEX/Revenue runs 25-35%. Higher = faster wheel, lower = slower.',
    range: '15–50% (Big 4 AI CAPEX / AI-attributed revenue)',
    source: 'Microsoft, Google, Amazon, Meta quarterly CAPEX guidance',
    confidence: 'high',
  },
  policyCAPEX: {
    description:
      'Capital from outside the market: government subsidies, sovereign wealth funds, national AI strategy budgets. The "starter motor" that spins the wheel without market revenue. Korea semiconductor incentives, US CHIPS Act, Middle East sovereign AI.',
    range: '0–80 $B/yr (major countries AI-related government spending combined)',
    source: 'National budget proposals, CHIPS Act execution status, industry ministry disclosures',
    confidence: 'high',
  },
};

const dictionaries: Record<Locale, ParamDescMap> = { ko, en };

export function getParamDescription(key: string, locale: Locale): ParamDescription | undefined {
  return dictionaries[locale][key];
}
