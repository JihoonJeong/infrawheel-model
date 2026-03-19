# InfraWheel Model Definition v2.0

## Overview

InfraWheel은 AI 산업의 성장을 순환적 가속 시스템(flywheel)으로 모델링하는 프레임워크다.
AI 산업 성장은 선형이 아니라 순환적이며, 매 사이클의 산출이 다음 사이클의 연료가 된다.
이 모델은 순환의 각 노드, 노드 간 전이 조건, 병목, 가속 트리거를 정의한다.

### 모델의 세 가지 역할
- **설명 도구**: AI 산업 전체를 하나의 엔진으로 이해시킴
- **시뮬레이션 엔진**: 파라미터를 조정하면 전체 시스템의 성장 경로가 바뀌는 것을 보여줌
- **투자 타이밍 도구**: 병목 해소 시점 = 다음 노드의 성장 가속 시점 = 투자 기회

### 토폴로지
- **8개 노드**: 4 shared spine + 2 Hyperscale loop + 2 Spatial loop
- **19개 파라미터**: 노드당 2~3개의 조작 가능한 독립 변수
- **2개 루프**: Hyperscale loop (이미 활성), Spatial loop (활성화 접근 중)
- **1개 외생 변수**: Policy CAPEX (시장 외부에서 주입되는 자본)

### 핵심 설계 원칙
- 이중 계산 없음: 각 변수는 정확히 하나의 노드에만 존재
- 결과값은 파라미터가 아님: ASP, inference cost, latency, payback period는 모두 도출값
- 모든 파라미터는 관찰/추정 가능: 공개 데이터에서 추적 가능한 변수만 사용
- 모델은 단순하게, 서사는 풍부하게: 노드 내부의 복잡성은 책의 서술에서 흡수

---

## 4-Tier Compute Architecture

InfraWheel의 인프라 계층 모델. 3-Tier에서 Spatial Compute Layer를 독립 계층으로 추가.

| Tier | 명칭 | 특성 | 규모 | InfraWheel 매핑 |
|------|------|------|------|----------------|
| 1 | Hyperscale Cloud | 학습, 대규모 추론 | 100MW+ campus | Hyperscale DC 노드 |
| 2 | Regional/Metro Edge | 기존 Edge DC, CDN | 1-10MW | Hyperscale DC 노드 하위 |
| 3 | Spatial Compute | AI-RAN 기지국, 6G 중계기 | 10-100kW per node | Spatial Compute 노드 |
| 4 | On-device | 단말, 로봇, 차량 | 1-100W | Physical AI 노드 하위 |

Tier 2는 InfraWheel에서 독립 노드로 분리하지 않음 — Hyperscale DC의 확장판으로 취급.
Tier 3가 독립 계층인 이유: 통신 커버리지 밀도로 배치되는 유일한 계층 (ubiquitous),
Physical AI의 실현 조건 (저지연 추론), 별도의 CAPEX 경로 (통신 인프라).

---

## Shared Spine Nodes

### 1. Silicon
> GPU · HBM · ASIC · Advanced Packaging

**역할**: AI 연산의 물리적 기반. Compute와 memory를 생산하여 전체 시스템에 공급.
Accelerator 자체는 더 이상 병목이 아님. 진짜 병목은 메모리와 패키징.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| S1 | BW memory supply | GB/quarter | 20G~120G | HBM + HBF 등 고대역폭 메모리. 학습 가능한 모델 크기의 천장 결정. Key suppliers: SK하이닉스, Samsung, Micron |
| S2 | Capacity memory pool | TB deployed/Q | 50~2,000 | 이질적 메모리 풀: SRAM(Groq LPU), LPDDR(HyperAccel Bertha), NAND Flash(KV cache). 배포 가능한 추론 인스턴스 수 × context length 결정 |
| S3 | Packaging throughput | K wafers/Q | 30~200 | CoWoS(TSMC) + FOWLP(Samsung) + emerging. 물리적 상한 — 메모리 공급이 있어도 bonding 못 하면 무의미. Duopoly, 18-24개월 리드타임 |

**메모리 2계층 구조**:
- **Bandwidth memory**: 학습·대규모 추론용. 모델 크기 천장 결정. (HBM, HBF)
- **Capacity memory**: 추론 서빙·컨텍스트 저장·엣지 배포용. 배포 규모 결정. (SRAM, LPDDR, NAND)
- 두 계층의 트레이드오프: "더 큰 모델" vs "더 많은 배포"를 하나의 노드에서 표현

