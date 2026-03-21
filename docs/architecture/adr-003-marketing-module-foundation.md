# ADR-003: Marketing Module Foundation

## Status

Proposed

## Context

The product needs a new tenant-owned `marketing` module in the dashboard with three initial tabs:

- `Identidade Visual`
- `Criar Conteúdo`
- `Templates`

The module goal is not only visual organization. It must become a viable SaaS capability that:

- helps the academy maintain a reusable brand kit
- helps create social content faster
- supports future AI-assisted generation of captions and images
- can be priced safely because it will consume variable-cost providers

The current product already has:

- a modular monolith architecture in Next.js
- tenant-bound operational data
- brand-adjacent data in settings/onboarding
- a `site` module with the same rule that visual reference is not architectural reference

The project also has a visual reference in `reference-ui` for the experience of `Criar Conteúdo`, but that reference is UX only.

## Decision

The `marketing` module will be implemented as a controlled product module with four internal subdomains:

- `brand-kit`
- `templates`
- `content-generation`
- `usage-ledger`

It will not be implemented as:

- a free-form design editor
- a loosely coupled AI prompt screen
- a module that duplicates academy identity data across unrelated features

The `brand-kit` becomes the tenant source of truth for reusable marketing assets and visual preferences inside this module.

The module will also be born with usage tracking from day one, even before final pricing is decided.

## Rationale

### 1. Brand assets must be reusable across the module

The same assets need to feed:

- template customization
- AI-assisted content creation
- future campaign variations

Without a dedicated `brand-kit`, the module would quickly fragment into:

- duplicated uploads
- inconsistent branding
- poor user experience

### 2. Templates and AI generation have different concerns

`Templates` are a deterministic rendering problem.

`Criar Conteúdo` is a guided generation problem that may involve:

- LLM calls
- image generation
- asset processing

Keeping them separated makes the module easier to maintain and price.

### 3. Usage tracking is a product requirement, not an afterthought

This module will likely have variable cost by tenant.

If the system does not track usage events from the beginning, later pricing decisions become:

- unreliable
- hard to retrofit
- operationally risky

### 4. A controlled workflow is better than an open editor

The product value is speed and consistency, not arbitrary canvas editing.

A controlled workflow gives:

- lower support cost
- faster template delivery
- safer AI integration
- more predictable output quality

## Consequences

### Positive

- clear source of truth for marketing assets
- easier reuse across tabs
- safer path for future pricing and entitlements
- lower product complexity than a generic design editor

### Negative

- less flexibility than a free-form creative tool
- template coverage needs to be curated by the product team
- some advanced customization will need to wait for later phases

## Rules

1. `MarketingBrandKit` owns tenant marketing identity inside the module.
2. `Templates` consume the brand kit. They do not redefine it.
3. `Criar Conteúdo` consumes:
   - brand kit
   - selected assets
   - optional template context
4. Usage events must be recorded for all cost-relevant actions.
5. The MVP must work without mandatory AI generation.
6. Visual references are UI/UX input only and must not drive architecture or persistence.

## Revisit Trigger

This ADR should only be revisited if:

- the product chooses to become a full creative suite with open canvas editing
- the billing model changes to external pay-as-you-go only
- media storage and rendering move to a dedicated external content platform
