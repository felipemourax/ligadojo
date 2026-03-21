DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AthleteTitlePlacement') THEN
    CREATE TYPE "AthleteTitlePlacement" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'CHAMPION', 'RUNNER_UP');
  END IF;
END $$;

ALTER TABLE "AthleteTitle"
ADD COLUMN IF NOT EXISTS "placement" "AthleteTitlePlacement";