**Storage NAND 참고**: 생성 콘텐츠 폭발로 storage 수요 급증하나, NAND 공급 탄력성이 높고(라인 재가동 용이),
tiered storage(SSD→QLC→HDD/Tape)로 흡수 가능. Silicon 노드의 바인딩 제약이 되지 않음.
Compute-adjacent NAND(KV cache 등)만 Capacity memory에 포함. Bulk storage는 Hyperscale DC 노드에서 간접 흡수.

**병목 로직**:
```
Training-class output = min(BW_memory, Packaging)
Inference-class output = min(Capacity_memory, Packaging)
```
현재: packaging-bound → 향후: memory-bound (패키징 CAPEX 투입으로 전환)
병목 이동 시점 = 섹터 로테이션 타이밍

**전이 → Energy**:
Total compute deployed (training + inference FLOPS) × power-per-FLOP = power demand
BW memory → 더 큰 모델 (더 많은 전력/run), Capacity memory → 더 많은 인스턴스 (더 많은 총 전력)

---

### 2. Energy
> Power · Cooling · Grid

**역할**: AI compute를 물리적으로 구동하는 전력 공급. 두 루프의 분기점 직전에 위치하여
전체 InfraWheel 회전 속도의 상한을 결정하는 경우가 많음.
전력의 "생산"과 "전달"은 완전히 다른 병목 — 발전소는 지을 수 있는데 송전 인허가가 5년.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| E1 | Deliverable power | GW online | 15~80 | 발전 용량이 아닌 실제 DC에 연결된 전력. 송전 제약, 인허가, 변전소 포함. US 인터커넥션 큐 평균 4-5년 |
| E2 | Pipeline lead time | months | 12~60 | CAPEX 집행 → 전력 공급까지 소요 시간. SMR: 24-36mo(미검증), Gas peaker: 12-18mo, 태양광+배터리: 18-24mo, 원전 재가동(한국): 36-48mo. 플라이휠의 관성 결정 |
| E3 | Compute density/MW | PFLOPS/MW | 5~50 | PUE 대체. 냉각 기술(공랭→액냉→침지), 칩 전력 효율, 랙 밀도에 의해 결정. 액냉 시 2-3x 밀도 향상. 같은 GW에서 더 많은 compute |

에너지원 믹스(SMR, 가스, 재생에너지, 원전 등)는 별도 파라미터로 분리하지 않음.
Lead time(P2)에 가중 평균으로 내재화하고, 에너지원별 차이는 책의 서술에서 풀어냄.
혁신 기술 등장 시 lead time 파라미터 변경으로 반영.

**Usable compute 산출**:
```
Usable AI compute = Deliverable power (GW) × Compute density (PFLOPS/MW)
Lead time = 이 수치가 개선되는 속도 결정
```

**Fork condition → Hyperscale DC / Spatial Compute**:
전력 분배는 단순 비율 분할이 아닌 물리적 분기:
- Hyperscale: 100MW+ 단일 사이트 집중. 대규모 송전 인프라 필요.
- Spatial: 10-100kW 분산 노드, 기존 통신 전력망에 기생. 소규모 분산이라 lead time이 짧을 수 있음.

---

### 3. Intelligence
> Models · Training · Inference

**역할**: 두 인프라 루프에서 compute를 받아 "쓸 수 있는 AI 능력"으로 변환.
합류점이자 재분기점 — Hyperscale과 Spatial에서 받은 compute를 Digital AI와 Physical AI로 갈라보냄.
Frontier를 밀어올리는 것(학습) + Frontier를 압축하여 배포하는 것(distillation/quantization) 두 가지 역할.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| I1 | Algorithmic efficiency | index (base=100) | 100~1,000 | 단위 FLOP당 유용한 산출량. 아키텍처 혁신, 학습 레시피, 추론 최적화(speculative decoding, MoE 등). 순수 SW/연구 레버 — 하드웨어 CAPEX 없이 양쪽 루프 모두 증폭. 스케일링 법칙 논쟁이 여기에 위치 |
| I2 | Frontier-to-edge transfer ratio | % | 10~80 | Frontier 모델 능력의 몇 %가 엣지 배포 크기로 압축 후 유지되는지. Distillation, quantization(INT4/INT2), 소형 아키텍처(Phi-class), synthetic data. 현재 ~30-40% (7B-class). 이 값이 두 루프의 시간차를 결정하는 가장 흥미로운 변수 |

