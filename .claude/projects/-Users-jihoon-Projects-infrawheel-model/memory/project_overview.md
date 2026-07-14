---
name: InfraWheel project overview
description: AI industry flywheel simulator web app — 8 nodes, 18 params, quarterly simulation + geopolitical overlay
type: project
---

InfraWheel is an interactive web simulator for AI industry growth analysis, companion to the book "정지훈의 AI투자 강의" (한빛미디어) by Jihoon Jeong (JJ).

**Source-of-truth documents:**
- `infrawheel-model.md` — model definition (8 nodes, 18 params, flywheel equation)
- `simulator-spec.md` — web app spec (React+D3+TypeScript, phases)
- `geopolitical-overlay-framework.md` — geopolitical overlay (bloc/energy/Taiwan → param mapping)

**Architecture:**
- Simulation engine: `src/engine.ts` — pure TypeScript, no UI deps. 18 params → 44 quarter time series.
- Defaults: `src/defaults.ts` — Base Case 2026 values (tuned by Luca review)
- Types: `src/types.ts`
- Tests: `src/__tests__/engine.test.ts` — 28 tests, vitest

**UI (React + Vite):**
- Landing page: `src/ui/components/Landing.tsx` — ai-ludens inspired, introduces InfraWheel + geopolitical context before simulator
- Two-tab simulator: InfraWheel tab (18-param sliders + D3 diagram + timeline chart) | Geopolitical tab (bloc/energy/Taiwan → param mapping overlay)
- State: Zustand (`src/ui/store.ts`) — manages both tabs, shared config
- i18n: lightweight dict system (`src/ui/i18n/`) — ko/en, ~120+ keys
- Geopolitical mapping: `src/ui/geopolitical/geoMapping.ts` — applyGeoOverlay() pure function
- Contextual help: param (i) tooltips (19 descriptions + confidence dots), node click popovers, About modal
- Styling: dark theme, CSS in `src/ui/styles.css`

**Deployment:**
- GitHub Pages: https://jihoonjeong.github.io/infrawheel-model/
- Auto-deploy via `.github/workflows/deploy.yml` on push to main
- Vite build with `--base=/infrawheel-model/`

**Key model details (Luca-reviewed):**
- Spatial latency: sqrt-density model with metroBSCount + coveredAreaKm2
- Growth rates: packaging 0.5x, capacity 1.5x, algo efficiency 1.07/Q with diminishing returns
- CAPEX allocation: silicon 50%, energy 20%, dc 20%, spatial 10% (configurable)
- PARAM_MAX.algorithmicEfficiency = 2000 (raised from 1000)
- Confidence mechanism: Bottleneck_Ratio ^ sensitivity

**Geopolitical overlay (6 presets):**
A. Golden Age (10/85/off) | B. Tripolar Abundance (80/80/off) | C. Global Bottleneck (40/25/off) | D. Tripolar Scarcity (85/20/off) | Taiwan Blockade (50/50/blockade) | Korea Optimal (75/75/off)

**What's done:** Phase 1 engine + Phase 2 UI (full landing, InfraWheel tab, Geopolitical tab, i18n, contextual help, D3 diagram, GitHub Pages deploy)
**Not yet done:** Preset InfraWheel scenarios (8, from simulator-spec.md), URL state serialization, scenario compare overlay, dynamic CAPEX allocation
