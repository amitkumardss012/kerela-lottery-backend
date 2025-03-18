/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `Buyer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transaction_id]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transaction_id` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ticket` ADD COLUMN `transaction_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Buyer_transaction_id_key` ON `Buyer`(`transaction_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_transaction_id_key` ON `Ticket`(`transaction_id`);
