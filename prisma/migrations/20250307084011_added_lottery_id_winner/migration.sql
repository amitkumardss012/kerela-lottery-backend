/*
  Warnings:

  - Added the required column `lottery_id` to the `winner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `winner` ADD COLUMN `lottery_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `winner` ADD CONSTRAINT `winner_lottery_id_fkey` FOREIGN KEY (`lottery_id`) REFERENCES `Lottery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
