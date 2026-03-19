# InfraWheel Simulator — Web Application Spec

## Overview

『하루 만에 읽는 AI 투자 지도』의 핵심 차별점이 되는 웹 기반 인터랙티브 시뮬레이터.
독자가 InfraWheel 모델의 19개 파라미터를 직접 조작하면서 AI 산업의 성장 경로와
투자 타이밍을 탐색할 수 있는 도구. 책이 프레임워크를 제공하고, 시뮬레이터가
현재 데이터로 그 프레임워크를 지속적으로 작동시키는 구조.

## Design Goals

1. **책과 유기적 연결**: 각 장 끝에서 "시뮬레이터에서 직접 확인 → [시나리오 링크]"
2. **살아 있는 투자 도구**: 데이터 소스에서 주기적으로 파라미터 업데이트
3. **직관적 시각화**: InfraWheel 다이어그램이 실시간으로 반응
4. **공유 가능**: URL에 시나리오 상태를 직렬화하여 시나리오 공유/저장

---

## Core Features

### 1. InfraWheel Live Diagram

InfraWheel 토폴로지가 화면 중앙에 항상 표시. 시뮬레이션 결과에 따라 실시간 반응:
- **노드 크기/색상**: 각 노드의 throughput에 비례하여 크기 변화. 병목 노드는 빨강 계열로 전환
- **화살표 두께**: 노드 간 흐름량에 비례
- **바퀴 회전 속도**: 전체 flywheel의 가속/감속을 시각적으로 표현 (애니메이션)
- **Bottleneck indicator**: 현재 바인딩 제약 노드에 하이라이트 + 툴팁
- **루프 색상 분리**: Hyperscale loop(blue), Spatial loop(teal), Shared spine(purple)

### 2. Parameter Control Panel

화면 좌측 또는 하단에 접이식 패널. 노드별 그룹핑.
- 각 파라미터: 슬라이더 + 숫자 직접 입력 + 현재 실제값 표시 (데이터 연동 시)
- 파라미터 변경 즉시 다이어그램 및 차트 업데이트 (debounce ~100ms)
- "Reset to base case" 버튼
- "Lock parameter" 토글 — 특정 파라미터 고정 후 나머지만 조정 가능

### 3. Timeline Projection

화면 우측에 시계열 차트:
- X축: 시간 (분기 단위, 2025~2035)
- Y축: 선택 가능한 지표 (Total AI Revenue, CAPEX, Bottleneck Ratio, Loop별 속도 등)
- 시나리오 비교: 최대 3개 시나리오를 오버레이
- 주요 이벤트 마커: "Spatial loop activation", "Margin breakeven", "Bottleneck shift" 등 자동 표시

### 4. Scenario System

#### 프리셋 시나리오
책의 주요 thesis와 연동:

| 시나리오 | 설명 | 핵심 파라미터 변경 |
|---------|------|-----------------|
| Base Case 2026 | 현재 추세 유지 | 모든 파라미터 현재 관측값 기반 |
| Energy Bottleneck | 전력 확보 지연 시나리오 | E1↓, E2↑ |
| AI Winter | 시장 신뢰 붕괴 | C1↓, D1↓, sensitivity↑ |
| Korea-first Spatial | 한국이 Spatial 루프 선행 활성화 | SC1↑ (한국 기지국 밀도 반영) |
| Algorithmic Breakthrough | 모델 효율 급격한 개선 | I1↑↑, I2↑ |
| Memory Wall | 메모리 공급 부족 장기화 | S1↓, S2↓ |
| Physical AI Takeoff | Physical AI 임계점 돌파 | PA2↑, SC1↑, I2↑ |
| Policy Boost (Korea) | 한국 정부 AI 대규모 투자 | C2↑↑ |

#### 커스텀 시나리오
- 사용자가 파라미터 조정 후 "Save scenario" → 이름 부여 → URL hash에 저장
- URL 공유로 동일 시나리오 재현 가능
- LocalStorage에 최근 시나리오 5개 자동 저장

### 5. Node Deep-dive Mode

노드 클릭 시 확장 패널:
- 해당 노드의 파라미터 상세 설명
- 현재 실제 데이터 (데이터 소스 연동)
- 관련 기업/ETF 섹터 (참고 정보)
- 관련 책 장(chapter) 링크

---

## Data Source Integration

### 핵심 원칙
- 파라미터의 현재 "실제값"을 데이터 소스에서 주기적으로 가져와 표시
- 사용자가 실제값에서 출발하여 what-if 시나리오를 탐색하는 워크플로우
- 데이터 업데이트 주기: 파라미터별로 다름 (아래 참조)

### 파라미터별 데이터 소스 매핑

