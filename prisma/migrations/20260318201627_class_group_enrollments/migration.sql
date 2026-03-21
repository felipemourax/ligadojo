-- CreateEnum
CREATE TYPE "ClassGroupEnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "Modality_tenantId_sortOrder_idx";

-- CreateTable
CREATE TABLE "ClassGroupEnrollment" (
    "id" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "status" "ClassGroupEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassGroupEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassGroupEnrollment_classGroupId_status_idx" ON "ClassGroupEnrollment"("classGroupId", "status");

-- CreateIndex
CREATE INDEX "ClassGroupEnrollment_studentProfileId_status_idx" ON "ClassGroupEnrollment"("studentProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroupEnrollment_classGroupId_studentProfileId_key" ON "ClassGroupEnrollment"("classGroupId", "studentProfileId");

-- CreateIndex
CREATE INDEX "Modality_tenantId_activityCategory_sortOrder_idx" ON "Modality"("tenantId", "activityCategory", "sortOrder");

-- AddForeignKey
ALTER TABLE "ClassGroupEnrollment" ADD CONSTRAINT "ClassGroupEnrollment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroupEnrollment" ADD CONSTRAINT "ClassGroupEnrollment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
