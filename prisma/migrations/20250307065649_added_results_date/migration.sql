/*
  Warnings:

  - Added the required column `result_date` to the `Lottery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lottery` ADD COLUMN `result_date` VARCHAR(191) NOT NULL,
    MODIFY `result_time` VARCHAR(191) NOT NULL;
