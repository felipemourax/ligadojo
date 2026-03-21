-- CreateTable
CREATE TABLE "TeacherGraduation" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "activityCategory" TEXT,
    "fromBelt" TEXT,
    "fromStripes" INTEGER,
    "toBelt" TEXT NOT NULL,
    "toStripes" INTEGER NOT NULL DEFAULT 0,
    "graduatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherGraduation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherGraduation_teacherProfileId_graduatedAt_idx" ON "TeacherGraduation"("teacherProfileId", "graduatedAt");

-- CreateIndex
CREATE INDEX "TeacherGraduation_activityCategory_graduatedAt_idx" ON "TeacherGraduation"("activityCategory", "graduatedAt");

-- AddForeignKey
ALTER TABLE "TeacherGraduation" ADD CONSTRAINT "TeacherGraduation_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
