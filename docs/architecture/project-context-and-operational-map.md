# Project Context and Operational Map

## Objective

Consolidate the current understanding of the project across:

- business context
- product surfaces
- architectural structure
- backend and frontend responsibilities
- implemented business flows
- current state versus target state
- architectural risks and technical priorities

This document is grounded in the current repository state. It is not a future-state proposal by itself.

## Executive Summary

This project is a multi-tenant SaaS platform for martial arts academies.

The core product idea is:

- one platform serves many academies
- users are global accounts
- access to each academy is granted through tenant-scoped memberships
- the academy operates through an admin dashboard
- teachers and students access a tenant app/PWA
- onboarding can happen either by self-service academy creation or by academy-controlled invite/access flows

The implementation currently follows a modular monolith approach:

- Next.js App Router hosts both UI and API routes
- backend domain logic is organized under `apps/api/src/modules`
- Prisma + PostgreSQL provide persistence
- product navigation and module activation are capability-driven
- tenancy is resolved by host/subdomain and propagated through request headers

## Business Context

### Core Business Entity

The primary customer is a martial arts academy operating as a tenant.

Each academy needs to manage:

- academy identity and branding
- physical location and setup
- teachers
- students
- modalities
- plans and recurring payments
- classes and attendance
- internal operations such as CRM, events, graduations, and techniques

### User Types

The business model supports four user positions:

- `platform_admin`: platform owner/operator
- `academy_admin`: academy owner or staff with management access
- `teacher`: instructor with academy-linked responsibilities
- `student`: end user consuming academy services

These roles are represented in code via:

- access roles in [`lib/access-control.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/access-control.ts)
- capabilities in [`lib/capabilities.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/capabilities.ts)

### Key Business Rule

The most important domain rule is that access and billing are separate concerns:

- `AcademyMembership` controls who can access a tenant
- `Subscription` controls commercial status

This is a strong architectural decision and is already reflected in the data model.

## Product Surfaces

The system is intentionally split into three main surfaces.

### 1. Platform Surface

Path prefix:

- `/platform`

Purpose:

- global administration of the SaaS
- platform-wide metrics
- billing oversight
- support tooling
- academy lifecycle visibility

Current state:

- routes and pages exist
- surface appears lighter than the dashboard in implementation depth

### 2. Academy Dashboard Surface

Path prefix:

- `/dashboard`

Purpose:

- operational control panel for academy admins
- partial operational access for teachers when capabilities allow

Current modules visible in the dashboard registry:

- dashboard
- modalities
- plans
- classes
- students
- teachers
- attendance
- graduations
- finance
- events
- techniques
- crm

Source of truth:

- [`lib/module-registry.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/module-registry.ts)

### 3. Tenant App Surface

Path prefix:

- `/app`

Purpose:

- student and teacher experience
- role-adapted workspace inside the current tenant
- PWA-style access for routine academy interactions

Current intent visible in routes:

- agenda
- attendance
- classes
- progress
- payments
- profile

## Architectural Style

### Current Style

The repository currently implements a modular monolith.

That means:

- frontend and backend live in one repo
- the Next.js application serves pages and API routes
- backend logic is still separated into domain modules rather than embedded directly into route handlers

This is a pragmatic architecture for the current stage because it preserves delivery speed while keeping the core domain model organized enough for later extraction if necessary.

### Runtime Structure

The current stack is:

- Next.js 16
- React 19
- Prisma 7
- PostgreSQL via `@prisma/adapter-pg`

Primary sources:

- [`package.json`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/package.json)
- [`apps/api/src/infrastructure/prisma/prisma-client.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/infrastructure/prisma/prisma-client.ts)

## Domain Architecture

### Identity and Access

The identity model is global to the platform.

Core entities:

- `User`
- `AuthIdentity`
- `PasswordCredential`
- `UserSession`
- `PasswordResetToken`

Responsibilities:

- login and password authentication
- session issuance and resolution
- password reset
- system-level role composition

Relevant files:

- [`app/api/auth/session/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/session/route.ts)
- [`apps/api/src/modules/iam/services/password-auth.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/iam/services/password-auth.service.ts)
- [`apps/api/src/modules/iam/services/session-composer.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/iam/services/session-composer.service.ts)

### Tenancy

The project is host-aware and resolves tenant context from the request host.

Key ideas:

- platform hosts are treated differently from tenant hosts
- subdomains are first-class
- custom domains are supported conceptually
- tenant context is propagated through request headers

Relevant files:

- [`proxy.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/proxy.ts)
- [`lib/tenancy/resolve-tenant.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/resolve-tenant.ts)
- [`lib/tenancy/get-tenant-context.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/get-tenant-context.ts)

