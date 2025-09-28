/*
  Warnings:

  - Added the required column `password` to the `Admission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admission` ADD COLUMN `password` VARCHAR(191) NOT NULL;
