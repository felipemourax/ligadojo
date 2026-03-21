ALTER TABLE "Event"
ADD COLUMN "hasRegistrationFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "registrationFeeCents" INTEGER,
ADD COLUMN "registrationFeeDueDays" INTEGER;