**Double multiplier 구조**:
- I1(Algorithmic efficiency): 양쪽 루프 모두에 곱해짐
- I2(Transfer ratio): Spatial 경로에 추가로 곱해짐

**크로스-루프 흐름**: Hyperscale에서 학습 → 경량화 → Spatial로 배포. 이는 별도 화살표가 아닌
Intelligence 노드 "내부 동작"으로 처리. 서술에서 풀어냄.

**Fork → Digital AI**:
Cloud inference cost = Hyperscale compute cost ÷ (Algorithmic efficiency × serving optimization)
Cost/query < Revenue/query → Digital AI profitable at scale
SaaSpocalypse: 이 비율이 카테고리별로 1.0을 넘는 순간 해당 SaaS 대체 가속

**Fork → Physical AI (Dual-key gate)**:
Edge AI capability = Frontier level × Transfer ratio
활성화 조건:
  (a) Edge capability > task-specific threshold (e.g., >50% for AMR, >70% for humanoid)
  AND
  (b) Spatial Compute latency < 10ms (Spatial Compute 노드에서 도출)
Intelligence가 한 열쇠, Spatial Compute가 다른 열쇠.

---

### 4. Capital
> Revenue → CAPEX Reinvestment

**역할**: 바퀴의 관절. 두 Application 노드에서 현금이 흘러들어와 Silicon으로 재투자.
순환을 만드는 노드 — 이게 없으면 InfraWheel은 한 바퀴만 돌고 멈춤.
가장 단순한 노드 by design. 복잡한 변환은 다른 노드가 하고, Capital은 모아서 돌려보냄.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| C1 | CAPEX reinvestment ratio | % | 15~50 | 영업현금흐름의 AI 인프라 재투자 비율. Hyperscaler, chip maker, telco, Physical AI 기업 전체의 합산. 현 hyperscaler CAPEX/Revenue 25-35%. 바퀴의 스로틀 |
| C2 | Policy CAPEX (exogenous) | $B/year | 0~80 | 시장 외부 자본: 정부 보조금, 국부펀드, 국가 AI 전략 예산, 세제 인센티브. 한국: AI 3대 강국, 반도체 CAPEX 인센티브. US: CHIPS Act. 중동: sovereign AI. 시장 매출 없이도 바퀴를 돌릴 수 있는 "시동 모터" |

**Confidence-adjusted reinvestment (병목 캐스케이드 메커니즘)**:
```
Effective_Reinvest% = Base_Reinvest% × Confidence_Multiplier
Confidence_Multiplier = Bottleneck_Ratio ^ sensitivity
Bottleneck_Ratio = Actual_Output / Potential_Output (체인에서 가장 심한 병목 지점)
sensitivity = 시장 반응 속도 (0.3=인내 자본, 1.0=공개시장 센티먼트)
```
이 메커니즘으로 역방향 수요 파괴 캐스케이드를 별도 역방향 화살표 없이 포착.
추가 파라미터 없음 — bottleneck ratio는 기존 노드 산출값에서 자동 계산.

**Flywheel equation**:
```
Total CAPEX(t+1) = [DigitalAI_CashFlow(t) + PhysicalAI_CashFlow(t)] × Effective_Reinvest% + Policy_CAPEX
```

**가속/감속 조건**:
- 가속: Revenue 성장 OR Confidence 상승 OR Policy 증가
- 감속: Revenue 실망 AND Confidence 하락 AND Policy 축소 = "AI winter" 시나리오
- CAPEX→Silicon 시차: 주문→실리콘 공급 6-18개월. Boom-bust oscillation의 구조적 원인.

---

## Hyperscale Loop

### 5. Hyperscale DC
> Cloud · Networking · Optical

**역할**: "변환 효율" 노드. 전력과 칩을 받아서 실제 가용 compute로 변환.
자원을 추가하는 노드가 아님 — upstream의 입력을 얼마나 효율적으로 활용하는지가 고유 역할.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| H1 | Cluster bisection BW | Tbps/cluster | 10~200 | DC 레이어의 진짜 병목. 대규모 학습은 communication-bound — AllReduce 등 collective operation이 fabric 포화 시 stall. 광트랜시버 세대(400G→800G→1.6T), 스위치 radix, 토폴로지. CPO가 step-function event. Lux Cogitans의 photonic interconnect이 첫 실용적 가치를 만드는 지점 |
| H2 | Cluster utilization rate | % | 30~75 | 배포된 compute 중 실제 유용한 작업 비율. 현재 대형 학습 MFU 30-45%. Communication overhead, pipeline bubble, fault recovery, scheduling gap으로 손실. SW+인프라 공동 최적화로 개선 가능. "숨은 CAPEX" — MFU가 35%→65%면 칩 추가 없이 유효 compute 거의 2배 |

