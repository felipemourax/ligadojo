-- AlterTable
ALTER TABLE "EnrollmentRequest" ADD COLUMN     "requestedModalityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "teacherRoleTitle" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT;
