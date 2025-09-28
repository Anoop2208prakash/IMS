/*
  Warnings:

  - You are about to drop the column `maritalStatus` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `nidNumber` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddressDetail` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddressDistrict` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddressDivision` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `presentAddressDetail` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `presentAddressDistrict` on the `admission` table. All the data in the column will be lost.
  - You are about to drop the column `presentAddressDivision` on the `admission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `admission` DROP COLUMN `maritalStatus`,
    DROP COLUMN `nidNumber`,
    DROP COLUMN `occupation`,
    DROP COLUMN `permanentAddressDetail`,
    DROP COLUMN `permanentAddressDistrict`,
    DROP COLUMN `permanentAddressDivision`,
    DROP COLUMN `presentAddressDetail`,
    DROP COLUMN `presentAddressDistrict`,
    DROP COLUMN `presentAddressDivision`;