### Tenant Access Model

Tenant access is modeled through:

- `Tenant`
- `TenantDomain`
- `AcademyMembership`
- `Invitation`
- `EnrollmentRequest`

This is one of the strongest parts of the architecture because it avoids collapsing onboarding, identity, and authorization into a single flat user record.

### Academy Operations

The academy domain already includes meaningful operational entities:

- `Modality`
- `TeacherProfile`
- `TeacherCompensation`
- `ClassGroup`
- `ClassSchedule`
- `ClassSession`
- `Plan`
- `Subscription`
- `TenantBranding`
- `TenantPaymentSettings`
- `TenantOnboarding`

Primary model source:

- [`prisma/schema.prisma`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/schema.prisma)

## Backend Organization

Backend domain logic is grouped under:

- `apps/api/src/modules/iam`
- `apps/api/src/modules/tenancy`
- `apps/api/src/modules/academy-memberships`
- `apps/api/src/modules/invitations`
- `apps/api/src/modules/enrollment-requests`
- `apps/api/src/modules/onboarding`
- `apps/api/src/modules/modalities`
- `apps/api/src/modules/plans`
- `apps/api/src/modules/classes`
- `apps/api/src/modules/teachers`

Each module generally follows a consistent internal structure:

- `domain`
- `repositories`
- `services`

This is a healthy sign. The project already distinguishes:

- transport layer concerns in `app/api`
- domain orchestration in services
- persistence in repositories

## Frontend Organization

The frontend is organized around product modules and shared UI primitives.

Key areas:

- `app/`: routes and surfaces
- `modules/`: feature manifests, screens, hooks, services
- `components/ui/`: reusable UI building blocks
- `components/layout/`: shell and navigation primitives
- `lib/`: routing, access, navigation, tenancy, API helpers

The feature module system is especially important.

The navigation and module availability model is driven by manifests such as:

- [`modules/dashboard/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/dashboard/manifest.ts)
- [`modules/students/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/students/manifest.ts)
- [`modules/teachers/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/teachers/manifest.ts)
- [`modules/classes/manifest.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/modules/classes/manifest.ts)

This makes the frontend architecture more extensible than a flat page-by-page approach.

## Implemented Business Flows

### 1. Authentication

Observed behavior:

- login accepts email and password
- valid login creates a session cookie
- dashboard tenant preference can also be stored in a cookie
- logout destroys the session token

Primary route:

- [`app/api/auth/session/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/session/route.ts)

### 2. Self-Service Academy Creation

Observed behavior:

- a new academy can be created directly by an owner
- a user account and password credentials are created
- a session is issued immediately
- dashboard tenant cookie is attached after creation

Primary route:

- [`app/api/onboarding/academy/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy/route.ts)

Business meaning:

- this is the acquisition/onboarding funnel for new academies joining the SaaS

### 3. Academy Setup Onboarding

Observed behavior:

- onboarding state is stored per tenant
- the setup is step-based
- steps include academy info, location, class structure, teachers, plans, branding, and payments
- completion is blocked until required steps are done

Primary route:

- [`app/api/onboarding/academy-setup/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy-setup/route.ts)

Business meaning:

- this is the post-signup activation path for newly created academies

### 4. Teacher Registration and Invitation

Observed behavior:

- academy admins can create teacher profiles
- an email can be linked to a global user
- teacher membership may be created or reused
- invitation flow is triggered when needed
- compensation and modality associations are part of the process

Primary route:

- [`app/api/teachers/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/teachers/route.ts)

Business meaning:

- teacher onboarding is not just a contact list operation; it is tied to access control and operational readiness

### 5. Class Management

Observed behavior:

- academy admins with the proper capability can list and create class groups
- class creation is delegated to a dedicated service

Primary route:

