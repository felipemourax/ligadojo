-- AlterTable
ALTER TABLE "StudentModality"
ADD COLUMN "graduationEligibleOverride" BOOLEAN;

-- CreateEnum
CREATE TYPE "GraduationTrackBranch" AS ENUM ('KIDS', 'ADULT', 'MIXED');

-- CreateEnum
CREATE TYPE "GraduationProgression" AS ENUM ('BELT', 'SKILL_LEVEL');

-- CreateEnum
CREATE TYPE "GraduationExamStatus" AS ENUM ('SCHEDULED', 'DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GraduationTrack" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "modalityId" TEXT,
    "name" TEXT NOT NULL,
    "branch" "GraduationTrackBranch" NOT NULL,
    "progression" "GraduationProgression" NOT NULL DEFAULT 'BELT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationLevel" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "stripes" INTEGER NOT NULL DEFAULT 0,
    "minTimeMonths" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationExam" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "modalityId" TEXT,
    "title" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "evaluatorName" TEXT,
    "notes" TEXT,
    "status" "GraduationExamStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GraduationTrack_tenantId_sortOrder_idx" ON "GraduationTrack"("tenantId", "sortOrder");

-- CreateIndex
CREATE INDEX "GraduationTrack_tenantId_modalityId_idx" ON "GraduationTrack"("tenantId", "modalityId");

-- CreateIndex
CREATE INDEX "GraduationLevel_trackId_sortOrder_idx" ON "GraduationLevel"("trackId", "sortOrder");

-- CreateIndex
CREATE INDEX "GraduationExam_tenantId_examDate_idx" ON "GraduationExam"("tenantId", "examDate");

-- CreateIndex
CREATE INDEX "GraduationExam_trackId_examDate_idx" ON "GraduationExam"("trackId", "examDate");

-- AddForeignKey
ALTER TABLE "GraduationTrack" ADD CONSTRAINT "GraduationTrack_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationTrack" ADD CONSTRAINT "GraduationTrack_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationLevel" ADD CONSTRAINT "GraduationLevel_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "GraduationTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationExam" ADD CONSTRAINT "GraduationExam_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationExam" ADD CONSTRAINT "GraduationExam_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "GraduationTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationExam" ADD CONSTRAINT "GraduationExam_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
