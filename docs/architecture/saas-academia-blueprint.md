# SaaS Academia Architecture Blueprint

## 1. Objective

Define the target architecture for a multi-tenant SaaS platform for martial arts academies, preserving as much of the current Next.js frontend as practical while creating a scalable foundation for:

- platform administration
- academy administration
- teacher workspace
- student/teacher PWA
- tenant-aware branding
- multi-tenant identity and authorization
- modular frontend and backend evolution

This blueprint is implementation-oriented. It is meant to guide folder organization, module contracts, backend modeling, and phased delivery.

## 2. Current State Summary

Current project strengths:

- feature-based module organization in [`modules/`](/Users/felipemoura/Desktop/Saas%20Academia/modules)
- working tenant dashboard surface in [`app/dashboard`](/Users/felipemoura/Desktop/Saas%20Academia/app/dashboard)
- reusable UI foundation in [`components/ui`](/Users/felipemoura/Desktop/Saas%20Academia/components/ui)
- clear early role vocabulary in [`lib/permissions.ts`](/Users/felipemoura/Desktop/Saas%20Academia/lib/permissions.ts)

Current project gaps:

- only the academy dashboard surface exists
- routing, navigation, and permissions are split across multiple sources of truth
- no tenant resolution yet
- no identity, membership, invitation, or self-enrollment model
- no backend structure yet
- current PWA metadata is global instead of tenant-aware

## 3. Architectural Principles

1. Users are global to the platform.
2. Academies are tenants.
3. Access to a tenant is controlled by `AcademyMembership`, not by the global user record.
4. Billing is separate from access control.
5. Tenant resolution must exist in both Next.js and backend layers.
6. Frontend modules must be self-describing and registered centrally.
7. Product surfaces must be separated by responsibility:
   - `platform`
   - `dashboard`
   - `app`
8. The current frontend should be evolved incrementally, not discarded.

## 4. Target Domain Model

### 4.1 Identity

Global identity model:

- `User`
- `AuthIdentity`
- `Session`

Responsibilities:

- authentication
- unique account identity
- email and phone ownership
- provider linkage
- active sessions

### 4.2 Tenant and Access

Tenant-aware access model:

- `Tenant`
- `TenantDomain`
- `AcademyMembership`
- `Invitation`
- `EnrollmentRequest`

Responsibilities:

- tenant lifecycle
- domain mapping
- academy access
- academy role assignment
- invite-driven onboarding
- self-signup-driven onboarding

`AcademyMembership` represents the user's relationship with a tenant. It does not represent a billing plan.

Suggested membership roles:

- `academy_admin`
- `teacher`
- `student`

Suggested membership statuses:

- `pending`
- `active`
- `suspended`
- `revoked`

### 4.3 Billing

Billing model per tenant:

- `Plan`
- `Subscription`
- `Invoice`
- `Payment`
- `BillingProfile`

Responsibilities:

- commercial plans
- recurring billing
- invoice lifecycle
- payment reconciliation
- billing state and exceptions

Important rule:

- `AcademyMembership` controls access
- `Subscription` controls commercial status

These concerns must remain separate.

### 4.4 Operational Domains

Core academy domains:

- `students`
- `teachers`
- `classes`
- `attendance`
- `graduations`
- `finance`
- `crm`
- `events`
- `techniques`

Platform domains:

- `platform-admin`
- `billing`
- `iam`
- `tenancy`

## 5. Product Surfaces

The system will expose three main authenticated surfaces.

### 5.1 Platform Surface

Path prefix:

- `/platform`

Primary role:

- `platform_admin`

Capabilities:

- tenant lifecycle
- subscriptions and platform plans
- support tooling
- global analytics

### 5.2 Academy Dashboard Surface

Path prefix:

- `/dashboard`

Primary roles:

- `academy_admin`
- selected `teacher` capabilities where appropriate

Capabilities:

- academy operations
- student and teacher management
- finance and CRM
- events and techniques

### 5.3 Tenant App Surface

