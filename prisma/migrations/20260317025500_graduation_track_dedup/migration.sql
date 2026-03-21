WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "tenantId", "modalityId", name, branch, progression
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_num
  FROM "GraduationTrack"
  WHERE "modalityId" IS NOT NULL
)
DELETE FROM "GraduationTrack"
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE row_num > 1
);

CREATE UNIQUE INDEX "GraduationTrack_tenantId_modalityId_name_branch_progression_key"
ON "GraduationTrack"("tenantId", "modalityId", "name", "branch", "progression");
