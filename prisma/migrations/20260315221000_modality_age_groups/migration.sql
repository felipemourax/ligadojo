ALTER TABLE "Modality"
ADD COLUMN "ageGroups" "AgeGroup"[] NOT NULL DEFAULT ARRAY['ADULT']::"AgeGroup"[];

UPDATE "Modality"
SET "ageGroups" = ARRAY["ageGroup"];

ALTER TABLE "Modality"
DROP COLUMN "ageGroup";
