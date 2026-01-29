-- CreateTable
CREATE TABLE `blog_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_category_name_key`(`name`),
    UNIQUE INDEX `blog_category_slug_key`(`slug`),
    INDEX `blog_category_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_tag_name_key`(`name`),
    UNIQUE INDEX `blog_tag_slug_key`(`slug`),
    INDEX `blog_tag_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `summary` TEXT NULL,
    `featured_image` JSON NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` TEXT NULL,
    `meta_keywords` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `author_id` INTEGER NOT NULL,
    `category_id` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_post_slug_key`(`slug`),
    INDEX `blog_post_slug_idx`(`slug`),
    INDEX `blog_post_author_id_idx`(`author_id`),
    INDEX `blog_post_category_id_idx`(`category_id`),
    INDEX `blog_post_is_published_idx`(`is_published`),
    INDEX `blog_post_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BlogPostTags` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BlogPostTags_AB_unique`(`A`, `B`),
    INDEX `_BlogPostTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_post` ADD CONSTRAINT `blog_post_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_post` ADD CONSTRAINT `blog_post_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlogPostTags` ADD CONSTRAINT `_BlogPostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `blog_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlogPostTags` ADD CONSTRAINT `_BlogPostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `blog_tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
