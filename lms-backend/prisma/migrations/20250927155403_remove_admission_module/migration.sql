/*
  Warnings:

  - You are about to drop the `admission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `admission` DROP FOREIGN KEY `Admission_courseId_fkey`;

-- DropTable
DROP TABLE `admission`;
