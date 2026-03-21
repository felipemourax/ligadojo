ALTER TABLE "Modality"
ADD COLUMN "activityCategory" TEXT;

UPDATE "Modality"
SET "activityCategory" = CASE
  WHEN LOWER("name") LIKE '%nogi%' OR LOWER("name") LIKE '%no-gi%' OR LOWER("name") LIKE '%jiu%' THEN 'jiu-jitsu'
  WHEN LOWER("name") LIKE '%jud%' THEN 'judo'
  WHEN LOWER("name") LIKE '%karat%' THEN 'karate'
  WHEN LOWER("name") LIKE '%taekw%' THEN 'taekwondo'
  WHEN LOWER("name") LIKE '%box%' THEN 'boxe'
  WHEN LOWER("name") LIKE '%muay%' THEN 'muay-thai'
  WHEN LOWER("name") LIKE '%mma%' THEN 'mma'
  ELSE 'outras'
END
WHERE "activityCategory" IS NULL;
