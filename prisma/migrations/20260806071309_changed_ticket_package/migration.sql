-- AlterTable
ALTER TABLE `ticketpackage` ADD COLUMN `badge` ENUM('POPULAR', 'BEST_VALUE', 'RECOMMENDED', 'HOT_DEAL', 'EXCLUSIVE', 'LIMITED_OFFER') NULL,
    ADD COLUMN `bonus_perks` JSON NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `image` JSON NULL,
    ADD COLUMN `lottery_id` INTEGER NULL,
    ADD COLUMN `odds_multiplier_text` VARCHAR(191) NULL,
    ADD COLUMN `original_price` DOUBLE NULL,
    ADD COLUMN `savings_text` VARCHAR(191) NULL,
    ADD COLUMN `valid_until` DATETIME(3) NULL,
    MODIFY `free_tickets` INTEGER NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `ticketpackage_lottery_id_idx` ON `ticketpackage`(`lottery_id`);

-- CreateIndex
CREATE INDEX `ticketpackage_is_active_idx` ON `ticketpackage`(`is_active`);

-- AddForeignKey
ALTER TABLE `ticketpackage` ADD CONSTRAINT `ticketpackage_lottery_id_fkey` FOREIGN KEY (`lottery_id`) REFERENCES `lottery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
