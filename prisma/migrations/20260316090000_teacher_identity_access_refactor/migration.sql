-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'INVITED';

-- CreateEnum
CREATE TYPE "TeacherProfileCompleteness" AS ENUM ('PENDING_PAYMENT_DETAILS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TeacherCompensationType" AS ENUM ('FIXED', 'PER_CLASS', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "cpfNormalized" TEXT;

-- AlterTable
ALTER TABLE "TeacherProfile"
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "membershipId" TEXT,
  ADD COLUMN "roleTitle" TEXT,
  ADD COLUMN "profileCompleteness" "TeacherProfileCompleteness" NOT NULL DEFAULT 'PENDING_PAYMENT_DETAILS';

-- Backfill
UPDATE "TeacherProfile" AS tp
SET "userId" = u."id"
FROM "User" AS u
WHERE tp."email" IS NOT NULL
  AND LOWER(tp."email") = LOWER(u."email")
  AND tp."userId" IS NULL;

UPDATE "TeacherProfile" AS tp
SET "membershipId" = am."id"
FROM "AcademyMembership" AS am
WHERE tp."userId" IS NOT NULL
  AND tp."userId" = am."userId"
  AND tp."tenantId" = am."tenantId"
  AND am."role" = 'TEACHER'
  AND tp."membershipId" IS NULL;

-- CreateTable
CREATE TABLE "TeacherModality" (
  "id" TEXT NOT NULL,
  "teacherProfileId" TEXT NOT NULL,
  "modalityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TeacherModality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCompensation" (
  "id" TEXT NOT NULL,
  "teacherProfileId" TEXT NOT NULL,
  "type" "TeacherCompensationType" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "bonusDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TeacherCompensation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cpfNormalized_key" ON "User"("cpfNormalized");
CREATE UNIQUE INDEX "TeacherProfile_membershipId_key" ON "TeacherProfile"("membershipId");
CREATE INDEX "TeacherProfile_tenantId_userId_idx" ON "TeacherProfile"("tenantId", "userId");
CREATE UNIQUE INDEX "TeacherModality_teacherProfileId_modalityId_key" ON "TeacherModality"("teacherProfileId", "modalityId");
CREATE INDEX "TeacherModality_modalityId_idx" ON "TeacherModality"("modalityId");
CREATE UNIQUE INDEX "TeacherCompensation_teacherProfileId_key" ON "TeacherCompensation"("teacherProfileId");

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "AcademyMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherModality" ADD CONSTRAINT "TeacherModality_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherModality" ADD CONSTRAINT "TeacherModality_modalityId_fkey" FOREIGN KEY ("modalityId") REFERENCES "Modality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherCompensation" ADD CONSTRAINT "TeacherCompensation_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
