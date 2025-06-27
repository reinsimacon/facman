/*
  Warnings:

  - Added the required column `purpose` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "purpose" TEXT NOT NULL,
ADD COLUMN     "requestOfMaterials" TEXT;
