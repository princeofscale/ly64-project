/*
  Warnings:

  - You are about to drop the column `dnevnikId` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentGrade" INTEGER NOT NULL,
    "desiredDirection" TEXT,
    "motivation" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "avatar" TEXT,
    "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("agreedToTerms", "authProvider", "avatar", "createdAt", "currentGrade", "desiredDirection", "email", "id", "motivation", "name", "password", "status", "updatedAt", "username") SELECT "agreedToTerms", "authProvider", "avatar", "createdAt", "currentGrade", "desiredDirection", "email", "id", "motivation", "name", "password", "status", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