**노드 함수**:
```
Effective compute = Silicon output(Hyperscale 배분) × Energy-constrained capacity × min(1, Interconnect adequacy) × Utilization%
```
Upstream 입력의 승수(multiplier)이지 가산(additive) 아님.

**전이 → Intelligence**:
- Effective training FLOPS → 모델 frontier 진전 속도
- Effective inference FLOPS → Digital AI용 서빙 용량
- Interconnect BW는 학습의 바인딩 제약, Utilization%는 학습·추론 모두에 영향하되 추론 쪽이 개선 용이

---

### 6. Digital AI
> SaaS · Agents · Creative Economy

**역할**: Hyperscale 루프의 매출 엔진. 클라우드 추론 능력을 현금으로 변환.
두 가지 매출 스트림의 합성: Enterprise SaaS displacement + AI-native creation.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| D1 | AI revenue growth rate (blended) | % YoY | 15~80 | 두 스트림의 가중 합산 성장률. Stream A(Enterprise displacement): SaaS TAM 잠식, top-down, 고ARPU, 느린 채택 사이클. Stream B(AI-native creation): 순수 TAM 확장, viral, 저ARPU×대볼륨, B2C/creator/gaming. B2C가 선행, Enterprise가 후행. 두 스트림은 인프라 수요 관점에서 동질적 (FLOP is FLOP) |
| D2 | AI gross margin | % | 20~75 | Revenue - compute cost. 전통 SaaS 70-80% margin vs AI 서비스의 실질적 marginal cost. Algorithmic efficiency 개선 시 마진 확대. 마진 > 60% = Hyperscale 루프 자생적 가속 변곡점. Enterprise가 마진 높음 (예측 가능 워크로드), B2C는 heavy user 비중에 따라 변동 |

**노드 함수**:
```
Digital AI revenue = (Enterprise SaaS TAM × displacement%) + (AI-native creation TAM)
Cash to Capital = Total revenue × Blended gross margin
```
두 스트림은 책에서 별도 분석, 시뮬레이션에서는 합산 — "모델은 단순, 서사는 풍부하게" 원칙.

**전이 → Capital**:
Cash flow = Revenue × Gross margin × (1 - OpEx ratio)
Gross margin < 40%: 대부분 compute 비용으로 환류 → 바퀴 연료 부족
Gross margin > 60%: 잉여 현금 > 인프라 비용 증가분 → 자생적 가속

---

## Spatial Loop

### 7. Spatial Compute
> AI-RAN · 6G Relay · Ubiquitous DC

**역할**: "분산형 도달 범위" 노드. Hyperscale DC가 depth를 최적화한다면,
Spatial Compute는 reach를 최적화. 물리 공간 전체에 추론 능력을 입히는 계층.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| SC1 | AI-RAN deployment rate | % of metro BS | 0~60 | 추론 가능 하드웨어가 장착된 도시 기지국 비율. 통신사 CAPEX 의사결정 (SKT, KT / T-Mobile, Verizon). 기존 사이트 인프라 활용 가능 (전력, 백홀, 부지). 노드 단위 배포는 빠르나 fleet 전체 조율이 느림 |
| SC2 | Per-node inference capacity | TOPS/node | 50~2,000 | 각 spatial 노드의 연산력. LPDDR 기반 가속기 (HyperAccel Bertha class), 모바일 SoC NPU (Qualcomm, MediaTek), 전용 edge ASIC. Silicon의 Capacity memory에 직접 연동. 전력 제약: 10-100kW per node → TOPS/W가 raw throughput보다 중요 |

**Derived threshold — latency**:
```
RTT inference latency ≈ f(node density, per-node TOPS, network hops)
When deployment > ~30% AND per-node > ~500 TOPS → median latency < 10ms in covered areas
= Physical AI activation threshold
```
Latency는 독립 변수가 아닌 도출값. P1과 P2의 함수.

**한국 특수성**: 인구 밀도와 5G 기지국 밀도 세계 최고 수준.
같은 deployment rate 30%라도 한국의 결과적 커버리지 밀도가 미국보다 높음.
→ 한국이 Spatial 루프에서 먼저 임계치를 넘을 수 있다는 정량적 thesis.

