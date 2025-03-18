/*
  Warnings:

  - Added the required column `buyer_id` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `buyer_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `Buyer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
