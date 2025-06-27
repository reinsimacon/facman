-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "impactLevel" "ImpactLevel" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "isAccessRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationDetail" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "requestedCompletionDate" TIMESTAMP(3),
ADD COLUMN     "specialInstructions" TEXT;
