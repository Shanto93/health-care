/*
  Warnings:

  - You are about to drop the column `qualifications` on the `doctors` table. All the data in the column will be lost.
  - Added the required column `experience` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualification` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "qualifications",
ADD COLUMN     "experience" INTEGER NOT NULL,
ADD COLUMN     "qualification" TEXT NOT NULL,
ADD COLUMN     "registrationNumber" TEXT NOT NULL;
