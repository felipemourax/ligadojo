CREATE TYPE "StudentActivityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "StudentActivity" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "activityCategory" TEXT,
    "belt" TEXT NOT NULL,
    "stripes" INTEGER NOT NULL DEFAULT 0,
    "graduationEligibleOverride" BOOLEAN,
    "startDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "StudentActivityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentActivity_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EnrollmentRequest"
ADD COLUMN "requestedActivityCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "StudentModality"
ADD COLUMN "studentActivityId" TEXT;

INSERT INTO "StudentActivity" (
    "id",
    "studentProfileId",
    "activityCategory",
    "belt",
    "stripes",
    "graduationEligibleOverride",
    "startDate",
    "notes",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT DISTINCT ON (sm."studentProfileId", m."activityCategory")
    concat(
        'student-activity-',
        substr(md5(sm."id" || coalesce(m."activityCategory", 'no-activity')), 1, 24)
    ),
    sm."studentProfileId",
    m."activityCategory",
    sm."belt",
    sm."stripes",
    sm."graduationEligibleOverride",
    sm."startDate",
    sm."notes",
    CASE
        WHEN sm."status" = 'INACTIVE' THEN 'INACTIVE'::"StudentActivityStatus"
        ELSE 'ACTIVE'::"StudentActivityStatus"
    END,
    sm."createdAt",
    sm."updatedAt"
FROM "StudentModality" sm
JOIN "Modality" m ON m."id" = sm."modalityId"
ORDER BY sm."studentProfileId", m."activityCategory", sm."startDate" ASC, sm."createdAt" ASC;

UPDATE "StudentModality" sm
SET "studentActivityId" = sa."id"
FROM "Modality" m,
     "StudentActivity" sa
WHERE sm."modalityId" = m."id"
  AND sa."studentProfileId" = sm."studentProfileId"
  AND (
    sa."activityCategory" = m."activityCategory"
    OR (sa."activityCategory" IS NULL AND m."activityCategory" IS NULL)
  );

UPDATE "EnrollmentRequest" er
SET "requestedActivityCategories" = COALESCE(activity_map.categories, ARRAY[]::TEXT[])
FROM (
    SELECT
        er_inner."id",
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT m."activityCategory"), NULL) AS categories
    FROM "EnrollmentRequest" er_inner
    LEFT JOIN "Modality" m ON m."id" = ANY(er_inner."requestedModalityIds")
    GROUP BY er_inner."id"
) AS activity_map
WHERE er."id" = activity_map."id";

ALTER TABLE "StudentGraduation"
ADD COLUMN "studentActivityId" TEXT;

UPDATE "StudentGraduation" sg
SET "studentActivityId" = sm."studentActivityId"
FROM "StudentModality" sm
WHERE sg."studentModalityId" = sm."id";

ALTER TABLE "GraduationExamCandidate"
ADD COLUMN "studentActivityId" TEXT;

UPDATE "GraduationExamCandidate" gec
SET "studentActivityId" = sm."studentActivityId"
FROM "StudentModality" sm
WHERE gec."studentModalityId" = sm."id";

ALTER TABLE "GraduationEligibilityOverrideAudit"
ADD COLUMN "studentActivityId" TEXT;

UPDATE "GraduationEligibilityOverrideAudit" geoa
SET "studentActivityId" = sm."studentActivityId"
FROM "StudentModality" sm
WHERE geoa."studentModalityId" = sm."id";

ALTER TABLE "StudentActivity"
ADD CONSTRAINT "StudentActivity_studentProfileId_fkey"
FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "StudentActivity_studentProfileId_activityCategory_key"
ON "StudentActivity"("studentProfileId", "activityCategory");

CREATE INDEX "StudentActivity_activityCategory_status_idx"
ON "StudentActivity"("activityCategory", "status");

ALTER TABLE "StudentModality"
ADD CONSTRAINT "StudentModality_studentActivityId_fkey"
FOREIGN KEY ("studentActivityId") REFERENCES "StudentActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "StudentModality_studentActivityId_idx"
ON "StudentModality"("studentActivityId");

ALTER TABLE "StudentGraduation"
ALTER COLUMN "studentActivityId" SET NOT NULL;

ALTER TABLE "StudentGraduation"
ADD CONSTRAINT "StudentGraduation_studentActivityId_fkey"
FOREIGN KEY ("studentActivityId") REFERENCES "StudentActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "StudentGraduation_studentActivityId_graduatedAt_idx"
ON "StudentGraduation"("studentActivityId", "graduatedAt");

ALTER TABLE "GraduationExamCandidate"
ALTER COLUMN "studentActivityId" SET NOT NULL;

ALTER TABLE "GraduationExamCandidate"
ADD CONSTRAINT "GraduationExamCandidate_studentActivityId_fkey"
FOREIGN KEY ("studentActivityId") REFERENCES "StudentActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "GraduationExamCandidate_examId_studentActivityId_key"
ON "GraduationExamCandidate"("examId", "studentActivityId");

CREATE INDEX "GraduationExamCandidate_studentActivityId_idx"
ON "GraduationExamCandidate"("studentActivityId");

ALTER TABLE "GraduationEligibilityOverrideAudit"
ALTER COLUMN "studentActivityId" SET NOT NULL;

ALTER TABLE "GraduationEligibilityOverrideAudit"
ADD CONSTRAINT "GraduationEligibilityOverrideAudit_studentActivityId_fkey"
FOREIGN KEY ("studentActivityId") REFERENCES "StudentActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "GraduationEligibilityOverrideAudit_studentActivityId_createdAt_idx"
ON "GraduationEligibilityOverrideAudit"("studentActivityId", "createdAt");

ALTER TABLE "StudentGraduation" DROP CONSTRAINT IF EXISTS "StudentGraduation_studentModalityId_fkey";
DROP INDEX IF EXISTS "StudentGraduation_studentModalityId_graduatedAt_idx";
ALTER TABLE "StudentGraduation" DROP COLUMN "studentModalityId";

ALTER TABLE "GraduationExamCandidate" DROP CONSTRAINT IF EXISTS "GraduationExamCandidate_studentModalityId_fkey";
DROP INDEX IF EXISTS "GraduationExamCandidate_studentActivityId_idx";
DROP INDEX IF EXISTS "GraduationExamCandidate_examId_studentModalityId_key";
DROP INDEX IF EXISTS "GraduationExamCandidate_studentModalityId_idx";
CREATE INDEX "GraduationExamCandidate_studentActivityId_idx"
ON "GraduationExamCandidate"("studentActivityId");
ALTER TABLE "GraduationExamCandidate" DROP COLUMN "studentModalityId";

ALTER TABLE "GraduationEligibilityOverrideAudit" DROP CONSTRAINT IF EXISTS "GraduationEligibilityOverrideAudit_studentModalityId_fkey";
DROP INDEX IF EXISTS "GraduationEligibilityOverrideAudit_studentModalityId_createdAt_idx";
ALTER TABLE "GraduationEligibilityOverrideAudit" DROP COLUMN "studentModalityId";
