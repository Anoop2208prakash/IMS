/*
  Warnings:

  - You are about to drop the `subjectassignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `subjectassignment` DROP FOREIGN KEY `SubjectAssignment_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `subjectassignment` DROP FOREIGN KEY `SubjectAssignment_teacherId_fkey`;

-- AlterTable
ALTER TABLE `subject` ADD COLUMN `teacherId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `subjectassignment`;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
