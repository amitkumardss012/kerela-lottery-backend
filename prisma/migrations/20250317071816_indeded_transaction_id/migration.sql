/*
  Warnings:

  - A unique constraint covering the columns `[lottery_id,ticket_number,transaction_id]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Ticket_lottery_id_ticket_number_key` ON `ticket`;

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_lottery_id_ticket_number_transaction_id_key` ON `Ticket`(`lottery_id`, `ticket_number`, `transaction_id`);
