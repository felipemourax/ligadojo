# Site Module MVP Blueprint

## Objective

Define the executable MVP shape of the new `site` module:

- data model
- TypeScript contracts
- API surface
- rendering strategy
- phased implementation order

## 1. Module Placement

The module should follow the current project architecture.

### Backend

```text
apps/api/src/modules/site/
  domain/
  repositories/
  services/
```

### Routes

```text
app/api/site/
app/site/page.tsx
app/dashboard/site/page.tsx
```

### Frontend module

```text
modules/site/
  components/
  services/
  manifest.ts
  routes.ts
```

## 2. Prisma Foundation

### New enum

```prisma
enum SiteStatus {
  DRAFT
  PUBLISHED
}
```

### New model

```prisma
model TenantSite {
  id          String     @id @default(cuid())
  tenantId     String     @unique
  templateId   String
  status       SiteStatus @default(DRAFT)
  seoJson      Json?
  themeJson    Json?
  sectionsJson Json?
  publishedAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  tenant       Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([status])
}
```

### Add relation in `Tenant`

```prisma
site TenantSite?
```

## 3. TypeScript Contracts

### Template IDs

```ts
export type SiteTemplateId =
  | "traditional"
  | "modern"
  | "competitive"
  | "community"
```

### Section IDs

```ts
export type SiteSectionId =
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
```

### Section config

```ts
export interface TenantSiteSectionConfig {
  id: SiteSectionId
  visible: boolean
  sortOrder: number
  content: Record<string, unknown>
}
```

### Full site config

```ts
export interface TenantSiteConfig {
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
  sections: TenantSiteSectionConfig[]
}
```

### Public view contract

This contract should already merge:

- published site config
- tenant data from existing modules

```ts
export interface PublicTenantSiteView {
  tenant: {
    id: string
    slug: string
    displayName: string
  }
  site: TenantSiteConfig
  profile: {
    phone?: string
    contactEmail?: string
    website?: string
  }
  location: {
    street?: string
    number?: string
    city?: string
    state?: string
    country?: string
  }
  branding: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }
  modalities: Array<{
    id: string
    activityCategory?: string
    name: string
    ageGroups: string[]
  }>
  plans: Array<{
    id: string
    name: string
    amountCents: number
    billingCycle: string
    includedModalityIds: string[]
  }>
  teachers: Array<{
    id: string
    name: string
    roleTitle?: string
    rank?: string
  }>
}
```

## 4. Initial Section Strategy

For MVP, not every section needs to be fully editable.

### Fully supported in MVP

- `hero`
- `about`
- `modalities`
- `plans`
- `trial_class`
- `location`
- `footer`

### Visible but lightweight

- `header`
- `teachers`

### Deferred

- `testimonials`
- `faq`

The schema should still support all section IDs from day one, but implementation can start with the smaller subset.

## 5. Section Data Ownership

### Editorial sections

These can store content overrides in `sectionsJson`:

- `hero`
- `about`
- `trial_class`
- `faq`
- `footer`

### Bound sections

These should use real system data with optional title/subtitle overrides:

- `modalities`
- `plans`
- `teachers`
- `location`

Example:

- the `plans` section stores:
  - title
  - subtitle
  - CTA label
- but the actual plan cards come from `Plan`

## 6. API Surface

### Authenticated builder endpoints

- `GET /api/site`
  - load current tenant draft/builder state
- `PUT /api/site`
  - save draft
- `POST /api/site/publish`
  - publish current draft
- `POST /api/site/unpublish`
  - optional, or use `PUT` status update

### Public endpoint

- `POST /api/site/trial-class`
  - create a CRM lead from public site

## 7. Trial Class Endpoint Contract

### Request

```ts
interface CreateTrialClassLeadInput {
  tenantSlug?: string
  name: string
  whatsapp: string
  email?: string
  activityCategory?: string
  modalityId?: string
  notes?: string
  consent: boolean
}
```

### Behavior

- resolve tenant from host or explicit slug
- validate public site is published
- create CRM lead with source metadata

### Source metadata

Recommended:

- `source = "site_trial_class"`
- `sourceContext = templateId`

## 8. Dashboard Builder Screen

The builder should support only these actions initially:

- choose template
- edit hero
- edit about
- reorder visible sections
- toggle section visibility
- edit trial class CTA copy
- edit footer text
- publish/unpublish

It should not support:

- arbitrary drag-and-drop canvas positioning
- custom component insertion
- nested layout editing
- manual plan card authoring

## 9. Public Route Rendering

`app/site/page.tsx` should:

1. resolve tenant from host
2. load the published `TenantSite`
3. load supporting tenant data
4. build a `PublicTenantSiteView`
5. select the renderer by `templateId`
6. render ordered visible sections

Recommended split:

- `site-public.service.ts` assembles `PublicTenantSiteView`
- template components only render the view

## 10. Template Rendering Strategy

Implement templates with shared section IDs and different visual components.

### Example

```text
modules/site/components/templates/
  traditional/
    hero-section.tsx
    plans-section.tsx
  modern/
    hero-section.tsx
    plans-section.tsx
  competitive/
    hero-section.tsx
    plans-section.tsx
  community/
    hero-section.tsx
    plans-section.tsx
```

Each template reads the same section config and same public view contract.

## 11. Security and Product Rules

1. Public endpoints must always resolve tenant authoritatively by host.
2. Trial class endpoint must rate-limit later, but MVP can start with validation and minimal abuse protection.
3. Plan acquisition should redirect into `/app`, not perform enrollment directly on the site.
4. Draft site config must not be rendered publicly.

## 12. MVP Delivery Order

### Step 1

- Prisma model
- repository
- builder/public contracts

### Step 2

- `GET /api/site`
- `PUT /api/site`
- dashboard placeholder builder

### Step 3

- `app/site/page.tsx`
- first real template
- sections:
  - hero
  - modalities
  - plans
  - trial_class
  - location
  - footer

### Step 4

- `POST /api/site/publish`
- public published-state logic

### Step 5

- `POST /api/site/trial-class`
- CRM lead creation

### Step 6

- remaining 3 templates
- richer editorial controls

## 13. Recommendation

The first implementation should focus on:

- one production-ready template
- real plans integration
- public trial-class lead capture
- clean draft/publish workflow

Only after that should the module expand into:

- more templates
- more sections
- more builder flexibility
