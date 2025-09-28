/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `previousSchool` on the `admission` table. All the data in the column will be lost.
  - Added the required column `address` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianPhoneNumber` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenthPercentage` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twelfthPercentage` to the `Admission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admission` DROP COLUMN `dateOfBirth`,
    DROP COLUMN `previousSchool`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `guardianPhoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `motherName` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `tenthPercentage` DOUBLE NOT NULL,
    ADD COLUMN `twelfthPercentage` DOUBLE NOT NULL;
