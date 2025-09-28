/*
  Warnings:

  - Added the required column `birthDate` to the `Admission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Admission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admission` ADD COLUMN `birthDate` DATETIME(3) NOT NULL,
    ADD COLUMN `bloodGroup` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `maritalStatus` VARCHAR(191) NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL,
    ADD COLUMN `nidNumber` VARCHAR(191) NULL,
    ADD COLUMN `occupation` VARCHAR(191) NULL,
    ADD COLUMN `permanentAddressDetail` VARCHAR(191) NULL,
    ADD COLUMN `permanentAddressDistrict` VARCHAR(191) NULL,
    ADD COLUMN `permanentAddressDivision` VARCHAR(191) NULL,
    ADD COLUMN `presentAddressDetail` VARCHAR(191) NULL,
    ADD COLUMN `presentAddressDistrict` VARCHAR(191) NULL,
    ADD COLUMN `presentAddressDivision` VARCHAR(191) NULL,
    ADD COLUMN `religion` VARCHAR(191) NULL;
