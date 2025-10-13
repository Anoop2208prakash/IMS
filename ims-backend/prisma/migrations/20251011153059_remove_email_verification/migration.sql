/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_emailVerificationToken_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerificationToken`,
    DROP COLUMN `isVerified`;
