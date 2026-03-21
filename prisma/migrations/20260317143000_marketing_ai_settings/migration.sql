-- CreateEnum
CREATE TYPE "MarketingAiProvider" AS ENUM ('GEMINI', 'OPENAI');

-- CreateTable
CREATE TABLE "MarketingAiSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "primaryTextProvider" "MarketingAiProvider" NOT NULL DEFAULT 'GEMINI',
    "primaryTextModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "fallbackTextProvider" "MarketingAiProvider" NOT NULL DEFAULT 'OPENAI',
    "fallbackTextModel" TEXT NOT NULL DEFAULT 'gpt-5-mini',
    "primaryImageProvider" "MarketingAiProvider" NOT NULL DEFAULT 'GEMINI',
    "primaryImageModel" TEXT NOT NULL DEFAULT 'gemini-2.0-flash-preview-image-generation',
    "fallbackImageProvider" "MarketingAiProvider" NOT NULL DEFAULT 'OPENAI',
    "fallbackImageModel" TEXT NOT NULL DEFAULT 'gpt-image-1',
    "allowTextGeneration" BOOLEAN NOT NULL DEFAULT true,
    "allowImageGeneration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingAiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingAiSettings_tenantId_key" ON "MarketingAiSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "MarketingAiSettings" ADD CONSTRAINT "MarketingAiSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
