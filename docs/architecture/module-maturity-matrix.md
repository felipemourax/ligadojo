# Module Maturity Matrix

## Objective

Classify the current maturity of each relevant module and surface in the repository based on observable implementation, not only intended architecture.

This document is meant to answer:

- what is already functional
- what is partially implemented
- what is mostly UI
- what is foundational but not product-complete
- where delivery risk is concentrated

## Classification Criteria

The maturity levels used here are:

### `foundational`

The module provides core platform infrastructure or domain foundations that other modules depend on.

Typical signals:

- real persistence model
- domain services and repositories
- active use by several flows

### `functional-core`

The module has meaningful business functionality with real API behavior, persistence, and UI or consumer integration.

Typical signals:

- real route handlers
- real service/repository orchestration
- non-trivial business rules
- concrete user-facing flow

### `partial`

The module is real but incomplete.

Typical signals:

- some API coverage exists
- some persistence exists
- UI uses real backend in parts
- important workflow gaps still remain

### `ui-only`

The module has visible UI but little or no confirmed backend/domain depth behind it.

Typical signals:

- page exists
- mostly local/static data
- no dedicated backend module or product flow found

### `structural`

The module exists mainly as routing/navigation/placeholder structure.

Typical signals:

- manifest or page exists
- little or no domain implementation
- no meaningful persisted flow confirmed

## Surface Summary

### `/dashboard`

Overall maturity: `partial` to `functional-core`

Reason:

- strongest implemented surface
- multiple modules with real APIs and Prisma-backed flows
- still mixed with placeholder screens and static data

### `/app`

Overall maturity: `partial`

Reason:

- tenant-aware access behavior exists
- role-aware app entry flow exists
- deeper day-to-day student/teacher product workflows appear thinner than dashboard admin flows

### `/platform`

Overall maturity: `ui-only` to `structural`

Reason:

- route structure exists
- surface intent is clear
- current pages appear mostly illustrative and not yet backed by deep platform-domain flows

## Foundational Modules

### IAM

Maturity: `foundational`

Why:

- real password auth flow
- session issuance and resolution
- password reset endpoints
- session composition service used by the application

Evidence:

- [`app/api/auth/session/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/session/route.ts)
- [`app/api/auth/password-reset/request/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/password-reset/request/route.ts)
- [`apps/api/src/modules/iam`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/iam)

Assessment:

- not necessarily feature-complete from a SaaS security perspective
- already foundational and operationally real

### Tenancy

Maturity: `foundational`

Why:

- host-based tenant resolution is implemented
- request headers are enriched with tenant context
- tenancy affects routing and access behavior

Evidence:

- [`proxy.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/proxy.ts)
- [`lib/tenancy/resolve-tenant.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/resolve-tenant.ts)
- [`apps/api/src/modules/tenancy`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/tenancy)

Assessment:

- architecturally important and already active
- still sensitive to deployment/environment consistency

### Academy Memberships

Maturity: `foundational`

Why:

- this is the core tenant access boundary
- multiple flows depend on it
- repository and service layer exist

Evidence:

- [`apps/api/src/modules/academy-memberships`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/academy-memberships)
- [`app/api/_lib/dashboard-tenant-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts)

Assessment:

- one of the central domain pillars of the system

### Invitations

Maturity: `foundational` to `functional-core`

Why:

- invitation acceptance endpoints exist
- invitation service exists
- invitation acceptance and membership activation now live in the `invitations` module

Evidence:

- [`app/api/invitations/[token]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/%5Btoken%5D/route.ts)
- [`app/api/invitations/accept/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/accept/route.ts)
- [`apps/api/src/modules/invitations`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/invitations)

### Enrollment Requests

Maturity: `foundational` to `functional-core`

Why:

- tenant enrollment request flows exist
- public enrollment submission and approval/review behavior now live in the `enrollment-requests` module, while onboarding remains responsible for academy setup

Evidence:

- [`app/api/enrollment-requests/[requestId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/enrollment-requests/%5BrequestId%5D/route.ts)
- [`app/api/tenants/[tenantSlug]/enrollment-requests/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/tenants/%5BtenantSlug%5D/enrollment-requests/route.ts)
- [`apps/api/src/modules/enrollment-requests`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/enrollment-requests)

### Onboarding

Maturity: `functional-core`

Why:

- self-service academy creation is implemented
- tenant onboarding steps are persisted and updated
- onboarding completion rules exist
- onboarding composes access artifacts and tenant setup

Evidence:

- [`app/api/onboarding/academy/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy/route.ts)
- [`app/api/onboarding/academy-setup/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy-setup/route.ts)
- [`apps/api/src/modules/onboarding`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding)

Assessment:

- one of the clearest real business flows in the system

## Dashboard Module Matrix

### Dashboard Overview

Maturity: `ui-only`

Why:

- polished dashboard page exists
- visible KPIs and widgets are static
- no dedicated overview aggregation backend was identified

Evidence:

- [`app/dashboard/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/page.tsx)

### Students

Maturity: `ui-only`

Why:

- student dashboard screen is rich visually
- screen uses large in-file mock/static datasets
- no dedicated students backend module exists under `apps/api/src/modules/students`
- only student candidate APIs were found, likely supporting attendance/classes rather than a full student domain

Evidence:

- [`modules/students/components/students-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/components/students-dashboard-screen.tsx)
- [`app/api/students/candidates/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/students/candidates/route.ts)

Assessment:

- strong UI direction
- weak confirmed domain depth today

### Athletes

Maturity: `functional-core`

Why:

- dedicated persistence now exists for athlete titles through `AthleteTitle`;
- admin dashboard has real API for unified athlete/title management;
- student and teacher apps now expose self-service title tabs through dedicated BFF routes;
- public ranking and academy ranking profile now consume a real backend module instead of mock data.

Evidence:

- [`app/dashboard/athletes/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/athletes/page.tsx)
- [`modules/athletes`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/athletes)
- [`apps/api/src/modules/athletes`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/athletes)
- [`app/api/athletes/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/athletes/route.ts)
- [`app/api/ranking/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/ranking/route.ts)
- [`app/api/app/student/profile/titles/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/profile/titles/route.ts)
- [`app/api/app/teacher/profile/titles/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/profile/titles/route.ts)

Assessment:

- the module already has real persistence, admin flow, app flow, and public surface;
- academy public profile still depends on the academy having enough public metadata configured to fully populate logo/banner/socials.

### Teachers

Maturity: `functional-core`

Why:

- teacher list and registration flow exist
- review and approval behavior exists
- real service layer exists
- teacher profile, membership, invitation, and compensation concepts are implemented

Evidence:

- [`app/api/teachers/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/route.ts)
- [`app/api/teachers/[teacherId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/%5BteacherId%5D/route.ts)
- [`app/api/teachers/pending-approvals/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/pending-approvals/route.ts)
- [`modules/teachers/components/teachers-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/components/teachers-dashboard-screen.tsx)
- [`apps/api/src/modules/teachers`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/teachers)

### Classes

Maturity: `functional-core`

Why:

- class listing and creation APIs exist
- class sessions exist
- UI loads real classes, modalities, teachers, and student candidates
- domain and repository structure is real

Evidence:

- [`app/api/classes/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/route.ts)
- [`app/api/classes/[classId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/%5BclassId%5D/route.ts)
- [`app/api/classes/sessions/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/sessions/route.ts)
- [`modules/classes/components/classes-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/classes/components/classes-dashboard-screen.tsx)
- [`apps/api/src/modules/classes`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/classes)

### Attendance

Maturity: `partial`

Why:

- attendance UI consumes real classes and students data
- attendance behavior is tied to class session presence arrays in the schema
- dedicated attendance admin transport now exists in `app/api/attendance/*`
- dedicated attendance contracts and service now exist under `apps/api/src/modules/attendance`
- the module still reuses `classes` persistence and session arrays instead of owning an independent persistence model

Evidence:

- [`app/api/attendance/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/attendance/route.ts)
- [`app/api/attendance/sessions/[sessionId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/attendance/sessions/%5BsessionId%5D/route.ts)
- [`apps/api/src/modules/attendance/services/attendance-dashboard.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/attendance/services/attendance-dashboard.service.ts)
- [`modules/attendance/components/attendance-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/attendance/components/attendance-dashboard-screen.tsx)
- [`prisma/schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)

Assessment:

- operationally relevant and partially real
- transport and contracts are now aligned to the attendance ownership
- persistence still piggybacks on classes rather than standing as a fully mature bounded context

### Modalities

Maturity: `functional-core`

Why:

- real API exists
- UI loads and persists modality configuration
- dedicated backend module exists with domain/repository/service structure
- modalities are referenced by plans, classes, and teachers

Evidence:

- [`app/api/modalities/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/modalities/route.ts)
- [`modules/modalities/components/modalities-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/modalities/components/modalities-dashboard-screen.tsx)
- [`apps/api/src/modules/modalities`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/modalities)

### Plans

Maturity: `functional-core`

Why:

- real API exists for plans
- UI loads and updates plans with billing cycle, class limits, and included modalities
- dedicated backend module exists

Evidence:

- [`app/api/plans/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/plans/route.ts)
- [`modules/plans/components/plans-dashboard-screen.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/plans/components/plans-dashboard-screen.tsx)
- [`apps/api/src/modules/plans`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/plans)

Assessment:

- this is a real administrative module
- full billing lifecycle still appears incomplete beyond plan definition

### Graduations

Maturity: `ui-only`

Why:

- screen and module exist
- no dedicated backend module was identified
- no clear persisted graduation workflow was found in the backend structure

Evidence:

- [`app/dashboard/graduations/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/graduations/page.tsx)
- [`modules/graduations`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/graduations)

### Finance

Maturity: `functional-core`

Why:

- dedicated backend finance module exists
- dashboard finance has real charge creation and payment registration
- student app already consumes real payment state and plan activation flow
- finance now governs plan transition and delinquency behavior

Evidence:

- [`app/dashboard/finance/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/finance/page.tsx)
- [`modules/finance`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/finance)
- [`apps/api/src/modules/finance`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/finance)
- [`app/api/finance/settings/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/finance/settings/route.ts)
- [`app/api/app/student/plans/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/plans/route.ts)

### CRM

Maturity: `ui-only`

Why:

- module exists in navigation and pages
- no dedicated CRM backend module or persistence layer was found

Evidence:

- [`app/dashboard/crm/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/crm/page.tsx)
- [`modules/crm`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/crm)

### Events

Maturity: `partial`

Why:

- module and page exist
- dedicated backend/events module exists
- admin dashboard creates events and manages participants with real persistence
- teacher app already consumes upcoming events through its own BFF
- teacher app now also adiciona participante no proprio evento com reflexo financeiro automatico
- student app now also consumes events through its own BFF and self-service flow
- contracts and role semantics still need refinements, but the app surfaces are no longer admin-only

Evidence:

- [`app/dashboard/events/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/events/page.tsx)
- [`modules/events`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/events)
- [`apps/api/src/modules/events`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/events)
- [`app/api/events/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/events/route.ts)
- [`app/api/app/teacher/events/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/events/route.ts)
- [`app/api/app/teacher/events/[eventId]/participants/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/teacher/events/%5BeventId%5D/participants/route.ts)
- [`app/api/app/student/events/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/app/student/events/route.ts)

### Techniques

Maturity: `ui-only`

Why:

- module and page exist
- no dedicated backend/techniques module was identified

Evidence:

- [`app/dashboard/techniques/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/techniques/page.tsx)
- [`modules/techniques`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/techniques)

### Settings

Maturity: `partial`

Why:

- settings pages exist
- academy-related settings intersect with real modules such as onboarding, branding, modalities, and plans
- settings as a unified domain is not fully centralized
- finance policies are now intentionally centralized in `Settings > Payments`

Evidence:

- [`app/dashboard/settings`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/dashboard/settings)
- [`app/api/uploads/branding/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/uploads/branding/route.ts)
- [`app/api/tenancy/current-branding/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/tenancy/current-branding/route.ts)

## Tenant App Matrix

### Tenant App Entry

Maturity: `functional-core`

Why:

- the app entry flow is tenant-aware
- access state handling is nuanced and real
- user experience changes by membership/enrollment state

Evidence:

- [`app/app/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/page.tsx)
- [`app/api/me/tenant-access/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/me/tenant-access/route.ts)

### Generic App Routes

Maturity: `removed`

Why:

- generic `/app/*` feature routes were removed in favor of explicit role segmentation
- app navigation and experience now live under `/app/teacher/*` and `/app/student/*`

Evidence:

- [`app/app/teacher`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/teacher)
- [`app/app/student`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/student)

## Platform Surface Matrix

### Platform Home

Maturity: `ui-only`

Why:

- polished page exists
- metrics are static and illustrative

Evidence:

- [`app/platform/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/platform/page.tsx)

### Platform Academies

Maturity: `structural`

Why:

- route exists
- tenancy search APIs exist, but a full operator workflow is not yet clearly visible

Evidence:

- [`app/platform/academies/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/platform/academies/page.tsx)
- [`app/api/tenancy/search/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/tenancy/search/route.ts)

### Platform Billing

Maturity: `structural`

Why:

- route exists
- platform billing operations are not yet clearly implemented beyond page structure

Evidence:

- [`app/platform/billing/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/platform/billing/page.tsx)

### Platform Metrics

Maturity: `structural`

Why:

- route exists
- no dedicated operator analytics backend was identified

Evidence:

- [`app/platform/metrics/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/platform/metrics/page.tsx)

### Platform Support

Maturity: `structural`

Why:

- route exists
- no dedicated support/ticketing backend was identified

Evidence:

- [`app/platform/support/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/platform/support/page.tsx)

## Cross-Cutting Readiness Assessment

### Strongest Areas

- IAM
- tenancy
- memberships/invitations/enrollment
- onboarding
- teachers
- classes
- modalities
- plans

These modules form the real product core today.

### Intermediate Areas

- attendance
- settings
- tenant app shell

These areas are useful and partially real, but still rely on adjacent modules more than on fully mature standalone domains.

### Weakest Areas

- platform operator surface
- students as a fully backed module
- finance
- crm
- events
- techniques
- graduations
- deeper end-user app modules

These areas currently appear more like product direction than finished product capability.

## Recommended Priority Order

If the goal is to increase real product maturity without rework, the recommended order is:

1. complete tenant access and onboarding edge cases
2. deepen students as a real backend domain
3. complete attendance as a first-class operational flow
4. connect finance UI to real billing/payment behavior
5. mature the tenant app around real teacher/student daily workflows
6. only then expand platform operator modules

## Bottom Line

The project is not a prototype in architecture, but it is still uneven in delivery maturity.

Today, the most credible statement is:

The system already has a real multi-tenant operational core around identity, tenancy, onboarding, teachers, classes, modalities, and plans. The rest of the product surface is present, but several modules are still primarily UI, structural scaffolding, or partially implemented flows.