Path prefix:

- `/app`

Primary roles:

- `teacher`
- `student`

Capabilities:

- student schedule and progress
- teacher class management
- attendance
- payments
- digital credential

The same PWA codebase serves both teacher and student experiences. The UI differs by role and enabled capabilities.

## 6. Tenant Resolution Strategy

### 6.1 Recommended Strategy

Use a hybrid host strategy:

1. primary default: subdomain
   - `academia-x.plataforma.com`
2. premium option: custom domain
   - `app.academiax.com`
3. avoid path-based tenancy as the main model
   - do not use `plataforma.com/academia-x` as the primary approach

### 6.2 Why

Host-based tenancy is better for:

- PWA installability
- tenant branding
- manifest generation
- cookie isolation
- custom domains
- lower ambiguity in middleware and backend enforcement

### 6.3 Resolution Responsibilities

Next.js middleware:

- parse incoming host
- resolve tenant context
- block invalid hosts early
- support rewrites/redirects
- expose context needed for rendering and branding

Backend:

- resolve tenant authoritatively
- validate membership against tenant
- enforce tenant data boundaries
- reject spoofed tenant context

## 7. Authentication and Authorization Blueprint

### 7.1 Login Model

Authentication is global.

After login, the system resolves tenant context using:

- request host
- active memberships
- selected current tenant when relevant

### 7.2 Multi-Tenant User Behavior

A single user may:

- be a teacher in academy A
- be a student in academy B
- have no membership in academy C

Therefore:

- role must not live on `User`
- role belongs to `AcademyMembership`

### 7.3 Invitation Flow

When academy staff initiates onboarding:

1. academy admin creates `Invitation`
2. invitation contains:
   - `tenant_id`
   - `email`
   - `role`
   - `token`
   - expiration
3. upon acceptance:
   - existing user: create or activate `AcademyMembership`
   - new user: create `User`, then create `AcademyMembership`

### 7.4 Self-Signup Flow

When a student starts from the academy PWA:

1. tenant is resolved by host
2. user signs up or logs in globally
3. system creates `EnrollmentRequest`
4. academy policy defines whether access is:
   - invite only
   - approval required
   - open signup
5. approved request creates or activates `AcademyMembership`

### 7.5 Tenant Switching

The model must support future tenant switching.

Behavior:

- if one membership is available for the current host, enter directly
- if multiple memberships exist, the user may switch context
- when tenancy is host-based, switching tenants should navigate to the target tenant host

### 7.6 Permission Model

Do not stop at role-only authorization.

Use:

- platform role
- tenant role
- derived capabilities
- optional feature flags
- optional plan gates

Example capability names:

- `students.read`
- `students.write`
- `attendance.register`
- `finance.read`
- `payments.read.self`
- `classes.manage.assigned`

## 8. Frontend Target Architecture

### 8.1 Immediate Evolution Strategy

Keep one Next.js app initially, but split it into surfaces and registries.

This avoids over-fragmenting the codebase while the product is still taking shape.

### 8.2 Target App Tree in `apps/web`

```text
apps/
  web/
    app/
      (public)/
        login/
        cadastro/
        onboarding/
      platform/
        layout.tsx
        page.tsx
        academies/
        billing/
        metrics/
        support/
      dashboard/
        layout.tsx
        page.tsx
        students/
        teachers/
        classes/
        attendance/
        graduations/
        finance/
        crm/
        events/
        techniques/
        settings/
      app/
        layout.tsx
        page.tsx
        agenda/
        attendance/
        classes/
        progress/
        payments/
        profile/
    components/
    hooks/
    public/
    styles/
```

### 8.3 Module Registry

The existing `routes`, `navigation`, and `permissions` setup should be replaced by a single module contract.

Current duplicated sources:

