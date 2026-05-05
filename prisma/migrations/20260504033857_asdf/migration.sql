/*
  Warnings:

  - Added the required column `timeTaken` to the `PlayerWar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerWar" ADD COLUMN     "timeTaken" INTEGER NOT NULL;
