-- CreateEnum
CREATE TYPE "FinanceRecurringSetupSource" AS ENUM ('MANUAL_AMOUNT', 'PLAN_LINKED');

-- AlterTable
ALTER TABLE "FinanceCharge" ADD COLUMN     "recurringSetupId" TEXT;

-- CreateTable
CREATE TABLE "FinanceRecurringSetup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentProfileId" TEXT,
    "planId" TEXT,
    "source" "FinanceRecurringSetupSource" NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "billingDay" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceRecurringSetup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceRecurringSetup_tenantId_isActive_idx" ON "FinanceRecurringSetup"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "FinanceRecurringSetup_userId_isActive_idx" ON "FinanceRecurringSetup"("userId", "isActive");

-- CreateIndex
CREATE INDEX "FinanceRecurringSetup_studentProfileId_isActive_idx" ON "FinanceRecurringSetup"("studentProfileId", "isActive");

-- CreateIndex
CREATE INDEX "FinanceRecurringSetup_planId_idx" ON "FinanceRecurringSetup"("planId");

-- AddForeignKey
ALTER TABLE "FinanceCharge" ADD CONSTRAINT "FinanceCharge_recurringSetupId_fkey" FOREIGN KEY ("recurringSetupId") REFERENCES "FinanceRecurringSetup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecurringSetup" ADD CONSTRAINT "FinanceRecurringSetup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecurringSetup" ADD CONSTRAINT "FinanceRecurringSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecurringSetup" ADD CONSTRAINT "FinanceRecurringSetup_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceRecurringSetup" ADD CONSTRAINT "FinanceRecurringSetup_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