- [`lib/routes.ts`](/Users/felipemoura/Desktop/Saas%20Academia/lib/routes.ts)
- [`lib/navigation.ts`](/Users/felipemoura/Desktop/Saas%20Academia/lib/navigation.ts)
- [`lib/permissions.ts`](/Users/felipemoura/Desktop/Saas%20Academia/lib/permissions.ts)
- `modules/*/routes.ts`

Target direction:

- each module declares its own manifest
- a central registry aggregates all module manifests
- menus, routes, permissions, and feature visibility are derived from the registry

### 8.4 Module Contract

Recommended contract:

```ts
export type AppSurface = "platform" | "dashboard" | "app"

export type AppRole =
  | "platform_admin"
  | "academy_admin"
  | "teacher"
  | "student"

export type Capability =
  | "students.read"
  | "students.write"
  | "teachers.read"
  | "classes.read"
  | "attendance.register"
  | "payments.read.self"

export interface ModuleRouteDefinition {
  key: string
  path: string
  surface: AppSurface
  roles?: AppRole[]
  capabilities?: Capability[]
}

export interface ModuleNavigationDefinition {
  label: string
  href: string
  surface: AppSurface
  roles?: AppRole[]
  capabilities?: Capability[]
  order?: number
}

export interface FeatureModuleManifest {
  key: string
  surface: AppSurface[]
  routes: ModuleRouteDefinition[]
  navigation?: ModuleNavigationDefinition[]
  capabilities?: Capability[]
  enabledByDefault?: boolean
}

export function defineModule(manifest: FeatureModuleManifest) {
  return manifest
}
```

### 8.5 Module Folder Structure

Target structure per feature:

```text
packages/modules/students/
  index.ts
  manifest.ts
  routes.ts
  permissions.ts
  types.ts
  domain/
  application/
  infrastructure/
  ui/
```

Conventions:

- `domain/`: business model and rules
- `application/`: use cases and orchestration
- `infrastructure/`: API clients and adapters
- `ui/`: components, screens, forms, and tables

## 9. Backend Target Architecture

### 9.1 App Structure

```text
apps/
  api/
    src/
      modules/
        iam/
        tenancy/
        academy-memberships/
        invitations/
        enrollment-requests/
        students/
        teachers/
        classes/
        attendance/
        graduations/
        finance/
        crm/
        events/
        techniques/
        billing/
      common/
        auth/
        guards/
        interceptors/
        tenancy/
        permissions/
```

### 9.2 Backend Module Ordering

Recommended implementation order:

1. `iam`
2. `tenancy`
3. `academy-memberships`
4. `invitations`
5. `enrollment-requests`
6. `students`
7. `classes`
8. `attendance`
9. `billing`
10. remaining modules

## 10. Monorepo Structure

Recommended target monorepo:

```text
apps/
  web/
  api/

packages/
  ui/
  core/
  auth/
  tenancy/
  permissions/
  registry/
  modules/
    dashboard/
    students/
    teachers/
    classes/
    attendance/
    graduations/
    finance/
    crm/
    events/
    techniques/
    billing/
    platform-admin/
```

Package responsibilities:

- `ui`: shared visual primitives and design system components
- `core`: cross-cutting types and utilities
- `auth`: session and identity helpers
- `tenancy`: host parsing, tenant context, tenant utilities
- `permissions`: capabilities and access evaluation
- `registry`: module registration and filtering
- `modules`: feature implementations

## 11. Suggested Prisma Baseline

The schema below is intentionally partial. It is the baseline for identity, tenancy, access, and billing separation.

