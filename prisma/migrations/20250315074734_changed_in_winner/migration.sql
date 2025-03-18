/*
  Warnings:

  - You are about to drop the column `lottery_name` on the `winner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Buyer_email_key` ON `buyer`;

-- DropIndex
DROP INDEX `Buyer_phone_key` ON `buyer`;

-- DropIndex
DROP INDEX `winner_lottery_name_idx` ON `winner`;

-- AlterTable
ALTER TABLE `buyer` ADD COLUMN `is_read` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `winner` DROP COLUMN `lottery_name`,
    ADD COLUMN `claimed` BOOLEAN NOT NULL DEFAULT false;
