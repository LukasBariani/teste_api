/*
  Warnings:

  - You are about to drop the column `text` on the `word` table. All the data in the column will be lost.
  - Added the required column `definitions` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `word` DROP COLUMN `text`,
    ADD COLUMN `definitions` JSON NOT NULL,
    ADD COLUMN `word` VARCHAR(64) NOT NULL;
