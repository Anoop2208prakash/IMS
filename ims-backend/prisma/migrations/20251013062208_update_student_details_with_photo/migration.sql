/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nidNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentAddress` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentAddress` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `bloodGroup` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NOT NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    ADD COLUMN `maritalStatus` ENUM('SINGLE', 'MARRIED') NULL,
    ADD COLUMN `motherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL,
    ADD COLUMN `nidNumber` VARCHAR(191) NULL,
    ADD COLUMN `occupation` VARCHAR(191) NULL,
    ADD COLUMN `permanentAddress` TEXT NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `photoUrl` VARCHAR(191) NULL,
    ADD COLUMN `presentAddress` TEXT NOT NULL,
    ADD COLUMN `religion` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_phoneNumber_key` ON `Student`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_nidNumber_key` ON `Student`(`nidNumber`);
