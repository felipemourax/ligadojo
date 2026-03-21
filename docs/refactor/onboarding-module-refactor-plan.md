# Onboarding Module Refactor Plan

## Scope
- Module: `onboarding`
- Goal: improve UI/UX fidelity (based on `reference-ui/DASHBOARDS`), architecture consistency, and clean code quality.
- Constraint: preserve current approved implementations for:
  - onboarding step: `class_structure` (modalidades da academia)
  - onboarding step: `plans`
  - onboarding step: `teachers`

## Current Baseline
- Main flow UI is implemented in:
  - `components/onboarding/academy-setup-gate.tsx`
- API endpoints:
  - `app/api/onboarding/academy/route.ts`
  - `app/api/onboarding/academy-setup/route.ts`
- Backend services:
  - `apps/api/src/modules/onboarding/services/*`

## Refactor Strategy (Incremental)

### Phase 1 - UX shell + consistency (in progress)
- Refactor onboarding shell visuals (header/stepper/footer) to match v0 reference style.
- Keep form logic and approved step implementations intact.
- Remove duplicated domain constants/types where possible.

### Phase 2 - Component decomposition
- Split `academy-setup-gate.tsx` into:
  - `shell` (dialog + stepper + navigation)
  - `step sections` (academy_info/location/branding/payments)
  - `shared form primitives`
- Keep `class_structure`, `teachers`, `plans` code unchanged in behavior and structure.

### Phase 3 - Backend cleanup
- Review onboarding services/repositories for SOLID boundaries:
  - input validation location
  - mapping responsibility
  - transaction boundaries
  - naming and domain consistency
- Preserve API contracts consumed by current frontend.

### Phase 4 - Final quality gate
- Build and runtime smoke checks (admin flow + setup completion).
- Validate legacy redirects and onboarding gate behavior.
- Run focused regression checks on:
  - `class_structure`
  - `teachers`
  - `plans`

## Acceptance Criteria
- UI shell aligned with reference style.
- No behavior regression in approved frozen steps.
- No broken API contracts.
- Build passes and onboarding flow remains operational end-to-end.
