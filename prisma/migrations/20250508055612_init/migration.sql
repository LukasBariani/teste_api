/*
  Warnings:

  - You are about to drop the column `guestId` on the `gameattempt` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `guest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `gameattempt` DROP FOREIGN KEY `GameAttempt_guestId_fkey`;

-- DropIndex
DROP INDEX `GameAttempt_guestId_fkey` ON `gameattempt`;

-- AlterTable
ALTER TABLE `gameattempt` DROP COLUMN `guestId`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `age`;

-- AlterTable
ALTER TABLE `word` ADD COLUMN `given_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `guest`;
