ALTER TABLE "ClassSession"
ADD COLUMN "presentStudentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "absentStudentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "ClassSession"
SET "presentStudentIds" = ARRAY[]::TEXT[],
    "absentStudentIds" = ARRAY[]::TEXT[]
WHERE "presentStudentIds" IS NULL
   OR "absentStudentIds" IS NULL;

ALTER TABLE "ClassSession"
ALTER COLUMN "presentStudentIds" SET NOT NULL,
ALTER COLUMN "presentStudentIds" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "absentStudentIds" SET NOT NULL,
ALTER COLUMN "absentStudentIds" SET DEFAULT ARRAY[]::TEXT[];
