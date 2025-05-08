/*
  Warnings:

  - Added the required column `guess` to the `GameAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `gameattempt` ADD COLUMN `guess` VARCHAR(191) NOT NULL;