#### Silicon
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| S1 BW memory supply | SK하이닉스/Samsung/Micron 분기 실적 발표, TrendForce/Omdia 리포트 | 분기 | 3사 HBM 출하량 합산 (GB 환산) |
| S2 Capacity memory pool | 서버용 DRAM/NAND 출하 통계, Gartner/IDC 서버 시장 데이터 | 분기 | AI 서버 출하 × 평균 메모리 탑재량 추정 |
| S3 Packaging throughput | TSMC/Samsung Foundry earnings call, 업계 캐파 추정 | 분기 | CoWoS + FOWLP 월간 캐파 × 3 |

#### Energy
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| E1 Deliverable power | IEA Data Centre Energy Tracker, US EIA, 한전 전력통계 | 반기 | 글로벌 AI DC 연결 전력 추정 (DC 사업자 공시 합산) |
| E2 Pipeline lead time | FERC interconnection queue data, 산업 보고서 | 반기 | 주요국 인허가-완공 평균 기간 |
| E3 Compute density | 상위 DC 사업자의 PUE 공시, 랙 밀도 보고서 | 반기 | (DC 총 IT load / DC 총 전력) × 최신 chip FLOPS/W |

#### Intelligence
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| I1 Algorithmic efficiency | Stanford AI Index, Epoch AI compute tracking, 주요 벤치마크 | 반기 | 동일 벤치마크 점수 달성에 필요한 FLOPS의 연간 감소율을 지수화 |
| I2 Transfer ratio | Open LLM Leaderboard, small model vs frontier model 성능비 | 분기 | 7B-class best score / frontier best score |

#### Capital
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| C1 Reinvestment ratio | Big Tech earnings (MSFT, GOOG, AMZN, META CAPEX guidance) | 분기 | 4사 AI CAPEX / 4사 AI-attributed revenue |
| C2 Policy CAPEX | 각국 정부 예산안, CHIPS Act 집행 현황, 산업부 공시 | 반기 | 주요국 AI 관련 정부 지출 + 세제 인센티브 추정 합산 |

#### Hyperscale DC
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| H1 Cluster bisection BW | NVIDIA/Broadcom earnings, 광트랜시버 출하 데이터 (LightCounting) | 분기 | 최대 공개 클러스터의 bisection BW, 세대별 가중 평균 |
| H2 Cluster utilization | MLPerf Training 결과, hyperscaler 공시 (드묾) | 반기 | MLPerf 최고 MFU + 실무 추정 할인 |

#### Spatial Compute
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| SC1 AI-RAN deployment | 통신사 공시, GSMA Intelligence, 3GPP 표준화 진행 | 반기 | 주요 통신사 AI-RAN 파일럿/상용 기지국 수 / 전체 도시 기지국 수 |
| SC2 Per-node inference | Edge AI chip 벤치마크, 통신장비 스펙 시트 | 반기 | 상용 AI-RAN 노드의 대표 TOPS 스펙 |

#### Digital AI
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| D1 Revenue growth | Synergy Research, IDC AI 시장 전망, 상위 AI 기업 실적 | 분기 | 글로벌 AI SW/서비스 매출 YoY 성장률 |
| D2 Gross margin | OpenAI/Anthropic (비공개, 추정), Microsoft AI 세그먼트, Google Cloud | 분기 | AI-specific 세그먼트 공시 마진 가중 평균 + 추정 |

#### Physical AI
| 파라미터 | 소스 | 업데이트 주기 | 산출 방법 |
|---------|------|-------------|---------|
| PA1 Fleet deployment | IFR World Robotics, 자율주행 fleet 추적 (Waymo, 한국 규제 승인) | 연간 | IFR 산업로봇 + 서비스로봇 + AV fleet 합산 (AI-integrated만) |
| PA2 Unit economics | 개별 기업 case study, 산업 ROI 보고서 | 반기 | 대표 섹터별 (물류AMR, fab 자동화 등) 평균 unit economics |

### 데이터 업데이트 아키텍처

```
[Data Sources] → [ETL Pipeline (scheduled)] → [Parameter DB] → [API] → [Simulator Frontend]
                                                      ↓
                                              [Version History]
                                           (파라미터 변화 추적)
```

- **ETL Pipeline**: 분기/반기별 스케줄. 수동 큐레이션 + 자동 수집 혼합.
  일부 소스 (earnings calls, 정부 예산)는 수동 입력 불가피.
  자동 수집 가능: 주가 기반 CAPEX 추정, 공개 벤치마크 스코어 등.
- **Parameter DB**: 각 파라미터의 시계열 저장. 업데이트 이력 + 출처 URL 보존.
- **API**: Simulator frontend에 현재값 + 히스토리 제공.
- **Version History**: "3개월 전 대비 어떤 파라미터가 얼마나 변했는지" 표시 가능.
  독자가 접속할 때마다 "지난번 이후 바뀐 것" 하이라이트.

### 데이터 신뢰도 표시

