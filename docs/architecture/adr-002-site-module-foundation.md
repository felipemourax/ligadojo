# ADR-002: Site Module Foundation

## Status

Proposed

## Context

The product needs a tenant-owned public site at:

- `tenant.localhost:3000/site`

This public site must support:

- institutional presentation of the academy
- display of real plans
- trial class lead capture
- redirection into the tenant app for plan acquisition

At the same time, the academy needs a controlled builder at:

- `/dashboard/site`

The project already has:

- modular monolith architecture in Next.js
- tenant resolution by host
- operational modules for plans, modalities, teachers, branding, location, and CRM-adjacent needs

The project also has two kinds of visual reference:

- `reference-ui/only-reference-ui` for builder experience
- `reference-ui/templates-site-ui ` for public template layout

Those references are visual only.

## Decision

The `site` module will be implemented as a controlled template-driven system with:

- one `TenantSite` configuration per tenant
- four fixed template IDs
- a stable section contract
- public rendering based on published configuration
- operational data bound to existing modules

It will not be implemented as a free-form page builder.

## Rationale

### 1. Controlled templates are more maintainable than arbitrary page editing

The product needs visual flexibility, not arbitrary layout freedom.

A controlled template system gives:

- faster delivery
- lower QA surface
- simpler persistence model
- consistent UX for academies

### 2. Existing modules should remain the source of truth

The site should not duplicate:

- plans
- modalities
- teachers
- core academy contact/location records

These should be consumed from existing modules and rendered inside public templates.

### 3. Builder and public rendering must share one contract

The dashboard builder and the public `/site` route must speak the same site configuration model.

This avoids:

- drift between preview and publication
- duplicated render logic
- hidden per-template persistence rules

## Consequences

### Positive

- cleaner architecture
- lower risk of divergent data
- easier template expansion
- better control over publication quality

### Negative

- less user freedom than a generic website builder
- some content needs to stay within predefined section contracts

## Rules

1. The `site` module owns editorial configuration only.
2. `Plan`, `Modality`, `TeacherProfile`, `TenantProfile`, `TenantLocation`, and `TenantBranding` remain the source of truth for operational and institutional data.
3. The public site renders published state only.
4. Trial class requests create CRM leads, not `site` records.
5. Plan acquisition on the public site redirects to the tenant app flow.

## Revisit Trigger

This ADR should only be revisited if:

- the product explicitly decides to become a fully generic website builder
- site editing requires arbitrary nested content blocks
- separate infrastructure is needed for static generation or CDN-heavy publishing
