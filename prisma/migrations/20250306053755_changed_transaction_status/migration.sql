/*
  Warnings:

  - You are about to drop the column `status` on the `buyer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `buyer` DROP COLUMN `status`,
    ADD COLUMN `transaction_status` ENUM('not_verified', 'verified', 'failed', 'success', 'refunded', 'rejected') NOT NULL DEFAULT 'not_verified';
