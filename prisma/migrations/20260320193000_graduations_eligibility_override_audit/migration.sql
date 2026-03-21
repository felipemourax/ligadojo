CREATE TABLE "GraduationEligibilityOverrideAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentModalityId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT,
    "actorRole" "AcademyRole" NOT NULL,
    "eligibleOverrideValue" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraduationEligibilityOverrideAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GraduationEligibilityOverrideAudit_tenantId_createdAt_idx" ON "GraduationEligibilityOverrideAudit"("tenantId", "createdAt");
CREATE INDEX "GraduationEligibilityOverrideAudit_studentModalityId_createdAt_idx" ON "GraduationEligibilityOverrideAudit"("studentModalityId", "createdAt");
CREATE INDEX "GraduationEligibilityOverrideAudit_actorUserId_idx" ON "GraduationEligibilityOverrideAudit"("actorUserId");

ALTER TABLE "GraduationEligibilityOverrideAudit" ADD CONSTRAINT "GraduationEligibilityOverrideAudit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GraduationEligibilityOverrideAudit" ADD CONSTRAINT "GraduationEligibilityOverrideAudit_studentModalityId_fkey" FOREIGN KEY ("studentModalityId") REFERENCES "StudentModality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GraduationEligibilityOverrideAudit" ADD CONSTRAINT "GraduationEligibilityOverrideAudit_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
