/*
  Warnings:

  - You are about to drop the column `ticket_id` on the `winner` table. All the data in the column will be lost.
  - Added the required column `ticket_number` to the `winner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `winner_ticket_id_idx` ON `winner`;

-- AlterTable
ALTER TABLE `winner` DROP COLUMN `ticket_id`,
    ADD COLUMN `ticket_number` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `winner_ticket_number_idx` ON `winner`(`ticket_number`);
