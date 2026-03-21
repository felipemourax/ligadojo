-- CreateEnum
CREATE TYPE "StudentProfileStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StudentModalityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Modality" ADD COLUMN IF NOT EXISTS "dummy_students_foundation_marker" INTEGER;

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "membershipId" TEXT,
    "emergencyContact" TEXT,
    "notes" TEXT,
    "status" "StudentProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentModality" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "modalityId" TEXT NOT NULL,
    "belt" TEXT NOT NULL,
    "stripes" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "StudentModalityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentModality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGraduation" (
    "id" TEXT NOT NULL,
    "studentModalityId" TEXT NOT NULL,
    "fromBelt" TEXT,
    "fromStripes" INTEGER,
    "toBelt" TEXT NOT NULL,
    "toStripes" INTEGER NOT NULL DEFAULT 0,
    "evaluatorName" TEXT NOT NULL,
    "graduatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentGraduation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_membershipId_key" ON "StudentProfile"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_userId_key" ON "StudentProfile"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_status_idx" ON "StudentProfile"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentModality_studentProfileId_modalityId_key" ON "StudentModality"("studentProfileId", "modalityId");

-- CreateIndex
CREATE INDEX "StudentModality_modalityId_status_idx" ON "StudentModality"("modalityId", "status");

-- CreateIndex
CREATE INDEX "StudentGraduation_studentModalityId_graduatedAt_idx" ON "StudentGraduation"("studentModalityId", "graduatedAt");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "AcademyMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModality" ADD CONSTRAINT "StudentModality_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModality" ADD CONSTRAINT "StudentModality_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGraduation" ADD CONSTRAINT "StudentGraduation_studentModalityId_fkey" FOREIGN KEY ("studentModalityId") REFERENCES "StudentModality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cleanup compatibility no-op
ALTER TABLE "Modality" DROP COLUMN "dummy_students_foundation_marker";
