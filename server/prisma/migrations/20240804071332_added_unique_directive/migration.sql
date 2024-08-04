/*
  Warnings:

  - The values [EMAIL,GOOGLE,FACEBOOK] on the enum `LoginType` will be removed. If these variants are still used in the database, this will fail.
  - The values [BASIC,ADMIN] on the enum `Roles` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[chatId,userId]` on the table `ChatParticipants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LoginType_new" AS ENUM ('email', 'google', 'facebook');
ALTER TABLE "Users" ALTER COLUMN "loginType" TYPE "LoginType_new" USING ("loginType"::text::"LoginType_new");
ALTER TYPE "LoginType" RENAME TO "LoginType_old";
ALTER TYPE "LoginType_new" RENAME TO "LoginType";
DROP TYPE "LoginType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Roles_new" AS ENUM ('basic', 'admin');
ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "role" TYPE "Roles_new" USING ("role"::text::"Roles_new");
ALTER TYPE "Roles" RENAME TO "Roles_old";
ALTER TYPE "Roles_new" RENAME TO "Roles";
DROP TYPE "Roles_old";
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'basic';
COMMIT;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'basic';

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipants_chatId_userId_key" ON "ChatParticipants"("chatId", "userId");