**노드 함수**:
```
Total distributed inference = Deployment rate(%) × Total metro BS count × Per-node capacity(TOPS)
```
Reach × Depth 구조. Intelligence 노드의 추론 쪽에만 기여 (학습 아님).

**전이 → Intelligence**:
모델은 Hyperscale에서 학습 → distill/quantize → Spatial 노드에 배포.
기여: inference throughput × spatial coverage = 전체 real-world AI 접근성.
4-Tier 실현: Tier 1이 학습, Tier 3이 real-world 추론 서빙, Intelligence에서 핸드오프.

---

### 8. Physical AI
> Robotics · Autonomous Systems · Spatial Intelligence

**역할**: Spatial 루프의 매출 엔진. 실물 경제에서 돈을 버는 AI 시스템.
Digital AI가 tech sector 매출이라면, Physical AI는 제조·물류·농업·건설 매출 — 경기 방어적.

**파라미터**:

| ID | 파라미터 | 단위 | 범위 | 설명 |
|----|---------|------|------|------|
| PA1 | Fleet deployment | K units deployed | 10~2,000 | 누적 배포 AI 물리 시스템 (산업 로봇, AMR, 휴머노이드, 자율주행, 스마트 인프라). 이질적 fleet이나 flywheel에서는 총량이 중요 — 각 unit이 매출원 + 데이터 생성기. S-curve 성장: 섹터별 곡선 상이 (warehouse AMR 선행, humanoid 초기) |
| PA2 | Unit economics ratio | annual rev / unit cost | 0.2~1.5 | 연간 unit 수익 / 단위 취득 비용. > 0.33 (payback < 3yr) → 빠른 확장. > 1.0 (payback < 1yr) → 폭발적 배포. 하드웨어 비용 하락, 대체 노동 비용, AI 능력 향상에 의해 결정. RaaS 모델 포함. 한국 핵심 섹터: 반도체 fab 자동화, 조선 용접, 디스플레이 제조 |

**Dual-key 활성화 (recap)**:
```
Physical AI acceleration requires:
  Key 1 (Intelligence): Transfer ratio > task threshold (50% AMR, 70% humanoid)
  Key 2 (Spatial): Latency < 10ms for safety-critical apps
  
Non-safety-critical (농업 드론, 검사 로봇): Key 2 완화 — on-device 추론 충분
시장 세그먼트 = 어떤 key 조합을 요구하는지에 따라 분류
```

**내부 data flywheel**:
배포된 unit이 real-world 운영 데이터 생성 → Intelligence로 피드백 (모델 개선)
→ 더 나은 모델이 unit economics 개선 → 더 빠른 배포.
이 내부 루프가 Physical AI 매출의 "stickiness" 원천 — switching cost 극대.

**전이 → Capital**:
Cash flow = Fleet × Revenue/unit × Operating margin
Physical AI operating margin: Digital AI보다 낮은 gross margin (하드웨어+유지보수)
but 규모의 operating leverage 가능 (fleet 관리 중앙화).
**Real-economy 매출 = 다변화된 Capital 수입원 → 기술 섹터 침체에 대한 flywheel 복원력.**

---

## Structural Symmetry

### Infrastructure nodes (depth vs reach)

| 항목 | Hyperscale DC | Spatial Compute |
|------|--------------|-----------------|
| 최적화 대상 | Depth (집중) | Reach (분산) |
| 규모 단위 | 100MW+ campus | 10-100kW node |
| 병목 | Interconnect BW | Deployment pace |
| 효율 레버 | Utilization % | Per-node TOPS |
| 서빙 대상 | 학습 + 클라우드 추론 | Real-world 추론 |
| 파라미터 수 | 2 | 2 |

### Application nodes (software vs hardware)

| 항목 | Digital AI | Physical AI |
|------|-----------|-------------|
| 매출원 | SW 서비스 | 실물 경제 |
| 성장 동력 | SaaS displacement | Unit economics |
| 핵심 지표 | Gross margin % | Payback period |
| 한계 비용 | Query당 compute | Unit당 hardware |
| 해자 | Data + workflow lock-in | Operational data + switching cost |
| 매출 성격 | Recurring, elastic | Sticky, linear scaling |
| 상태 | Already active | Approaching activation |

---

## Bottleneck Cascade Mechanism

