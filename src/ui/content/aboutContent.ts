/**
 * About page content — bilingual.
 */

import type { Locale } from '../i18n';

interface AboutContent {
  whatIs: { title: string; body: string };
  twoLoops: { title: string; body: string };
  howToUse: { title: string; body: string };
  equationToggle: string;
  equation: string;
  sourceToggle: string;
  footer: string;
}

const ko: AboutContent = {
  whatIs: {
    title: 'InfraWheel이란',
    body: `AI 산업은 하나의 엔진입니다.

칩이 만들어지고(Silicon), 전력이 공급되고(Energy), 데이터센터에서 학습이 이뤄지고(Hyperscale DC), AI 서비스가 매출을 만들고(Digital AI), 그 수익이 다시 칩 투자로 돌아갑니다(Capital → Silicon).

이 순환이 빨리 돌수록 AI 산업이 빠르게 성장합니다. 어느 한 곳이 막히면 전체가 느려집니다.

InfraWheel은 이 순환을 19개의 핵심 변수로 모델링한 시뮬레이터입니다. 슬라이더를 움직여서 "만약 메모리 공급이 부족하면?", "만약 정부가 대규모 투자를 하면?" 같은 질문에 대한 답을 직접 확인할 수 있습니다.`,
  },
  twoLoops: {
    title: '두 개의 바퀴',
    body: `InfraWheel에는 두 개의 루프가 있습니다.

Hyperscale 루프 (파랑): 이미 돌고 있는 바퀴. 대규모 데이터센터에서 AI 모델을 학습하고, 클라우드 서비스로 매출을 만드는 경로.

Spatial 루프 (초록): 아직 활성화 접근 중인 바퀴. AI-RAN 기지국과 6G 인프라를 통해 Physical AI(로봇, 자율주행)가 실물경제에서 매출을 만드는 경로.

두 루프의 시간차가 투자 타이밍의 핵심입니다.`,
  },
  howToUse: {
    title: '사용법',
    body: `• 좌측 패널: 19개 파라미터 슬라이더. 각 ⓘ 아이콘으로 의미를 확인하세요.
• 중앙 다이어그램: 실시간 반응. 노란색 펄스가 현재 병목 노드입니다. 클릭하면 상세 설명.
• 우측 차트: 44분기(2025~2035) 타임라인. 지표 버튼으로 표시할 메트릭을 선택합니다.
• 시나리오: 상단 드롭다운에서 프리셋 시나리오를 선택한 후 미세 조정할 수 있습니다.`,
  },
  equationToggle: 'Flywheel Equation 보기',
  equation: `// Per cycle (quarterly):

// 1. Silicon output
Training_Silicon = min(S1_BW_mem, S3_Packaging) × hyperscale_alloc_ratio
Inference_Silicon = min(S2_Cap_mem, S3_Packaging)

// 2. Energy constraint
Usable_Compute = E1_Power × E3_Density

// 3. Infrastructure conversion
Hyperscale_Effective = min(Usable_Compute_H, Training_Silicon) × min(1, H1_BW/required_BW) × H2_Util
Spatial_Effective = SC1_Deploy% × Metro_BS_Count × SC2_TOPS

// 4. Intelligence
Frontier_Capability = Hyperscale_Effective × I1_Efficiency
Edge_Capability = Frontier × I2_Transfer
Spatial_Latency = f(SC1, SC2, metroBSCount, coveredArea)  // sqrt density model

// 5. Applications
Digital_Revenue = prev_Revenue × (1 + D1_Growth%)
Physical_Active = (I2_Transfer > threshold) AND (Spatial_Latency < 10ms)
Physical_Revenue = PA1_Fleet × PA2_UnitEcon × Unit_Cost

// 6. Capital (with confidence feedback)
Bottleneck_Ratio = min(actual/potential across all nodes)
Confidence = Bottleneck_Ratio ^ sensitivity
Effective_Reinvest = C1_Reinvest% × Confidence
Total_CAPEX = (Digital_CF + Physical_CF) × Effective_Reinvest + C2_Policy

// 7. Feed back to Silicon (with lag)
Silicon_Orders(t+lag) += Total_CAPEX × silicon_share`,
  sourceToggle: '파라미터별 데이터 출처 상세',
  footer:
    'InfraWheel은 정지훈(JJ)의 저서 『하루 만에 읽는 AI 투자 지도』(한빛미디어)의 핵심 프레임워크입니다. 책에서 각 노드의 산업 분석, 투자 전략, 시나리오별 타임라인을 상세히 다룹니다.',
};

const en: AboutContent = {
  whatIs: {
    title: 'What is InfraWheel?',
    body: `The AI industry is an engine.

Chips are made (Silicon), power is supplied (Energy), training runs in data centers (Hyperscale DC), AI services generate revenue (Digital AI), and that revenue gets reinvested back into chips (Capital → Silicon).

The faster this cycle spins, the faster AI grows. When any link gets blocked, the whole system slows down.

InfraWheel models this cycle with 19 key variables. Move the sliders to explore questions like "What if memory supply falls short?" or "What if a government makes a massive investment?"`,
  },
  twoLoops: {
    title: 'Two Loops',
    body: `InfraWheel has two loops.

Hyperscale Loop (blue): Already spinning. Trains AI models in large data centers and generates revenue through cloud services.

Spatial Loop (teal): Approaching activation. Uses AI-RAN base stations and 6G infrastructure to let Physical AI (robots, autonomous vehicles) generate revenue in the real economy.

The time gap between these two loops is the key to investment timing.`,
  },
  howToUse: {
    title: 'How to Use',
    body: `• Left panel: 19 parameter sliders. Click the ⓘ icon for explanations.
• Center diagram: Reacts in real-time. Yellow pulse = current bottleneck node. Click for details.
• Right chart: 44-quarter timeline (2025–2035). Toggle metrics with the buttons above.
• Scenarios: Pick a preset from the top dropdown, then fine-tune.`,
  },
  equationToggle: 'View Flywheel Equation',
  equation: ko.equation, // same math notation
  sourceToggle: 'Detailed Data Sources by Parameter',
  footer:
    'InfraWheel is the core framework from "AI Investment Map in a Day" by Jihoon Jeong (JJ), published by Hanbit Media. The book covers detailed industry analysis, investment strategies, and scenario timelines for each node.',
};

const dictionaries: Record<Locale, AboutContent> = { ko, en };

export function getAboutContent(locale: Locale): AboutContent {
  return dictionaries[locale];
}
