# Site Module Architecture

## Objective

Build a tenant-aware `site` module that allows each academy to publish a landing page at:

- `tenant-slug.localhost:3000/site`

This landing page is not only institutional. It must also support:

- showing the academy's active plans
- collecting trial class requests
- sending those requests into the academy CRM as leads
- redirecting plan acquisition into the academy web app flow

The visual builder experience should take inspiration from:

- `reference-ui/only-reference-ui/app/dashboard/site/page.tsx`
- `reference-ui/only-reference-ui/components/site-builder/site-builder.tsx`

The public visual templates should take inspiration from:

- `reference-ui/templates-site-ui /src/data/templates.ts`
- `reference-ui/templates-site-ui /src/types/template.ts`

These references are UI-only. The project must keep the current architecture, modularization, and backend patterns.

## Recommended Product Model

The correct product model is not a free-form page builder.

It should be a controlled `template-driven site builder`:

- 4 fixed landing page templates
- a fixed library of supported sections
- configurable section ordering and visibility
- editable content for allowed fields only
- operational data bound to existing product modules

This keeps the module scalable and maintainable while still giving each academy a meaningful level of customization.

## Core Principle

Do not duplicate operational domain data into the site editor unless strictly necessary.

The site module should consume existing tenant data from the system:

- `Plan` for plans and pricing
- `Modality` for activities/modalities shown publicly
- `TeacherProfile` for instructors
- `TenantBranding` for logo/colors when available
- `TenantLocation` for public location/contact
- `TenantProfile` for institution-level contact data

The site editor should store only what is truly editorial:

- template selection
- site publication state
- section order
- section visibility
- section text overrides
- media overrides
- CTA labels and targets
- SEO metadata
- optional theme overrides

## Surfaces

The module should have 2 surfaces:

### 1. Dashboard Site Builder

Route:

- `/dashboard/site`

Responsibilities:

- choose one of 4 templates
- reorder sections
- enable/disable sections
- edit section-level content
- preview desktop/mobile
- publish/unpublish

### 2. Public Tenant Site

Route:

- `/site`

Resolved by host:

- `tenant.localhost:3000/site`

Responsibilities:

- render the published site for the tenant
- serve public lead capture
- display real plans
- redirect plan acquisition to the tenant web app

## Domain Model

Add a new `site` module and a new persistence entity for tenant site configuration.

### Recommended Prisma Model

```prisma
model TenantSite {
  id             String   @id @default(cuid())
  tenantId        String   @unique
  templateId      String
  status          SiteStatus @default(DRAFT)
  seoJson         Json?
  themeJson       Json?
  sectionsJson    Json?
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([status])
}
```

Recommended enum:

```prisma
enum SiteStatus {
  DRAFT
  PUBLISHED
}
```

### Template IDs

Keep fixed enum-like values in TypeScript:

- `traditional`
- `modern`
- `competitive`
- `community`

## Site Configuration Contract

The site should use a stable configuration contract shared by:

- builder UI
- backend service
- public renderer

### Recommended Section IDs

Initial supported sections:

- `header`
- `hero`
- `about`
- `modalities`
- `plans`
- `teachers`
- `testimonials`
- `trial_class`
- `location`
- `faq`
- `footer`

Optional later:

- `gallery`
- `social`
- `athletes`
- `competitions`

### Recommended Site Config Shape

```ts
type SiteTemplateId = "traditional" | "modern" | "competitive" | "community"

type SiteSectionId =
  | "header"
  | "hero"
  | "about"
  | "modalities"
  | "plans"
  | "teachers"
  | "testimonials"
  | "trial_class"
  | "location"
  | "faq"
  | "footer"

interface TenantSiteConfig {
  templateId: SiteTemplateId
  seo: {
    title?: string
    description?: string
    ogImageUrl?: string
  }
  theme: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
  sections: Array<{
    id: SiteSectionId
    visible: boolean
    sortOrder: number
    content: Record<string, unknown>
  }>
}
```

Important:

- the `content` object stores only editable overrides
- the renderer can merge those overrides with real tenant data

## Data Ownership

This is the most important architectural rule.

### Data owned by existing modules

- plans and plan pricing: `plans`
- public modalities list: `modalities`
- teachers list: `teachers`
- location/contact base: `TenantProfile` and `TenantLocation`

### Data owned by `site`

- public template selection
- editorial copy
- ordering/visibility of sections
- media overrides
- CTA labels
- SEO metadata
- publish status

