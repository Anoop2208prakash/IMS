/*
  Warnings:

  - You are about to drop the column `rollNumber` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Student_rollNumber_key` ON `student`;

-- DropIndex
DROP INDEX `Teacher_employeeId_key` ON `teacher`;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `rollNumber`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `employeeId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `sID` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_sID_key` ON `User`(`sID`);