- [`app/api/classes/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/classes/route.ts)

Business meaning:

- classes are treated as first-class operational entities rather than UI-only artifacts

### 6. Tenant App Access Resolution

Observed behavior:

- the tenant app determines access state for the current user and tenant
- the UI distinguishes active, invited, pending, rejected, revoked, suspended, and unauthenticated states
- teachers can see a transitional experience while awaiting approval

Primary page:

- [`app/app/page.tsx`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/app/page.tsx)

Business meaning:

- the app is intended to support nuanced onboarding and access transitions, not just binary logged-in access

## Authorization Model

Authorization is capability-based on top of role vocabulary.

This is important because:

- roles are coarse-grained and easy to reason about
- capabilities are more precise and can evolve independently
- frontend module access and backend route enforcement can converge on the same permission language

Current enforcement examples:

- dashboard route and module navigation logic use role/capability combinations
- API routes use `requireDashboardTenantCapability`

Relevant files:

- [`lib/capabilities.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/capabilities.ts)
- [`app/api/_lib/dashboard-tenant-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts)

## Current State Versus Target State

### What Is Already Strong

- multi-tenant domain model is well defined
- access model is significantly more mature than a typical early SaaS
- backend logic is not collapsed into route handlers
- tenancy by host is already implemented at the request level
- frontend module registry provides a scalable navigation model
- self-service academy onboarding is already a concrete product flow

### What Looks Partially Implemented

- some dashboard screens still present static or placeholder data
- the `/platform` surface exists, but appears less complete than the academy dashboard
- some operational modules are present in navigation before their business depth is fully visible
- the blueprint still references a future Nest bootstrap, while the current runtime stays inside Next API routes

### What Is Clearly Planned But Not Yet Complete

- fuller platform administration
- richer billing lifecycle
- more complete student operations
- deeper teacher workspace inside the tenant app
- end-to-end production-grade domain flows for all modules

## Seeded Product Context

The seed data confirms the intended usage model.

Examples present in the seed:

- multiple tenants
- academy admin users
- teacher users
- student users
- membership links across users and tenants
- localhost tenant domains

Source:

- [`prisma/seed.mjs`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/prisma/seed.mjs)

This is useful because it shows the team is already testing the system as a true multi-tenant environment rather than a single-tenant shortcut.

## Architectural Risks

### 1. Dual Intention Between Next API and Future Nest Backend

The roadmap still points to a Nest backend foundation, but the real implementation has already grown materially inside Next API routes and domain services.

Risk:

- the project may drift into an unclear target architecture

Decision needed:

- either commit to the modular monolith for the medium term
- or define a deliberate extraction path from `app/api` to a separate service boundary

### 2. Surface Depth Is Uneven

The dashboard surface is materially ahead of the platform surface and likely ahead of the tenant app in business depth.

Risk:

- product scope can appear broader than the actually completed workflows

### 3. Capability Model Must Remain the Single Permission Language

There are signs that the project has improved its routing and navigation sources of truth, but this can regress easily as modules grow.

Risk:

- permission logic may drift between manifests, pages, route guards, and API checks

### 4. Tenant Resolution Is Strong Conceptually but Still Sensitive Operationally

Host-based tenancy is correct for the product, but it introduces deployment and environment complexity.

Risk:

- local, preview, and production environments can diverge if host mapping is not standardized

### 5. Some Screens May Overrepresent Readiness

Certain dashboard views already look productized while still relying on placeholder or static data.

Risk:

- implementation confidence can be overstated if UI polish is mistaken for domain completion

## Technical Priorities

### Priority 1. Lock the Target Runtime Architecture

Decide whether the medium-term architecture is:

- modular monolith in Next.js
- or extracted backend service

This decision will affect deployment, auth boundaries, and how aggressively to keep building inside `app/api`.

### Priority 2. Define a Current-State Delivery Map Per Surface

For each surface, classify modules as:

- conceptual only
- UI-only
- partially functional
- production-capable

This will make roadmap conversations more honest and easier to prioritize.

### Priority 3. Standardize Tenant-Aware Deployment

The product depends on host-aware routing.

That means deployment needs explicit rules for:

- platform host
- wildcard subdomains
- custom domains
- preview environment behavior

### Priority 4. Keep Backend Flows Ahead of UI Expansion

The repository already hints at this principle in the backend roadmap.

Recommended focus order:

- auth
- tenancy
- memberships
- invitations
- enrollment requests
- onboarding completion
- only then deeper operational modules

### Priority 5. Audit Placeholder Screens Against Real APIs

The dashboard and app experiences should be mapped page by page to:

- real endpoints
- placeholder data
- missing persistence
- missing authorization checks

## Recommended Working Understanding Going Forward

For future work, the safest shared mental model is:

This is a multi-tenant SaaS for martial arts academies implemented as a modular monolith in Next.js, with a serious domain foundation around identity, tenancy, memberships, onboarding, and academy operations. The product is beyond prototype level in architecture, but still uneven in module maturity across surfaces.

## Immediate Next Documentation Candidates

The next high-value documents would be:

- module-by-module maturity matrix
- business flow map from acquisition to daily academy operations
- deployment architecture for multi-tenant host resolution
- access-control matrix mapping roles, capabilities, routes, and APIs