```prisma
model User {
  id              String              @id @default(cuid())
  email           String              @unique
  phone           String?
  name            String?
  status          UserStatus          @default(ACTIVE)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  memberships     AcademyMembership[]
  authIdentities  AuthIdentity[]
  invitations     Invitation[]        @relation("InvitationUser")
  enrollmentRequests EnrollmentRequest[]
}

model Tenant {
  id                 String              @id @default(cuid())
  slug               String              @unique
  legalName          String
  displayName        String
  status             TenantStatus        @default(ACTIVE)
  brandingJson       Json?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  domains            TenantDomain[]
  memberships        AcademyMembership[]
  invitations        Invitation[]
  enrollmentRequests EnrollmentRequest[]
  plans              Plan[]
}

model TenantDomain {
  id          String       @id @default(cuid())
  tenantId    String
  domain      String       @unique
  isPrimary   Boolean      @default(false)
  isVerified  Boolean      @default(false)
  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())

  @@index([tenantId])
}

model AcademyMembership {
  id          String            @id @default(cuid())
  userId      String
  tenantId    String
  role        AcademyRole
  status      MembershipStatus  @default(PENDING)
  invitedById String?
  acceptedAt  DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant      Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
  @@index([tenantId, role])
}

model Invitation {
  id          String             @id @default(cuid())
  tenantId    String
  email       String
  role        AcademyRole
  token       String             @unique
  status      InvitationStatus   @default(PENDING)
  invitedById String
  acceptedById String?
  expiresAt   DateTime
  createdAt   DateTime           @default(now())
  tenant      Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  acceptedBy  User?              @relation("InvitationUser", fields: [acceptedById], references: [id])

  @@index([tenantId, email])
}

model EnrollmentRequest {
  id          String                  @id @default(cuid())
  tenantId    String
  userId      String
  status      EnrollmentRequestStatus @default(PENDING)
  createdAt   DateTime                @default(now())
  reviewedAt  DateTime?
  tenant      Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User                    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId])
}

model Plan {
  id          String         @id @default(cuid())
  tenantId    String
  name        String
  amountCents Int
  billingCycle BillingCycle
  isActive    Boolean        @default(true)
  tenant      Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  subscriptions Subscription[]
}

model Subscription {
  id             String              @id @default(cuid())
  tenantId       String
  userId         String
  planId         String
  status         SubscriptionStatus  @default(PENDING)
  startDate      DateTime
  endDate        DateTime?
  createdAt      DateTime            @default(now())
  plan           Plan                @relation(fields: [planId], references: [id], onDelete: Restrict)

  @@index([tenantId, userId])
}

model AuthIdentity {
  id                String   @id @default(cuid())
  userId            String
  provider          String
  providerSubjectId String
  createdAt         DateTime @default(now())
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerSubjectId])
}

enum UserStatus {
  ACTIVE
  BLOCKED
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum AcademyRole {
  ACADEMY_ADMIN
  TEACHER
  STUDENT
}

enum MembershipStatus {
  PENDING
  ACTIVE
  SUSPENDED
  REVOKED
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}

enum EnrollmentRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum BillingCycle {
  MONTHLY
  QUARTERLY
  YEARLY
}

enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAST_DUE
  CANCELLED
  ENDED
}
```

## 12. Implementation Roadmap

### Epic 1: Stabilize Current Frontend Architecture

Goal:

- remove duplicated configuration
- preserve the current dashboard implementation

Tasks:

1. define `Module Registry` contract
2. create `packages/registry` contract locally even before monorepo migration if needed
3. migrate current features to module manifests
4. deprecate direct dependency on:
   - `lib/routes.ts`
   - `lib/navigation.ts`
   - `lib/permissions.ts`
5. make sidebar and mobile nav read from registry output

Exit criteria:

- one source of truth exists for route, nav, and permission metadata

### Epic 2: Separate Product Surfaces

Goal:

- create explicit product boundaries for `platform`, `dashboard`, and `app`

Tasks:

1. keep current academy dashboard in `dashboard`
2. add `platform` layout and placeholder routes
3. add `app` layout and placeholder routes
4. define surface guard strategy
5. define default redirects per role

Exit criteria:

- every future feature has a known surface

### Epic 3: Add Tenant Resolution

Goal:

- make the web layer tenant-aware

Tasks:

1. add `middleware.ts`
2. define reserved platform hosts
3. create shared host parser
4. resolve tenant by subdomain or custom domain
5. reject unknown or suspended tenant hosts
6. expose resolved tenant context to rendering layer

Exit criteria:

