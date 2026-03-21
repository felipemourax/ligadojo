-- CreateEnum
CREATE TYPE "PlanTransitionChargeHandling" AS ENUM ('REPLACE_OPEN_CHARGE', 'CHARGE_DIFFERENCE', 'CONVERT_TO_CREDIT');

-- AlterTable
ALTER TABLE "TenantPaymentSettings" ADD COLUMN     "planTransitionChargeHandling" "PlanTransitionChargeHandling" NOT NULL DEFAULT 'CHARGE_DIFFERENCE';
