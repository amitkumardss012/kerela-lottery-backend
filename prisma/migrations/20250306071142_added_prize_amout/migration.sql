/*
  Warnings:

  - Added the required column `prize_amout` to the `winner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `winner` ADD COLUMN `prize_amout` INTEGER NOT NULL;