각 파라미터 옆에 신뢰도 아이콘:
- 🟢 High confidence: 공시 데이터 직접 사용 (예: CAPEX, 출하량)
- 🟡 Medium confidence: 복수 소스 교차 추정 (예: AI-RAN 배포율)
- 🔴 Low confidence: 단일 소스 또는 모델 추정 (예: AI gross margin)

독자가 어떤 숫자를 신뢰할 수 있고 어떤 숫자에 자기 판단을 더 넣어야 하는지 명시.

---

## Technical Architecture

### 프론트엔드
- **Framework**: React 18+ (with TypeScript)
- **시각화**: D3.js (InfraWheel 다이어그램, 커스텀 인터랙션) + Recharts 또는 Chart.js (타임라인 차트)
- **상태 관리**: Zustand 또는 Jotai (경량, URL 직렬화 용이)
- **URL 상태**: 19개 파라미터 + 시나리오 메타를 URL hash에 직렬화 → 링크 공유로 시나리오 재현
- **반응형**: Desktop 우선, Tablet 지원. Mobile은 읽기 전용 (슬라이더 조작이 어려움)
- **다국어**: 한국어 기본, 영어 전환 가능

### 시뮬레이션 엔진
- **순수 TypeScript 모듈**: UI와 완전 분리. 입력 19개 파라미터 → 출력 시계열 데이터
- **사이클 단위**: 분기 (default), 월 (고해상도 모드)
- **시뮬레이션 범위**: 2025 Q1 ~ 2035 Q4 (40 quarters default)
- **Confidence mechanism**: 내장. sensitivity 파라미터 조절 가능 (고급 옵션)
- **성능 목표**: 40분기 시뮬레이션 < 10ms (브라우저 메인 스레드에서 실행)
- **테스트 가능**: 엔진 단독으로 unit test 가능. 알려진 시나리오의 예상 결과 검증.

```typescript
// 엔진 인터페이스 (개념)
interface InfraWheelParams {
  silicon: { bwMemory: number; capMemory: number; packaging: number };
  energy: { deliverablePower: number; leadTime: number; computeDensity: number };
  intelligence: { algorithmicEfficiency: number; transferRatio: number };
  capital: { reinvestRatio: number; policyCAPEX: number };
  hyperscaleDC: { bisectionBW: number; utilization: number };
  digitalAI: { revenueGrowth: number; grossMargin: number };
  spatialCompute: { deploymentRate: number; perNodeTOPS: number };
  physicalAI: { fleetDeployment: number; unitEconomics: number };
}

interface SimulationConfig {
  startQuarter: string;        // e.g., "2025Q1"
  endQuarter: string;          // e.g., "2035Q4"
  cycleUnit: 'quarter' | 'month';
  sensitivity: number;         // confidence mechanism, 0.3-1.0
  metroBSCount: number;        // Korea vs US 등 국가별 설정
}

interface CycleOutput {
  quarter: string;
  nodeOutputs: Record<NodeId, number>;
  bottleneckNode: NodeId;
  bottleneckRatio: number;
  loopSpeeds: { hyperscale: number; spatial: number };
  totalCAPEX: number;
  totalRevenue: number;
  // ... derived metrics
}

function simulate(params: InfraWheelParams, config: SimulationConfig): CycleOutput[];
```

### 백엔드 (데이터 서비스)
- **최소 구조**: Static JSON 파일 호스팅으로 시작 가능 (parameters.json 주기적 수동 업데이트)
- **확장 구조**: Serverless function (Vercel/Cloudflare Workers) + DB (Supabase/Planetscale)
- **API 엔드포인트**:
  - `GET /api/params/current` — 최신 실제 파라미터값
  - `GET /api/params/history?from=2025Q1&to=2026Q2` — 파라미터 시계열
  - `GET /api/scenarios/:id` — 저장된 시나리오
  - `POST /api/scenarios` — 시나리오 저장 (인증 필요 시)

### 호스팅/배포
- **Vercel** 또는 **Cloudflare Pages**: React 앱 + Serverless functions
- **도메인**: infrawheel.ai 또는 서적 공식 URL의 서브도메인
- **CDN**: 정적 자산 글로벌 캐싱 (한국 독자 + 글로벌 접근)

---

