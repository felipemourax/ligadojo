ALTER TABLE "Subscription"
ADD COLUMN     "billingDay" INTEGER NOT NULL DEFAULT 5;

UPDATE "Subscription"
SET "billingDay" = EXTRACT(DAY FROM "startDate")::INTEGER
WHERE "billingDay" = 5;
