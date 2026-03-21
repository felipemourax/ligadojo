-- CreateEnum
CREATE TYPE "FinanceDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "FinanceDiscountSource" AS ENUM ('MANUAL', 'COUPON');

-- CreateEnum
CREATE TYPE "DelinquencyRecurringMode" AS ENUM ('CONTINUE', 'PAUSE');

-- CreateEnum
CREATE TYPE "PlanTransitionPolicy" AS ENUM ('IMMEDIATE', 'NEXT_CYCLE', 'PRORATA');

-- AlterTable
ALTER TABLE "FinanceCharge" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountAmountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountReason" TEXT,
ADD COLUMN     "discountSource" "FinanceDiscountSource",
ADD COLUMN     "originalAmountCents" INTEGER;

-- AlterTable
ALTER TABLE "TenantPaymentSettings" ADD COLUMN     "delinquencyAccumulatesDebt" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "delinquencyBlocksNewClasses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "delinquencyGraceDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "delinquencyRecurringMode" "DelinquencyRecurringMode" NOT NULL DEFAULT 'CONTINUE',
ADD COLUMN     "delinquencyRemovesCurrentClasses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "planTransitionPolicy" "PlanTransitionPolicy" NOT NULL DEFAULT 'NEXT_CYCLE';

-- CreateTable
CREATE TABLE "FinanceCoupon" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "FinanceDiscountType" NOT NULL,
    "amountCents" INTEGER,
    "percentageOff" INTEGER,
    "appliesToPlanId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceCoupon_tenantId_isActive_idx" ON "FinanceCoupon"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "FinanceCoupon_appliesToPlanId_idx" ON "FinanceCoupon"("appliesToPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCoupon_tenantId_code_key" ON "FinanceCoupon"("tenantId", "code");

-- CreateIndex
CREATE INDEX "FinanceCharge_couponId_idx" ON "FinanceCharge"("couponId");

-- AddForeignKey
ALTER TABLE "FinanceCharge" ADD CONSTRAINT "FinanceCharge_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "FinanceCoupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCoupon" ADD CONSTRAINT "FinanceCoupon_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCoupon" ADD CONSTRAINT "FinanceCoupon_appliesToPlanId_fkey" FOREIGN KEY ("appliesToPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCoupon" ADD CONSTRAINT "FinanceCoupon_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
