# Core Access and Onboarding Audit Checklist

## Objective

Audit the current access, tenancy, and onboarding flows before expanding more product modules.

This checklist is intended for Phase 1 of the action plan.

## Scope

Flows covered:

- login
- logout
- password reset
- tenant switching
- invitation acceptance
- enrollment request lifecycle
- academy self-service onboarding
- academy setup onboarding
- tenant-aware session access

## Audit Format

For each item below, validate:

- expected behavior
- actual behavior
- error behavior
- tenant behavior
- permission behavior
- persisted state transitions

## A. Authentication

### A1. Login

- valid email/password creates a session
- invalid password returns correct error
- unknown email returns correct error
- user with no tenant access receives the intended blocked state
- login on a tenant host validates access to that tenant
- login on platform host behaves correctly for platform-only versus tenant users

Primary references:

- [`app/api/auth/session/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/session/route.ts)
- [`apps/api/src/modules/iam/services/password-auth.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/iam/services/password-auth.service.ts)

### A2. Logout

- logout invalidates the active session token
- auth cookie is cleared
- dashboard tenant cookie is cleared when required
- subsequent authenticated requests fail as expected

## B. Password Recovery

### B1. Reset Request

- valid email creates reset token flow
- unknown email does not leak account existence unexpectedly
- repeated requests behave safely

### B2. Reset Confirm

- valid token resets password
- expired token is rejected
- used token is rejected
- login with the new password succeeds
- login with the old password fails

Primary references:

- [`app/api/auth/password-reset/request/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/password-reset/request/route.ts)
- [`app/api/auth/password-reset/confirm/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/password-reset/confirm/route.ts)

## C. Tenant Resolution

### C1. Host Resolution

- platform host resolves as `platform`
- known subdomain resolves as `tenant`
- unknown host resolves as `unknown`
- custom domain path behaves as intended
- localhost tenancy behaves as intended

Primary references:

- [`proxy.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/proxy.ts)
- [`lib/tenancy/resolve-tenant.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/tenancy/resolve-tenant.ts)

### C2. Surface Redirect Behavior

- `/` redirects correctly on platform host
- `/` redirects correctly on tenant host
- `/platform` is blocked or redirected correctly from tenant host
- `/app` is blocked or redirected correctly from non-tenant host

## D. Tenant-Aware Session Behavior

### D1. Dashboard Tenant Selection

- preferred dashboard tenant cookie is set when appropriate
- dashboard tenant selection persists correctly
- switching tenants updates active context correctly
- stale tenant cookie does not break the session

Primary references:

- [`app/api/auth/dashboard-tenant/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/dashboard-tenant/route.ts)
- [`app/api/auth/tenant-switch/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/auth/tenant-switch/route.ts)

### D2. Capability Enforcement

- academy admin can access dashboard tenant endpoints
- teacher only accesses allowed operations
- student is blocked from dashboard-only capabilities
- unauthorized user gets `401`
- unauthorized tenant access gets `403`

Primary references:

- [`app/api/_lib/dashboard-tenant-access.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/_lib/dashboard-tenant-access.ts)
- [`lib/capabilities.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/lib/capabilities.ts)

## E. Invitation Flow

### E1. Invitation Lookup and Acceptance

- valid invitation token loads invitation state
- expired invitation is rejected correctly
- revoked invitation is rejected correctly
- acceptance activates the intended membership
- accepted invitation cannot be accepted twice

Primary references:

- [`app/api/invitations/[token]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/%5Btoken%5D/route.ts)
- [`app/api/invitations/accept/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/invitations/accept/route.ts)

## F. Enrollment Request Flow

### F1. Submission and Review

- enrollment request can be created once per tenant/user as intended
- duplicate submission behavior is correct
- approve transition behaves correctly
- reject transition behaves correctly
- resulting membership state is consistent

Primary references:

- [`app/api/tenants/[tenantSlug]/enrollment-requests/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/tenants/%5BtenantSlug%5D/enrollment-requests/route.ts)
- [`app/api/enrollment-requests/[requestId]/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/enrollment-requests/%5BrequestId%5D/route.ts)

## G. Academy Self-Service Onboarding

### G1. Academy Creation

- academy creation creates tenant
- owner user is created
- password credential is created
- owner membership is created and active
- auth session is issued
- dashboard tenant cookie is issued

Primary references:

- [`app/api/onboarding/academy/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy/route.ts)
- [`apps/api/src/modules/onboarding/services/academy-self-service-onboarding.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/academy-self-service-onboarding.service.ts)

## H. Academy Setup Onboarding

### H1. Step Persistence

- each setup step loads existing state correctly
- each setup step saves valid payloads correctly
- invalid payloads are rejected consistently
- required steps are enforced before completion

### H2. Data Canonicalization

- setup data becomes canonical tenant/module data where expected
- downstream modules use persisted tenant/module records rather than onboarding-only fallback state

Primary references:

- [`app/api/onboarding/academy-setup/route.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/app/api/onboarding/academy-setup/route.ts)
- [`apps/api/src/modules/onboarding/services/tenant-onboarding.service.ts`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/apps/api/src/modules/onboarding/services/tenant-onboarding.service.ts)

## I. Audit Output Template

For each checked flow, record:

- `status`: pass | fail | partial
- `notes`: what happened
- `risk`: business and technical impact
- `fix owner`: module or file area
- `priority`: critical | high | medium | low

## Expected Outcome

At the end of this audit, the team should have:

- a list of confirmed stable flows
- a list of broken or partial edge cases
- a fix list for Phase 1 implementation
- a stable baseline before investing in students, attendance, app, and finance depth
