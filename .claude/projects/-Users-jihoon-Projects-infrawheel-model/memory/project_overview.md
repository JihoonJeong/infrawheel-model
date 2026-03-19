---
name: InfraWheel project overview
description: AI industry flywheel simulator web app — 8 nodes, 19 params, quarterly simulation engine
type: project
---

InfraWheel is an interactive web simulator for AI industry growth analysis, tied to a book ("하루 만에 읽는 AI 투자 지도").

**Why:** The book needs a companion tool that lets readers manipulate 19 parameters and see how the AI industry flywheel evolves over 40 quarters.

**How to apply:** All implementation follows two source-of-truth documents:
- `infrawheel-model.md` — model definition (8 nodes, 19 params, flywheel equation)
- `simulator-spec.md` — web app spec (React+D3+TypeScript, 3 phases)

Phase 1 (core simulator engine) is in progress. Engine is pure TypeScript in `src/engine.ts`, UI-independent.