InfraWheel은 양방향으로 작동한다:
- 순방향: 각 노드의 산출이 다음 노드의 입력 → 가속
- 역방향: 병목이 시장 신뢰를 훼손 → reinvestment 감소 → 다음 사이클 감속

**Forward propagation**: 매 사이클, Silicon → Energy → DC/Spatial → Intelligence → Apps → Capital → Silicon 순서로 계산.
각 노드의 min() 병목 로직이 체인의 가장 약한 고리에 의해 전체를 제약.

**Backward cascade (Confidence mechanism)**:
```
Effective_Reinvest% = Base_Reinvest% × (Bottleneck_Ratio ^ sensitivity)
Bottleneck_Ratio = min(각 노드의 Actual_Output / Potential_Output)
sensitivity ∈ [0.3, 1.0]  // 모델 상수, 시나리오별 조정 가능
```

**시뮬레이션 해상도**: 분기(quarterly) 단위. 월 단위까지 가능 (웹 시뮬레이터 구현 시).
CAPEX → Silicon 시차 6-18개월 내재.

---

## Flywheel Equation (Complete)

```
// Per cycle (quarterly):

// 1. Silicon output
Training_Silicon = min(S1_BW_mem, S3_Packaging) × hyperscale_alloc_ratio
Inference_Silicon = min(S2_Cap_mem, S3_Packaging) × (hyperscale_alloc + spatial_alloc)

// 2. Energy constraint
Usable_Compute = E1_Power × E3_Density
// E2_LeadTime controls how fast E1 grows cycle-to-cycle

// 3. Infrastructure conversion
Hyperscale_Effective = min(Usable_Compute_H, Training_Silicon) × min(1, H1_BW/required_BW) × H2_Util
Spatial_Effective = SC1_Deploy% × Metro_BS_Count × SC2_TOPS

// 4. Intelligence
Frontier_Capability = Hyperscale_Effective × I1_Efficiency
Edge_Capability = Frontier_Capability × I2_Transfer
Spatial_Latency = f(SC1, SC2)  // derived

// 5. Applications
Digital_Revenue = Digital_Revenue(t-1) × (1 + D1_Growth%)
Digital_CashFlow = Digital_Revenue × D2_Margin
Physical_Active = (Edge_Capability > task_threshold) AND (Spatial_Latency < 10ms)
Physical_Revenue = PA1_Fleet × (PA2_UnitEcon × Unit_Cost)
Physical_CashFlow = Physical_Revenue × Physical_OpMargin

// 6. Capital (with confidence feedback)
Bottleneck_Ratio = min(actual/potential across all nodes)
Confidence = Bottleneck_Ratio ^ sensitivity
Effective_Reinvest = C1_Reinvest% × Confidence
Total_CAPEX = (Digital_CashFlow + Physical_CashFlow) × Effective_Reinvest + C2_Policy

// 7. Feed back to Silicon (with lag)
Silicon_Orders(t+2) += Total_CAPEX × silicon_share  // 6-18 month lag
```

---

## Author's Framework Mapping (to be detailed in Stage 2)

| Framework | InfraWheel location | Role |
|-----------|-------------------|------|
| Pick-and-Shovel | Silicon + Energy + Hyperscale DC | 인프라 공급자가 응용 기업보다 확실한 수혜 |
| Physical AI Revolution | Spatial loop 전체 | Spatial 루프 활성화 = Physical AI 시대 도래 |
| 3→4-Tier Architecture | Energy fork → Hyperscale DC vs Spatial Compute | 인프라 계층 구조의 재정의 |
| SaaSpocalypse | Digital AI 노드 Stream A | Enterprise displacement wave |
| Great Rebalancing | Silicon 노드 (패키징 duopoly 해소) | 반도체 공급망 분산화 |
| Deep Vertical + Data Moat | Digital AI (vertical SaaS) + Physical AI (operational data) | 양쪽 Application 노드의 해자 구조 |
| 10-20년 기술 사이클 | Capital 노드의 boom-bust oscillation | Reinvestment ratio의 장기 파동 |
| Lux Cogitans | Hyperscale DC P1 (CPO/photonic interconnect) | 광 연산의 첫 실용 가치 지점 |

---

## Version History
- v1.0: Initial 8-node structure, 17 parameters
- v2.0: All nodes revised — outputs removed from params, memory 2-tier, Energy reframed, Intelligence dual-multiplier, Digital AI blended streams, Capital confidence mechanism. 19 parameters final.
