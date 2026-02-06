/*
  Warnings:

  - You are about to drop the column `date` on the `Achievement` table. All the data in the column will be lost.
  - Added the required column `achieverName` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tingkatan` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "date",
ADD COLUMN     "achieverName" TEXT NOT NULL,
ADD COLUMN     "tahun" TEXT NOT NULL,
ADD COLUMN     "tingkatan" TEXT NOT NULL;
