# Marketing Module MVP Blueprint

## Objective

Define the executable MVP shape of the new `marketing` module:

- data model
- TypeScript contracts
- API surface
- usage tracking strategy
- phased implementation order

The MVP focuses on:

- `Identidade Visual`
- `Templates`
- a guided `Criar Conteúdo` foundation

## 1. Module Placement

The module should follow the current project architecture.

### Backend

```text
apps/api/src/modules/marketing/
  domain/
  repositories/
  services/
```

### Routes

```text
app/api/marketing/
app/dashboard/marketing/page.tsx
```

### Frontend module

```text
modules/marketing/
  components/
  services/
  manifest.ts
  routes.ts
```

## 2. Prisma Foundation

### New enums

```prisma
enum MarketingAssetType {
  LOGO
  ACADEMY_PHOTO
  SPACE_PHOTO
  TEAM_PHOTO
  PROFESSOR_PHOTO
  GENERAL_PHOTO
}

enum MarketingAssetSource {
  BRAND_KIT
  MANUAL_UPLOAD
  CAMERA
  GENERATED
}

enum MarketingGenerationStatus {
  DRAFT
  PROCESSING
  SUCCEEDED
  FAILED
}

enum MarketingUsageEventType {
  TEMPLATE_RENDER
  CAPTION_GENERATION
  IMAGE_GENERATION
  ASSET_PROCESSING
}
```

### New models

```prisma
model MarketingBrandKit {
  id                 String   @id @default(cuid())
  tenantId           String   @unique
  primaryColor       String?
  secondaryColor     String?
  accentColor        String?
  headingFont        String?
  bodyFont           String?
  logoAssetId        String?
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  tenant             Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  logoAsset          MarketingAsset? @relation("MarketingBrandKitLogo", fields: [logoAssetId], references: [id], onDelete: SetNull)
  assets             MarketingAsset[]
  generations        MarketingGeneration[]
  usageLedgerEntries MarketingUsageLedger[]
}

model MarketingAsset {
  id              String              @id @default(cuid())
  tenantId        String
  brandKitId      String?
  type            MarketingAssetType
  source          MarketingAssetSource
  name            String
  fileUrl         String
  thumbnailUrl    String?
  mimeType        String?
  metadataJson    Json?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  tenant          Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  brandKit        MarketingBrandKit?  @relation(fields: [brandKitId], references: [id], onDelete: SetNull)
  usedAsLogoBy    MarketingBrandKit[] @relation("MarketingBrandKitLogo")

  @@index([tenantId, type])
}

model MarketingGeneration {
  id                String                    @id @default(cuid())
  tenantId          String
  brandKitId        String?
  templateId        String?
  status            MarketingGenerationStatus @default(DRAFT)
  promptInputJson   Json?
  resultCaption     String?
  resultImageUrl    String?
  usedAssetIdsJson  Json?
  provider          String?
  costEstimateUsd   Decimal?                  @db.Decimal(10, 4)
  createdByUserId   String?
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
  tenant            Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  brandKit          MarketingBrandKit?        @relation(fields: [brandKitId], references: [id], onDelete: SetNull)

  @@index([tenantId, status])
}

model MarketingUsageLedger {
  id                 String                  @id @default(cuid())
  tenantId           String
  brandKitId         String?
  periodKey          String
  eventType          MarketingUsageEventType
  units              Int
  estimatedCostUsd   Decimal?                @db.Decimal(10, 4)
  metadataJson       Json?
  createdAt          DateTime                @default(now())
  tenant             Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  brandKit           MarketingBrandKit?      @relation(fields: [brandKitId], references: [id], onDelete: SetNull)

  @@index([tenantId, periodKey, eventType])
}
```

### Add relations in `Tenant`

```prisma
marketingBrandKit   MarketingBrandKit?
marketingAssets     MarketingAsset[]
marketingGenerations MarketingGeneration[]
marketingUsageLedger MarketingUsageLedger[]
```

## 3. TypeScript Contracts

### Identity tab

```ts
export interface MarketingBrandKitView {
  colors: {
    primary?: string
    secondary?: string
    accent?: string
  }
  typography: {
    headingFont?: string
    bodyFont?: string
  }
  logo?: MarketingAssetView | null
  assets: MarketingAssetView[]
  notes?: string
}
```

