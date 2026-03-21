# Action Plan

## Objective

Define a practical execution plan for evolving the project from an uneven but solid architectural base into a coherent product with real operational depth.

This plan is based on:

- current architecture
- observed module maturity
- business priorities implicit in the repository
- minimizing retrabalho
- protecting the multi-tenant foundation already in place

## Planning Principles

The sequence below follows these rules:

1. strengthen shared foundations before expanding surfaces
2. turn visually advanced modules into real product modules before adding new ones
3. complete academy operations before deepening platform-operator tooling
4. keep tenant-aware access and onboarding stable throughout
5. prefer end-to-end business flows over isolated screen work

## Strategic Goal

Move the product to a state where:

- academy onboarding is reliable and complete
- academy admins can run core operations with real data
- teachers and students can use the tenant app for daily workflows
- platform administration is built on top of proven tenant operations rather than ahead of them

## Recommended Delivery Sequence

### Phase 0. Lock Architectural Direction

Goal:

- remove ambiguity about the medium-term runtime architecture

Why now:

- the codebase already behaves as a modular monolith in Next.js
- the roadmap still references a future Nest bootstrap
- this ambiguity can cause duplicated effort and bad boundaries

Actions:

- decide explicitly whether the medium-term target is:
  - modular monolith in Next.js
  - or extracted backend service later
- document the decision and expected migration boundary
- freeze backend implementation conventions for new work

Deliverables:

- architecture decision record
- updated backend roadmap aligned with current implementation reality

Definition of done:

- team has one stated backend direction
- no new feature work is implemented against contradictory assumptions

## Phase 1. Stabilize Core Access and Tenant Operations

Goal:

- make the current identity, tenancy, and onboarding core fully dependable

Why first:

- every other product surface depends on this layer
- instability here will multiply rework everywhere else

Actions:

- audit edge cases in:
  - login
  - logout
  - tenant switching
  - invitation acceptance
  - enrollment approval
  - password reset
- verify membership status transitions are consistent
- verify tenant host resolution works across localhost, preview, and production assumptions
- verify cookies and active tenant selection behave correctly across platform and tenant surfaces

Deliverables:

- hardened auth and onboarding flows
- explicit environment rules for tenancy
- regression checklist for access flows

Definition of done:

- user can move from account creation to valid tenant access without manual intervention
- admin can switch and operate the correct tenant predictably
- access edge cases no longer depend on implicit assumptions

## Phase 2. Complete Academy Activation Flow

Goal:

- make a newly created academy operational end-to-end

Why now:

- self-service academy creation already exists
- the highest business leverage comes from reducing time-to-first-value for a new tenant

Actions:

- validate the academy setup journey step by step:
  - academy info
  - location
  - class structure/modalities
  - teachers
  - plans
  - branding
  - payments
- enforce required completion rules consistently
- ensure each setup step writes real tenant data that downstream modules consume
- eliminate fallback-only behavior where setup data should have become canonical domain data

Deliverables:

- fully usable academy setup flow
- academy state ready for real operations after onboarding completion

Definition of done:

- a brand-new academy can sign up, finish setup, and immediately manage teachers, classes, plans, and app access

## Phase 3. Turn Students Into a Real Domain

Goal:

- convert `students` from a UI-heavy module into a real operational module

Why this is the highest product gap:

- students are central to the business
- current students experience appears visually mature but weak in confirmed backend depth
- attendance, billing, progress, and app features all depend on a proper student domain

Actions:

- define the student domain boundary explicitly
- implement a real students backend module under `apps/api/src/modules`
- establish real student listing, detail, enrollment, status, and profile flows
- connect dashboard screens to persisted student records instead of embedded mock data
- define how a `student` relates to:
  - `User`
  - `AcademyMembership`
  - `Subscription`
  - classes
  - attendance
  - progression/graduation

Deliverables:

- real students backend module
- real dashboard student list and detail flows
- persisted student lifecycle states

Definition of done:

- student management no longer depends on in-file mock datasets
- classes and attendance consume authoritative student data

## Phase 4. Make Attendance a First-Class Operational Flow

Goal:

- move attendance from derived class behavior to a reliable operational workflow

Why now:

- attendance already depends on classes and student candidates
- once students are real, attendance becomes a high-value daily-use capability

Actions:

- clarify whether attendance remains modeled inside `ClassSession` or becomes its own domain service boundary
- implement explicit attendance commands:
  - mark present
  - mark absent
  - bulk confirm roster
  - reopen/fix attendance
- improve reporting and auditability
- ensure teacher and admin permissions are consistent

Deliverables:

- durable attendance workflow
- explicit API contract for attendance actions
- reports based on real session attendance data

Definition of done:

- attendance can be reliably recorded, corrected, and reported without screen-local assumptions

## Phase 5. Deepen Tenant App for Daily Use

Goal:

- make the `/app` surface genuinely useful for teachers and students

Why now:

- the tenant app already has a strong access-state shell
- daily product value will come from actual routines, not only admin operations

Priority flows:

- teacher class agenda
- teacher attendance execution
- student schedule
- student payment visibility
- student progress view
- student profile/security self-service

Actions:

- map each `/app` page to a real backend contract
- remove purely structural app pages by giving them real use cases
- define role-specific app navigation and page behaviors
- ensure the app uses current tenant context cleanly

Deliverables:

- meaningful teacher workspace
- meaningful student workspace
- role-specific tenant app behavior

Definition of done:

- a teacher can use the app to run classes and attendance
- a student can use the app to view schedule, status, and core academy information

## Phase 6. Connect Finance to Real Business Behavior

Goal:

- turn finance from a surface into a business-capable module

Why after students and attendance:

- finance depends on real students, plans, and subscriptions
- billing UI before domain completion would create expensive rework

Actions:

- define billing lifecycle clearly:
  - subscription start
  - renewal
  - overdue
  - cancellation
- model tenant-facing financial views separate from platform billing views
- connect dashboard finance screens to real subscription/payment state
- decide scope for payment gateway integration versus manual operational finance

Deliverables:

- real finance domain boundary
- dashboard finance views backed by real subscription/payment data

Definition of done:

- academy admin can understand who is active, delinquent, or due for renewal from real data

## Phase 7. Mature Platform Surface

Goal:

- build the operator-facing platform surface on top of validated tenant operations

Why later:

- platform tooling is only useful when tenant and academy workflows are trustworthy
- current `/platform` pages are structurally ahead of domain depth

Priority modules:

- academies
- billing oversight
- metrics
- support tooling

Actions:

- define platform-operator use cases explicitly
- build tenant search, tenant status review, billing oversight, and support inspection flows
- use real cross-tenant data rather than dashboard-style placeholder widgets

Deliverables:

- real platform operator workflows
- platform-level reporting based on tenant data

Definition of done:

- platform admin can inspect and manage tenants from real operational data

## Phase 8. Expand Peripheral Modules

Goal:

- evolve secondary modules only after the core business loop is stable

Modules:

- crm
- events
- techniques
- graduations

Why last:

- these are meaningful differentiators
- they are not the current bottleneck for operational product viability

Actions:

- validate product need and process for each module
- define whether each one is:
  - operationally essential
  - retention-enhancing
  - strategic differentiation
- implement only after student, attendance, app, and finance foundations are solid

Deliverables:

- scoped product definitions
- module-by-module implementation plans

## Cross-Cutting Workstreams

These should run alongside the phases above.

### 1. Testing and Verification

Actions:

- add integration coverage for core flows
- prioritize auth, onboarding, tenant switching, teachers, classes, attendance
- add smoke coverage for the main dashboard and app entry points

### 2. Authorization Consistency

Actions:

- audit all routes and screens against the capability model
- keep capabilities as the single permission language
- remove drift between UI navigation and API enforcement

### 3. Deployment and Environment Readiness

Actions:

- define tenant host strategy for local, preview, and production
- standardize environment variables and host mapping
- document deployment assumptions for wildcard subdomains and custom domains

### 4. Data Migration Hygiene

Actions:

- keep schema evolution disciplined
- ensure seed data continues to represent realistic multi-tenant usage
- avoid temporary columns or shortcuts that collapse membership and billing concerns

## Suggested Execution Buckets

If this needs to be executed in roadmap buckets, the best grouping is:

### Bucket A. Product Core Reliability

- Phase 0
- Phase 1
- Phase 2

Expected outcome:

- trustworthy access, onboarding, and tenant activation

### Bucket B. Academy Operational Core

- Phase 3
- Phase 4
- Phase 5

Expected outcome:

- academy can actually run students, classes, attendance, and tenant app workflows

### Bucket C. Commercial and Platform Scale

- Phase 6
- Phase 7
- Phase 8

Expected outcome:

- finance becomes real
- platform operator workflows become valuable
- differentiator modules can be added safely

## Immediate Next Actions

If the team wants the smallest high-impact next step, the best immediate actions are:

1. decide and document the medium-term backend architecture
2. audit and harden the full access/onboarding path
3. define the real `students` domain model and implementation scope

## Bottom Line

The right move is not to expand the visible surface area first.

The right move is to convert the existing strong architectural core into a complete academy operating loop:

- onboarding
- students
- teachers
- classes
- attendance
- tenant app
- finance

Once that loop is real, the platform surface and peripheral modules can scale without compounding rework.
