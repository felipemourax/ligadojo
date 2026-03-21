-- CreateEnum
CREATE TYPE "MarketingAssetType" AS ENUM ('LOGO', 'ACADEMY_PHOTO', 'SPACE_PHOTO', 'TEAM_PHOTO', 'PROFESSOR_PHOTO', 'GENERAL_PHOTO');

-- CreateEnum
CREATE TYPE "MarketingAssetSource" AS ENUM ('BRAND_KIT', 'MANUAL_UPLOAD', 'CAMERA', 'GENERATED');

-- CreateEnum
CREATE TYPE "MarketingGenerationStatus" AS ENUM ('DRAFT', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "MarketingUsageEventType" AS ENUM ('TEMPLATE_RENDER', 'CAPTION_GENERATION', 'IMAGE_GENERATION', 'ASSET_PROCESSING');

-- CreateTable
CREATE TABLE "MarketingBrandKit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "headingFont" TEXT,
    "bodyFont" TEXT,
    "selectedLogoAssetId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingBrandKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "type" "MarketingAssetType" NOT NULL,
    "source" "MarketingAssetSource" NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingGeneration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "templateId" TEXT,
    "status" "MarketingGenerationStatus" NOT NULL DEFAULT 'DRAFT',
    "promptInputJson" JSONB,
    "resultCaption" TEXT,
    "resultImageUrl" TEXT,
    "usedAssetIdsJson" JSONB,
    "provider" TEXT,
    "costEstimateUsd" DECIMAL(10,4),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingUsageLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brandKitId" TEXT,
    "periodKey" TEXT NOT NULL,
    "eventType" "MarketingUsageEventType" NOT NULL,
    "units" INTEGER NOT NULL,
    "estimatedCostUsd" DECIMAL(10,4),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingUsageLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingBrandKit_tenantId_key" ON "MarketingBrandKit"("tenantId");

-- CreateIndex
CREATE INDEX "MarketingAsset_tenantId_type_idx" ON "MarketingAsset"("tenantId", "type");

-- CreateIndex
CREATE INDEX "MarketingGeneration_tenantId_status_idx" ON "MarketingGeneration"("tenantId", "status");

-- CreateIndex
CREATE INDEX "MarketingUsageLedger_tenantId_periodKey_eventType_idx" ON "MarketingUsageLedger"("tenantId", "periodKey", "eventType");

-- AddForeignKey
ALTER TABLE "MarketingBrandKit" ADD CONSTRAINT "MarketingBrandKit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAsset" ADD CONSTRAINT "MarketingAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAsset" ADD CONSTRAINT "MarketingAsset_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "MarketingBrandKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingGeneration" ADD CONSTRAINT "MarketingGeneration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingGeneration" ADD CONSTRAINT "MarketingGeneration_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "MarketingBrandKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingUsageLedger" ADD CONSTRAINT "MarketingUsageLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingUsageLedger" ADD CONSTRAINT "MarketingUsageLedger_brandKitId_fkey" FOREIGN KEY ("brandKitId") REFERENCES "MarketingBrandKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
