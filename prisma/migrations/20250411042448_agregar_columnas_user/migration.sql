-- AlterTable
ALTER TABLE `user` ADD COLUMN `descriptionQuota` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `descriptionsToday` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `descriptionsUsed` INTEGER NOT NULL DEFAULT 0;
