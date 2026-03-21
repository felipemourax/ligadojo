ALTER TABLE "ClassSession"
ADD COLUMN "justifiedStudentIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
