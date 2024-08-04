-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('BASIC', 'ADMIN');

-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "loginType" "LoginType" NOT NULL,
    "role" "Roles" NOT NULL DEFAULT 'BASIC',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationExpiry" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" BYTEA,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chats" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipants" (
    "id" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_username_idx" ON "Users"("username");

-- CreateIndex
CREATE INDEX "Users_createdAt_updatedAt_idx" ON "Users"("createdAt", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_firstName_lastName_idx" ON "UserProfile"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Chats_isGroupChat_createdAt_idx" ON "Chats"("isGroupChat", "createdAt");

-- CreateIndex
CREATE INDEX "ChatParticipants_chatId_userId_idx" ON "ChatParticipants"("chatId", "userId");

-- CreateIndex
CREATE INDEX "ChatMessages_chatId_createdAt_idx" ON "ChatMessages"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessages_senderId_createdAt_idx" ON "ChatMessages"("senderId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipants" ADD CONSTRAINT "ChatParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipants" ADD CONSTRAINT "ChatParticipants_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessages" ADD CONSTRAINT "ChatMessages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
