-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "progressLogs" JSONB[],
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
