# ADR-001: Runtime Architecture Direction

## Status

Proposed

## Context

The repository currently behaves as a modular monolith:

- Next.js App Router serves pages and API routes
- domain logic lives in `apps/api/src/modules`
- Prisma-backed persistence is already integrated into the running app
- core business flows are implemented inside the current runtime model

At the same time, the roadmap in [`backend-foundation-roadmap.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/docs/architecture/backend-foundation-roadmap.md) still references a future Nest bootstrap.

This creates ambiguity:

- should new backend work continue inside the current Next.js runtime
- or should the team already shape everything toward an imminent service extraction

Without a decision, the project risks:

- duplicated abstractions
- unstable boundaries
- inconsistent implementation patterns
- delayed delivery on core product flows

## Decision

For the medium term, the project should explicitly adopt:

- `modular monolith in Next.js`

This means:

- new backend work continues inside the current repository and runtime
- `app/api` remains the transport layer
- `apps/api/src/modules` remains the domain and service layer
- Prisma remains the persistence access layer

Service extraction remains an option for the future, but it is not the active target for current delivery.

## Rationale

### 1. This is already the real architecture

The most important business flows are already implemented in this model:

- auth/session
- onboarding
- tenancy
- invitations
- enrollment requests
- teachers
- classes
- modalities
- plans

Changing target architecture before consolidating these flows would add cost without immediate product gain.

### 2. Product risk is currently in flow completion, not service separation

The project's biggest gaps are:

- incomplete student domain
- uneven maturity across surfaces
- tenant app depth
- finance domain completion

Extracting backend services now would not solve the main product risks.

### 3. The current modularity is already good enough for disciplined growth

The codebase already separates:

- route handlers
- domain services
- repositories
- shared tenancy and access logic

That is enough structure to keep building safely for now.

## Consequences

### Positive

- faster delivery on core business flows
- fewer premature abstractions
- clearer implementation conventions
- easier prioritization around product completion

### Negative

- some future extraction work may still be needed
- runtime coupling to Next.js remains for now
- deployment architecture must continue to respect host-aware tenancy inside the monolith

## Implementation Rules

Until this ADR is replaced, new backend work should follow these rules:

1. `app/api/*` handles HTTP transport only.
2. Business rules belong in `apps/api/src/modules/*/services`.
3. Persistence belongs in repositories, not page components or route handlers.
4. Multi-tenant access checks must go through shared tenant-aware access utilities.
5. New modules should be added to the modular monolith first, not designed as speculative external services.

## Revisit Trigger

This decision should be revisited only when one of these becomes true:

- platform scale requires independent service scaling
- deployment constraints make the monolith materially expensive
- background processing and integration workload exceed what the current runtime can handle cleanly
- the academy operational core is already complete and stable

## Suggested Next Step

If this ADR is accepted, the next concrete action is:

- update [`backend-foundation-roadmap.md`](/Users/felipemoura/Desktop/Saas%20Academia%20-%20DOJO/docs/architecture/backend-foundation-roadmap.md) so it no longer implies an immediate Nest migration path
