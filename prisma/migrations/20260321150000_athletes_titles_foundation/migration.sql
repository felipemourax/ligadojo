-- CreateTable
CREATE TABLE "AthleteTitle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentProfileId" TEXT,
    "teacherProfileId" TEXT,
    "title" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AthleteTitle_tenantId_year_idx" ON "AthleteTitle"("tenantId", "year");

-- CreateIndex
CREATE INDEX "AthleteTitle_studentProfileId_year_idx" ON "AthleteTitle"("studentProfileId", "year");

-- CreateIndex
CREATE INDEX "AthleteTitle_teacherProfileId_year_idx" ON "AthleteTitle"("teacherProfileId", "year");

-- AddForeignKey
ALTER TABLE "AthleteTitle" ADD CONSTRAINT "AthleteTitle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteTitle" ADD CONSTRAINT "AthleteTitle_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteTitle" ADD CONSTRAINT "AthleteTitle_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
