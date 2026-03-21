ALTER TABLE "MarketingAiSettings"
ALTER COLUMN "allowImageGeneration" SET DEFAULT true;

UPDATE "MarketingAiSettings"
SET "allowImageGeneration" = true
WHERE "allowImageGeneration" = false;