## UI Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  InfraWheel Simulator    [시나리오 선택 ▼]  [공유] [한/EN]  │
├──────────────┬──────────────────────┬───────────────────────┤
│              │                      │                       │
│  Parameter   │   InfraWheel         │   Timeline            │
│  Control     │   Live Diagram       │   Projection          │
│  Panel       │                      │   Chart               │
│              │   (중앙, 인터랙티브) │                       │
│  [Silicon]   │                      │   [지표 선택]         │
│  ├ S1 ━━━○   │   ┌──Silicon──┐      │   ━━━ Total Revenue   │
│  ├ S2 ━━━○   │   │           │      │   ┈┈┈ CAPEX           │
│  └ S3 ━━━○   │   ↓           ↓      │   ─── Bottleneck %    │
│              │  Hyper    Spatial    │                       │
│  [Energy]    │   ↓           ↓      │   [시나리오 비교 ON]  │
│  ├ E1 ━━━○   │  Intel    Intel      │                       │
│  ├ E2 ━━━○   │   ↓           ↓      │                       │
│  └ E3 ━━━○   │  Digi    Physic     │                       │
│              │   ↓           ↓      │                       │
│  [...]       │   └──Capital──┘      │                       │
│              │       ↓ (loop)       │                       │
│              │                      │                       │
├──────────────┴──────────────────────┴───────────────────────┤
│  Node Detail Panel (접이식) — 클릭한 노드의 상세 정보       │
│  [실제 데이터] [관련 기업/섹터] [관련 책 Chapter]           │
└─────────────────────────────────────────────────────────────┘
```

---

## Book Integration

### 장별 시나리오 연동 (예상)

| 책 장 | 대응 노드 | 연동 시나리오 | URL 형식 |
|-------|----------|-------------|---------|
| 1장 InfraWheel 소개 | 전체 | Base Case 2026 | /sim?scenario=base2026 |
| 2장 반도체 | Silicon | Memory Wall | /sim?scenario=memwall&focus=silicon |
| 3장 에너지·DC | Energy + Hyperscale DC | Energy Bottleneck | /sim?scenario=energybottleneck&focus=energy |
| 4장 AI 소프트웨어 | Intelligence + Digital AI | SaaSpocalypse | /sim?scenario=saaspocalypse&focus=digital |
| 5장 Spatial Compute | Spatial Compute | Korea-first Spatial | /sim?scenario=koreafirst&focus=spatial |
| 6장 Physical AI | Physical AI | Physical AI Takeoff | /sim?scenario=physai&focus=physical |
| 7장 투자 전략 | Capital + 전체 | AI Winter / 비교 | /sim?scenario=compare |

### 독자 워크플로우

1. 책에서 "이 장의 시나리오를 시뮬레이터에서 확인 → [QR코드/URL]" 발견
2. URL 접속 → 해당 시나리오 프리셋 로드 + 관련 노드 포커스
3. 독자가 파라미터 조정하며 what-if 탐색
4. "만약 메모리 공급이 예상보다 50% 느리면?" → 슬라이더 조정 → 결과 즉시 확인
5. 시나리오 저장/공유 → SNS, 투자 커뮤니티에 링크 공유

---

## Implementation Phases

### Phase 1: Core Simulator (책 출간 전 필수)
- InfraWheel 시뮬레이션 엔진 (TypeScript)
- 기본 UI: 파라미터 패널 + 다이어그램 + 타임라인 차트
- 프리셋 시나리오 8개
- URL 직렬화 (시나리오 공유)
- 초기 파라미터값은 수동 설정 (데이터 소스 연동 없이)

### Phase 2: Data Integration (출간 후 1-2개월)
- 데이터 소스 파이프라인 구축
- 자동 수집 가능 소스 먼저 연결
- "현재 실제값" 표시 + 신뢰도 아이콘
- 파라미터 변화 히스토리

### Phase 3: Community Features (출간 후 3-6개월)
- 사용자 시나리오 갤러리 (공개 공유)
- 코멘트/토론 기능
- "이번 분기 업데이트" 뉴스레터 연동
- 알림: 특정 파라미터가 임계치를 넘었을 때 (예: Spatial loop activation 접근)

---

## Development Notes for Claude Code

### 구현 시 참고 사항
- 시뮬레이션 엔진은 순수 함수형으로 작성 — side effect 없이 입력→출력 매핑
- D3 다이어그램의 노드 위치는 InfraWheel 토폴로지에 고정 (force-directed layout 아님)
- 애니메이션은 requestAnimationFrame 기반, 파라미터 변경 시 GSAP 또는 CSS transition
- 19개 파라미터의 정규화: 각 파라미터를 0-1 범위로 정규화하여 내부 계산 통일
- 파라미터 간 의존성 그래프를 명시적으로 관리 (순환 참조 방지)
- 분기별 시뮬레이션 40 cycles < 10ms 목표 — 최적화 불필요한 수준이어야 함
- 모든 숫자 표시: toLocaleString('ko-KR') 또는 영어 전환 시 'en-US'

### 모델 정의서 참조
- `infrawheel-model.md` 의 Flywheel Equation 섹션이 엔진 구현의 근거
- 각 노드의 min() 병목 로직, 전이 조건, derived threshold를 정확히 구현
- Confidence mechanism의 sensitivity 파라미터는 "고급 설정"으로 노출

---

## Version History
- v1.0: Initial spec — core features, data source mapping, tech stack, UI layout, book integration