This avoids divergence between:

- the public site
- the dashboard modules
- the app experience

## CRM Integration

Trial class requests should not be stored inside `site`.

They should create a lead in CRM.

### Recommended flow

1. Visitor clicks `Agendar aula experimental`
2. Public modal opens
3. Visitor submits form
4. Backend creates CRM lead for the tenant
5. Lead gets source metadata:
   - `source = "site_trial_class"`
   - `sourceDetail = templateId`
   - `status = "new"`

### Recommended trial form fields

- name
- whatsapp
- email optional
- activityCategory
- modalityId optional
- preferredPeriod optional
- notes optional
- consent

This keeps the site a capture channel and CRM the owner of lead handling.

## Plan Acquisition Flow

The public site should not become the plan checkout system in the first version.

Instead:

- the public site displays real active plans
- each plan CTA redirects to the tenant app

Recommended redirect:

- `/app?source=site&planId=...`

This keeps subscription/auth/payment logic centralized in the main app flow.

## Rendering Strategy

The public route `/site` should render by:

1. resolving the tenant from host
2. loading published site config
3. loading required tenant data
4. rendering with the selected template

Recommended implementation split:

- `apps/api/src/modules/site/services/site-public.service.ts`
- `apps/api/src/modules/site/services/site-builder.service.ts`
- `app/dashboard/site/page.tsx`
- `app/site/page.tsx`
- `modules/site/components/builder/*`
- `modules/site/components/templates/*`

### Template implementation model

Do not create 4 fully separate systems.

Instead:

- define a shared section contract
- create a renderer per template family
- each renderer uses the same input data and section IDs

Example:

- `TraditionalHeroSection`
- `ModernHeroSection`
- `CompetitiveHeroSection`
- `CommunityHeroSection`

This keeps visual variety while preserving one domain model.

## Recommended Module Structure

```text
apps/api/src/modules/site/
  domain/
    site.ts
    site-template.ts
    site-section.ts
    site-public-view.ts
  repositories/
    tenant-site.repository.ts
  services/
    site-builder.service.ts
    site-public.service.ts

app/api/site/
  route.ts
  publish/route.ts
  preview/route.ts
  trial-class/route.ts

app/dashboard/site/page.tsx
app/site/page.tsx

modules/site/
  components/
    site-dashboard-screen.tsx
    builder/
    templates/
  services/
    index.ts
  manifest.ts
  routes.ts
```

## API Surface

Recommended initial endpoints:

- `GET /api/site`
  - returns builder state for current tenant
- `PUT /api/site`
  - saves draft config
- `POST /api/site/publish`
  - publishes current draft
- `POST /api/site/unpublish`
  - optional, or handled by `PUT`
- `POST /api/site/trial-class`
  - public endpoint to create lead

Optional:

- `GET /api/site/preview`
  - builder preview data

## UX Strategy

The builder experience should be simplified.

The academy should mainly do 5 things:

1. choose a template
2. edit hero text and CTA
3. reorder or hide sections
4. edit a few editorial sections
5. publish

Avoid:

- arbitrary drag-and-drop layout systems
- nested block editors
- custom per-template editing rules visible to the user
- duplicating plan or modality management inside site builder

This gives faster time-to-value and much lower maintenance cost.

## Phased Implementation

### Phase 1. Foundation

- add `TenantSite`
- define contracts
- add `site` module
- add dashboard placeholder route
- add public `/site` route

### Phase 2. First Public Template

- implement 1 template end-to-end
- support sections:
  - `header`
  - `hero`
  - `modalities`
  - `plans`
  - `trial_class`
  - `location`
  - `footer`

### Phase 3. Builder MVP

- choose template
- reorder sections
- toggle visibility
- edit text/media fields
- publish/unpublish

### Phase 4. Trial Class Lead Capture

- create CRM integration
- modal on public page
- lead source attribution

### Phase 5. Plans Integration

- use real `Plan`
- redirect to `/app`

### Phase 6. Remaining 3 Templates

- implement the other visual templates
- keep the same configuration contract

## Final Recommendation

The best long-term solution is:

- a controlled site builder
- 4 fixed templates
- one stable section contract
- one site config per tenant
- operational data sourced from existing modules
- lead capture sent to CRM
- plan acquisition redirected to the tenant app

This gives:

- good UX for academies
- clean architecture
- lower maintenance burden
- minimal data duplication
- room to expand later into full site/store capabilities
