-- AlterTable
ALTER TABLE "GraduationExam"
ADD COLUMN "evaluatorNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "trackIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "allTracks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "allEvaluators" BOOLEAN NOT NULL DEFAULT false;

UPDATE "GraduationExam"
SET "evaluatorNames" = CASE
  WHEN "evaluatorName" IS NULL OR btrim("evaluatorName") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY["evaluatorName"]
END,
"trackIds" = ARRAY["trackId"];

ALTER TABLE "GraduationExam"
ALTER COLUMN "evaluatorNames" SET NOT NULL,
ALTER COLUMN "trackIds" SET NOT NULL;

-- CreateTable
CREATE TABLE "GraduationExamCandidate" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentModalityId" TEXT NOT NULL,
    "fromBelt" TEXT,
    "fromStripes" INTEGER DEFAULT 0,
    "toBelt" TEXT,
    "toStripes" INTEGER NOT NULL DEFAULT 0,
    "attendanceRate" INTEGER NOT NULL DEFAULT 0,
    "techniquesScore" INTEGER,
    "behavior" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationExamCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GraduationExamCandidate_examId_studentModalityId_key" ON "GraduationExamCandidate"("examId", "studentModalityId");

-- CreateIndex
CREATE INDEX "GraduationExamCandidate_studentModalityId_idx" ON "GraduationExamCandidate"("studentModalityId");

-- AddForeignKey
ALTER TABLE "GraduationExamCandidate" ADD CONSTRAINT "GraduationExamCandidate_examId_fkey" FOREIGN KEY ("examId") REFERENCES "GraduationExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationExamCandidate" ADD CONSTRAINT "GraduationExamCandidate_studentModalityId_fkey" FOREIGN KEY ("studentModalityId") REFERENCES "StudentModality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
