-- CreateEnum
CREATE TYPE "MaintenanceFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY', 'NEVER');

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "areaSqm" DOUBLE PRECISION,
ADD COLUMN     "floorOrZone" TEXT,
ADD COLUMN     "isCritical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastInspectionDate" TIMESTAMP(3),
ADD COLUMN     "maintenanceFrequency" "MaintenanceFrequency" NOT NULL DEFAULT 'NEVER',
ADD COLUMN     "nextPlannedPMDate" TIMESTAMP(3),
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "type" TEXT;
