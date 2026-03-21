# App Teacher/Student Execution Plan

## Objective

Deliver a production-ready `/app` experience for `teacher` and `student` with:

- clear route intent separation
- shared visual shell with controlled layout variants
- backend-enforced role and data scope
- no domain rule duplication in frontend

This document is the tracking source for execution progress.

## Ground Rules (Locked)

1. UI reference source:
- `reference-ui/DASHBOARDS` is visual/UX reference only.
- It is not a reference for architecture, folder structure, or code standards.

2. Route intent:
- do not use one route for very different intents.
- split role surfaces explicitly:
  - `/app/professor/*`
  - `/app/aluno/*`

3. Domain ownership:
- business logic stays in backend domain modules.
- frontend receives ready view data and renders.

4. Security:
- backend authorization is mandatory per route and per resource.
- visual guards are auxiliary only.

5. Naming:
- code symbols in English (`teacher`, `student`).
- URL paths in PT-BR (`professor`, `aluno`) for UX clarity.

## Target Architecture

### Routing

- `app/app/professor/page.tsx`
- `app/app/professor/attendance/page.tsx`
- `app/app/professor/agenda/page.tsx`
- `app/app/professor/turmas/page.tsx`
- `app/app/aluno/page.tsx`
- `app/app/aluno/presenca/page.tsx`
- `app/app/aluno/turmas/page.tsx`
- `app/app/aluno/evolucao/page.tsx`
- `app/app/aluno/pagamentos/page.tsx`

### App presentation layer

- `modules/app/ui/*` (shared shell and visual primitives)
- `modules/app/features/*` (feature base + role adapters)
- `modules/app/teacher/*` (teacher page composition)
- `modules/app/student/*` (student page composition)

### Backend contracts

- `app/api/app/teacher/*`
- `app/api/app/student/*`

### Domain source of truth (unchanged)

- `apps/api/src/modules/attendance/*`
- `apps/api/src/modules/classes/*`
- `apps/api/src/modules/students/*`
- `apps/api/src/modules/teachers/*`
- `apps/api/src/modules/graduations/*`
- `apps/api/src/modules/finance/*`
- `apps/api/src/modules/events/*`

## Layout Variants Standard

Define and enforce:

- `standard`: default content pages
- `focus`: critical execution flow (e.g., attendance execution)
- `split`: list/detail desktop-first layouts
- `immersive`: guided full-focus pages

Rule:
- each app page declares one variant explicitly.
- no ad-hoc one-off layout behavior outside these variants.

## Delivery Phases

## Phase 0 - Foundation Lock

### Goal

Create non-negotiable skeleton and conventions before new screens.

### Tasks

- create role route map in `lib/routes.ts`
- create app navigation registry for teacher and student
- create layout variant model and usage API
- create role-aware app layout wrappers for `/professor` and `/aluno`
- define redirect strategy from `/app` to role-specific landing

### Done Criteria

- routes compile and are accessible
- role-aware redirects deterministic
- no screen implemented yet outside new structure

### Status

- [x] completed (2026-03-17)

## Phase 1 - Vertical Slice: Professor > Presenca

### Goal

Ship one complete role-specific slice end-to-end as template.

### Tasks

- implement `/app/professor/attendance` with `focus` variant
- bind to `/api/app/teacher/attendance`
- ensure frontend has no domain rule (render-only)
- enforce teacher-only backend checks
- add e2e for role route + persistence scenario

### Done Criteria

- teacher can execute attendance via `/app/professor/attendance`
- page denied to student users at backend and UI levels
- e2e green

### Status

- [x] completed (2026-03-17)

## Phase 2 - Professor Core

### Goal

Complete professor MVP paths in new route model.

### Tasks

- `/app/professor` (Resumo)
- `/app/professor/agenda`
- `/app/professor/turmas`
- harmonize app nav badges and pending states
- validate responsive behavior (mobile and desktop)

### Done Criteria

- professor core nav complete and stable
- all pages use variant system
- contracts documented and consistent

### Status

- [x] completed (2026-03-17)

## Phase 3 - Aluno Core

### Goal

Deliver student MVP paths with personal scope.

### Tasks

- `/app/aluno` (Resumo)
- `/app/aluno/presenca`
- `/app/aluno/turmas`
- `/app/aluno/evolucao`
- `/app/aluno/pagamentos`
- verify self-only data scope in backend

### Done Criteria

- student can complete core personal workflows
- no teacher/admin data exposure
- role access matrix validated

### Status

- [ ] partially delivered (routes + screens wired)

## Phase 4 - Shared Feature Consolidation

### Goal

Reduce duplication while preserving role boundaries.

### Tasks

- move common UI to `modules/app/features/<feature>/base`
- keep role-specific adapters in `<feature>/teacher|student`
- remove duplicated render fragments across role screens
- snapshot visual diffs to avoid regressions

### Done Criteria

- duplicated feature UI reduced
- role semantics preserved
- no logic leakage to frontend

### Status

- [ ] not started

## Phase 5 - Hardening and Rollout

### Goal

Finalize quality gates and safely transition legacy `/app/*`.

### Tasks

- confirm old generic `/app/agenda|attendance|classes|progress|payments` paths remain removed
- preserve only explicit role paths in new work
- validate analytics/events tracking continuity
- complete regression pass:
  - auth and membership states
  - tenant host switching
  - multi-role behavior

### Done Criteria

- old paths redirected safely
- quality suite passing
- rollout notes documented

### Status

- [ ] not started

## Security Matrix (Must Hold)

- Teacher route + teacher API:
  - membership must be `TEACHER` and active in current tenant
  - resource scope restricted to assigned classes/students only

- Student route + student API:
  - membership must be `STUDENT` and active in current tenant
  - only own records returned

- Cross-role attempt:
  - always `403` from backend

## Testing Strategy

## Automated

- typecheck on each phase
- integration tests for app contracts
- e2e role journeys:
  - teacher attendance execution
  - student personal visibility
  - forbidden cross-role access

## Manual smoke

- tenant host URLs (`dojo-centro.localhost`)
- responsive checks (mobile + desktop)
- route redirect behavior from `/app`

## Risks and Mitigations

1. Risk: route migration breaks existing deep links.
- Mitigation: maintain redirects and announce deprecation window.

2. Risk: duplicated UI logic drifts between roles.
- Mitigation: enforce `features/base + adapters` after first slices.

3. Risk: frontend accidentally carries business rules.
- Mitigation: code review gate: reject UI-side domain logic.

4. Risk: partial authorization (guard-only).
- Mitigation: backend checks mandatory in all `/api/app/*` handlers.

## Tracking Board

Use this checklist during execution:

- [ ] Phase 0 completed
- [x] Phase 0 completed
- [x] Phase 1 completed
- [x] Phase 2 completed
- [ ] Phase 3 completed
- [ ] Phase 4 completed
- [ ] Phase 5 completed

Current focus:

- `Phase 3` -> completar núcleo do Aluno (Resumo, Presenca, Turmas, Evolucao, Pagamentos, Perfil)

Next milestone:

- `Phase 3` -> Student Core estabilizado em `/app/aluno/*`
