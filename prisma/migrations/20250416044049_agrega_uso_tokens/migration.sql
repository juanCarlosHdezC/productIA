/*
  Warnings:

  - You are about to drop the column `descriptionQuota` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionsToday` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionsUsed` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `descriptionQuota`,
    DROP COLUMN `descriptionsToday`,
    DROP COLUMN `descriptionsUsed`,
    ADD COLUMN `tokenQuota` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tokensToday` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `tokensUsed` INTEGER NOT NULL DEFAULT 0;
