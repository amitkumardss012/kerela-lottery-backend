-- CreateTable
CREATE TABLE `Buyer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `lottery_id` INTEGER NULL,
    `ticket_package_id` INTEGER NULL,
    `transaction_id` VARCHAR(191) NULL,
    `status` ENUM('not_verified', 'verified', 'failed', 'success', 'refunded', 'rejected') NOT NULL DEFAULT 'not_verified',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Buyer_email_key`(`email`),
    UNIQUE INDEX `Buyer_phone_key`(`phone`),
    INDEX `Buyer_email_idx`(`email`),
    INDEX `Buyer_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lottery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `result_time` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lottery_result_time_idx`(`result_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `number_of_tickets` INTEGER NOT NULL,
    `paid_tickets` INTEGER NOT NULL,
    `free_tickets` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lottery_id` INTEGER NOT NULL,
    `ticket_package_id` INTEGER NOT NULL,
    `ticket_number` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ticket_lottery_id_idx`(`lottery_id`),
    UNIQUE INDEX `Ticket_lottery_id_ticket_number_key`(`lottery_id`, `ticket_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `winner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lottery_name` VARCHAR(191) NOT NULL,
    `ticket_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `winner_ticket_id_idx`(`ticket_id`),
    INDEX `winner_lottery_name_idx`(`lottery_name`),
    INDEX `winner_phone_idx`(`phone`),
    INDEX `winner_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Admin_email_idx` ON `Admin`(`email`);

-- AddForeignKey
ALTER TABLE `Buyer` ADD CONSTRAINT `Buyer_lottery_id_fkey` FOREIGN KEY (`lottery_id`) REFERENCES `Lottery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Buyer` ADD CONSTRAINT `Buyer_ticket_package_id_fkey` FOREIGN KEY (`ticket_package_id`) REFERENCES `TicketPackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_lottery_id_fkey` FOREIGN KEY (`lottery_id`) REFERENCES `Lottery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_ticket_package_id_fkey` FOREIGN KEY (`ticket_package_id`) REFERENCES `TicketPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