- requests can be classified into platform host or tenant host

### Epic 4: Introduce Identity and Tenant Access

Goal:

- support users across multiple academies

Tasks:

1. model `User`, `Tenant`, `TenantDomain`, `AcademyMembership`
2. model `Invitation` and `EnrollmentRequest`
3. define invite acceptance flow
4. define self-signup flow
5. define membership states and transitions

Exit criteria:

- user and tenant access are separate and explicit

### Epic 5: Add Authorization by Capability

Goal:

- move from role-only checks to a scalable permission system

Tasks:

1. define capability taxonomy
2. map capabilities to membership roles
3. enforce capability checks in frontend filtering
4. enforce capability checks in backend guards

Exit criteria:

- permissions can evolve without role explosion

### Epic 6: Migrate to Monorepo

Goal:

- prepare the codebase for multiple apps and shared packages

Tasks:

1. create `apps/web`
2. move the current Next.js app there
3. create `packages/ui`, `packages/core`, `packages/registry`
4. extract reusable code
5. create `packages/modules`

Exit criteria:

- the repository can support frontend and backend side by side

### Epic 7: Create Backend Foundation

Goal:

- implement backend core modules with tenancy-first rules

Tasks:

1. bootstrap NestJS app in `apps/api`
2. implement `iam`
3. implement `tenancy`
4. implement `academy-memberships`
5. implement `invitations`
6. implement `enrollment-requests`

Exit criteria:

- authentication, tenant resolution, and tenant access are available server-side

### Epic 8: Deliver Tenant-Aware PWA

Goal:

- launch the `app` surface for students and teachers

Tasks:

1. define PWA shell for `/app`
2. implement dynamic manifest by tenant
3. implement tenant branding tokens
4. implement student views
5. implement teacher views
6. review service worker caching boundaries

Exit criteria:

- one codebase supports many academy PWAs safely

### Epic 9: Expand Business Modules

Goal:

- implement the remaining academy capabilities on top of the new foundation

Priority order:

1. `students`
2. `classes`
3. `attendance`
4. `teachers`
5. `finance`
6. `crm`
7. `events`
8. `techniques`
9. `graduations`

Exit criteria:

- tenant operations run on the new shared architecture

## 13. Immediate Project Folder Migration Plan

Current project:

```text
app/
components/
hooks/
lib/
modules/
public/
styles/
```

Intermediate step without immediate monorepo breakup:

```text
app/
  (public)/
  platform/
  dashboard/
  app/
components/
hooks/
lib/
  auth/
  tenancy/
  permissions/
  registry/
modules/
public/
styles/
```

Final target:

```text
apps/
  web/
    app/
    components/
    hooks/
    public/
    styles/
  api/

packages/
  ui/
  core/
  auth/
  tenancy/
  permissions/
  registry/
  modules/
```

Recommended migration order:

1. internal registry refactor inside current repo layout
2. surface split inside current repo layout
3. monorepo reshape
4. backend introduction
5. module extraction into packages

## 14. Frontend Feature Map

### Platform

- tenant management
- platform plans
- support
- global metrics

### Dashboard

- students
- teachers
- classes
- attendance
- graduations
- finance
- CRM
- events
- techniques
- academy settings

### App

- student schedule
- student attendance
- student progress
- student payments
- student profile
- teacher assigned classes
- teacher attendance
- teacher lesson planning

## 15. Key Risks to Track

1. treating billing as access control
2. keeping multiple route sources alive for too long
3. implementing tenant resolution only in frontend
4. coupling student and teacher PWA flows to dashboard layouts
5. delaying identity and membership modeling until after feature expansion
6. allowing module-specific permission logic to scatter outside registry and backend guards

## 16. Recommended Next Technical Deliverables

Recommended next artifacts after this blueprint:

1. `Module Registry` technical spec
2. initial `middleware.ts` tenant resolution design
3. Prisma schema bootstrap
4. backend module dependency map
5. epic breakdown into implementation tickets