### Asset contract

```ts
export interface MarketingAssetView {
  id: string
  type:
    | "logo"
    | "academy_photo"
    | "space_photo"
    | "team_photo"
    | "professor_photo"
    | "general_photo"
  source: "brand_kit" | "manual_upload" | "camera" | "generated"
  name: string
  fileUrl: string
  thumbnailUrl?: string
}
```

### Templates tab

```ts
export interface MarketingTemplateView {
  id: string
  name: string
  category: string
  thumbnailUrl?: string
  supportsLogo: boolean
  supportsBrandColors: boolean
  supportsImage: boolean
  defaultCopy: {
    headline?: string
    body?: string
    cta?: string
  }
}
```

### Create content input

```ts
export interface MarketingGenerationInput {
  objective: string
  contentType: "feed_post" | "story" | "event_post" | "promotion"
  selectedTemplateId?: string
  selectedAssetIds: string[]
  promptNotes?: string
  tone?: string
  callToAction?: string
}
```

## 4. Tab Strategy

### `Identidade Visual`

This tab owns:

- brand colors
- logo
- typography
- reusable marketing photos

This tab should feel editable and non-linear.

It is not onboarding.

### `Templates`

This tab should be a curated library that:

- lists prebuilt layouts
- previews how they look with the academy brand kit
- lets the user choose a template and export or reuse it later

For MVP, template selection and adaptation can be deterministic.

### `Criar Conteúdo`

This tab should be a guided flow.

The upload step should offer:

- `Meus materiais`
- `Enviar arquivo`
- `Câmera`

For MVP, this flow can save structured input and prepare generation history even before full AI rollout.

## 5. Ownership Rules

### Marketing owns

- marketing brand colors
- marketing logo selection
- marketing media assets for creative generation
- generation history
- usage events

### Marketing may reuse, but should not own

- academy name
- tenant contact data
- operational plans
- CRM leads
- public site configuration

This keeps the module focused and prevents drift with `settings`, `site`, and operational modules.

## 6. API Surface

### Brand kit

- `GET /api/marketing/brand-kit`
- `PUT /api/marketing/brand-kit`

### Assets

- `GET /api/marketing/assets`
- `POST /api/marketing/assets`
- `DELETE /api/marketing/assets/[assetId]`

### Templates

- `GET /api/marketing/templates`

This can be backed by a static catalog in the MVP.

### Create content

- `POST /api/marketing/generate`
- `GET /api/marketing/history`

For the first cut, `POST /generate` can:

- validate entitlement and quota
- create a `MarketingGeneration` record
- save prompt input
- optionally return mocked or deterministic output until providers are wired

## 7. Usage and SaaS Strategy

The module should be born with entitlement and usage separation.

### Capability level

Recommended capability:

- `marketing_access`

This decides whether the tenant can see and use the module.

### Quota level

Recommended monthly counters:

- `marketing_caption_generations`
- `marketing_image_generations`
- `marketing_template_renders`

### Ledger level

Every cost-relevant action should create a `MarketingUsageLedger` entry.

This supports future options:

- access by plan only
- included monthly franchise
- paid overage
- add-on package
- temporary promotional credits

## 8. Phased Implementation

### Phase 1. Foundation

- Prisma schema
- domain contracts
- repository and service layer
- capability and usage hooks

### Phase 2. `Identidade Visual`

- brand kit CRUD
- asset upload and classification
- logo selection

### Phase 3. `Templates`

- template catalog
- deterministic application of brand kit
- preview and basic export/download history

### Phase 4. `Criar Conteúdo`

- guided flow UI
- asset reuse in upload step
- generation history records
- first real caption generation
- later image generation

## 9. MVP Acceptance Notes

The MVP should be considered correct if:

- the academy can build a reusable brand kit
- templates visually adapt using brand kit data
- the product records usage events from cost-relevant actions
- the module can evolve into AI-assisted generation without changing its core data model

The MVP does not need:

- a free-form canvas editor
- full campaign calendar
- idea board
- social publishing automation
