/*
  Warnings:

  - You are about to drop the column `prize_amout` on the `winner` table. All the data in the column will be lost.
  - Added the required column `prize_amount` to the `winner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `winner` DROP COLUMN `prize_amout`,
    ADD COLUMN `prize_amount` VARCHAR(191) NOT NULL;
