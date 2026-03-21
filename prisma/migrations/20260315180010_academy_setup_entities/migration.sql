-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('KIDS', 'JUVENILE', 'ADULT', 'MIXED');

-- CreateEnum
CREATE TYPE "TeacherProfileStatus" AS ENUM ('DRAFT', 'INVITED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "PlanClassLimitKind" AS ENUM ('UNLIMITED', 'WEEKLY');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('MERCADO_PAGO', 'ASAAS', 'STRIPE');

-- AlterEnum
ALTER TYPE "BillingCycle" ADD VALUE 'SEMIANNUAL';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "classLimitKind" "PlanClassLimitKind" NOT NULL DEFAULT 'UNLIMITED',
ADD COLUMN     "classLimitValue" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklyFrequency" INTEGER;

-- CreateTable
CREATE TABLE "PlanModality" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "modalityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanModality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "phone" TEXT,
    "contactEmail" TEXT,
    "description" TEXT,
    "document" TEXT,
    "foundedYear" INTEGER,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "zipCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Brasil',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modality" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "defaultDurationMinutes" INTEGER NOT NULL,
    "defaultCapacity" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "rank" TEXT,
    "specialty" TEXT,
    "status" "TeacherProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBranding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appName" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPaymentSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pixEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "boletoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gateway" "PaymentGateway",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPaymentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanModality_modalityId_idx" ON "PlanModality"("modalityId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanModality_planId_modalityId_key" ON "PlanModality"("planId", "modalityId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProfile_tenantId_key" ON "TenantProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantLocation_tenantId_key" ON "TenantLocation"("tenantId");

-- CreateIndex
CREATE INDEX "Modality_tenantId_sortOrder_idx" ON "Modality"("tenantId", "sortOrder");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_sortOrder_idx" ON "TeacherProfile"("tenantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBranding_tenantId_key" ON "TenantBranding"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPaymentSettings_tenantId_key" ON "TenantPaymentSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "PlanModality" ADD CONSTRAINT "PlanModality_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanModality" ADD CONSTRAINT "PlanModality_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProfile" ADD CONSTRAINT "TenantProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantLocation" ADD CONSTRAINT "TenantLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modality" ADD CONSTRAINT "Modality_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantBranding" ADD CONSTRAINT "TenantBranding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPaymentSettings" ADD CONSTRAINT "TenantPaymentSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
