/*
  Warnings:

  - You are about to drop the column `isAccessRequired` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `specialInstructions` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "isAccessRequired",
DROP COLUMN "specialInstructions";
