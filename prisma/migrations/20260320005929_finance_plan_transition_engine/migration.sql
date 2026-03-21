-- CreateEnum
CREATE TYPE "SubscriptionPlanChangeStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SubscriptionPlanChange" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "fromPlanId" TEXT NOT NULL,
    "toPlanId" TEXT NOT NULL,
    "transitionPolicy" "PlanTransitionPolicy" NOT NULL,
    "chargeHandling" "PlanTransitionChargeHandling" NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionPlanChangeStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlanChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceCreditBalance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentProfileId" TEXT,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceCreditBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPlanChange_tenantId_status_effectiveDate_idx" ON "SubscriptionPlanChange"("tenantId", "status", "effectiveDate");

-- CreateIndex
CREATE INDEX "SubscriptionPlanChange_tenantId_userId_status_idx" ON "SubscriptionPlanChange"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "SubscriptionPlanChange_subscriptionId_status_idx" ON "SubscriptionPlanChange"("subscriptionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCreditBalance_studentProfileId_key" ON "FinanceCreditBalance"("studentProfileId");

-- CreateIndex
CREATE INDEX "FinanceCreditBalance_tenantId_balanceCents_idx" ON "FinanceCreditBalance"("tenantId", "balanceCents");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceCreditBalance_tenantId_userId_key" ON "FinanceCreditBalance"("tenantId", "userId");

-- AddForeignKey
ALTER TABLE "SubscriptionPlanChange" ADD CONSTRAINT "SubscriptionPlanChange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlanChange" ADD CONSTRAINT "SubscriptionPlanChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlanChange" ADD CONSTRAINT "SubscriptionPlanChange_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlanChange" ADD CONSTRAINT "SubscriptionPlanChange_fromPlanId_fkey" FOREIGN KEY ("fromPlanId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlanChange" ADD CONSTRAINT "SubscriptionPlanChange_toPlanId_fkey" FOREIGN KEY ("toPlanId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCreditBalance" ADD CONSTRAINT "FinanceCreditBalance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCreditBalance" ADD CONSTRAINT "FinanceCreditBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceCreditBalance" ADD CONSTRAINT "FinanceCreditBalance_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
