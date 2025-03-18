/*
  Warnings:

  - Added the required column `winner_rank` to the `winner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `winner` ADD COLUMN `winner_rank` VARCHAR(191) NOT NULL;
