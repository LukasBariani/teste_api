-- DropForeignKey
ALTER TABLE `gameattempt` DROP FOREIGN KEY `GameAttempt_userId_fkey`;

-- DropIndex
DROP INDEX `GameAttempt_userId_fkey` ON `gameattempt`;

-- AlterTable
ALTER TABLE `gameattempt` ADD COLUMN `guestId` VARCHAR(191) NULL,
    MODIFY `userId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Guest` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GameAttempt` ADD CONSTRAINT `GameAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameAttempt` ADD CONSTRAINT `GameAttempt_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
