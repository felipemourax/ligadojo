ALTER TABLE "Event" DROP COLUMN IF EXISTS "status_v2";
ALTER TABLE "EventParticipant" DROP COLUMN IF EXISTS "status_v2";
DROP TYPE IF EXISTS "EventStatus_new";
DROP TYPE IF EXISTS "EventParticipantStatus_new";

ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "EventStatus_new" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

ALTER TABLE "Event" ADD COLUMN "status_v2" "EventStatus_new";

UPDATE "Event"
SET "status_v2" = CASE
  WHEN "status"::text = 'DRAFT' THEN 'SCHEDULED'::"EventStatus_new"
  WHEN "status"::text = 'COMPLETED' THEN 'COMPLETED'::"EventStatus_new"
  WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'::"EventStatus_new"
  ELSE 'SCHEDULED'::"EventStatus_new"
END;

ALTER TABLE "Event" ALTER COLUMN "status_v2" SET NOT NULL;
ALTER TABLE "Event" DROP COLUMN "status";
ALTER TABLE "Event" RENAME COLUMN "status_v2" TO "status";
DROP TYPE "EventStatus";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

ALTER TABLE "EventParticipant" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "EventParticipantStatus_new" AS ENUM (
  'INVITED',
  'CONFIRMED',
  'MAYBE',
  'DECLINED',
  'PAYMENT_PENDING'
);

ALTER TABLE "EventParticipant" ADD COLUMN "status_v2" "EventParticipantStatus_new";

UPDATE "EventParticipant" participant
SET "status_v2" = CASE
  WHEN participant."status"::text = 'GOING' THEN 'CONFIRMED'::"EventParticipantStatus_new"
  WHEN participant."status"::text = 'NOT_GOING' THEN 'DECLINED'::"EventParticipantStatus_new"
  WHEN participant."status"::text = 'PENDING'
    AND EXISTS (
      SELECT 1
      FROM "Event" event_record
      WHERE event_record."id" = participant."eventId"
        AND event_record."hasRegistrationFee" = true
    )
    AND EXISTS (
      SELECT 1
      FROM "FinanceCharge" finance_charge
      WHERE finance_charge."externalKey" = 'event:' || participant."eventId" || ':user:' || participant."userId"
        AND finance_charge."status" = 'PAID'
    ) THEN 'CONFIRMED'::"EventParticipantStatus_new"
  WHEN participant."status"::text = 'PENDING'
    AND EXISTS (
      SELECT 1
      FROM "Event" event_record
      WHERE event_record."id" = participant."eventId"
        AND event_record."hasRegistrationFee" = true
    )
    AND EXISTS (
      SELECT 1
      FROM "FinanceCharge" finance_charge
      WHERE finance_charge."externalKey" = 'event:' || participant."eventId" || ':user:' || participant."userId"
        AND finance_charge."status" IN ('PENDING', 'OVERDUE')
    ) THEN 'PAYMENT_PENDING'::"EventParticipantStatus_new"
  ELSE 'INVITED'::"EventParticipantStatus_new"
END;

ALTER TABLE "EventParticipant" ALTER COLUMN "status_v2" SET NOT NULL;
ALTER TABLE "EventParticipant" DROP COLUMN "status";
ALTER TABLE "EventParticipant" RENAME COLUMN "status_v2" TO "status";
DROP TYPE "EventParticipantStatus";
ALTER TYPE "EventParticipantStatus_new" RENAME TO "EventParticipantStatus";
ALTER TABLE "EventParticipant" ALTER COLUMN "status" SET DEFAULT 'INVITED';
