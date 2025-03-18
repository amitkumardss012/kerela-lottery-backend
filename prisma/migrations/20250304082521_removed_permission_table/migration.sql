/*
  Warnings:

  - You are about to drop the `_admin_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_admin_permissions` DROP FOREIGN KEY `_admin_permissions_A_fkey`;

-- DropForeignKey
ALTER TABLE `_admin_permissions` DROP FOREIGN KEY `_admin_permissions_B_fkey`;

-- DropTable
DROP TABLE `_admin_permissions`;

-- DropTable
DROP TABLE `permission`;
