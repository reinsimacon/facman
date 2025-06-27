/*
  Warnings:

  - You are about to drop the column `isCritical` on the `Facility` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MaintenanceFrequency" ADD VALUE 'DAILY';
ALTER TYPE "MaintenanceFrequency" ADD VALUE 'WEEKLY';

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "isCritical";
