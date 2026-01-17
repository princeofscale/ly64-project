/*
  Warnings:

  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

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
    "dnevnikId" TEXT,
    "avatar" TEXT,
    "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Generate username from email (part before @) and add suffix with row number if needed
INSERT INTO "new_User" ("id", "email", "username", "password", "name", "status", "currentGrade", "desiredDirection", "motivation", "authProvider", "dnevnikId", "avatar", "agreedToTerms", "createdAt", "updatedAt")
SELECT
    "id",
    "email",
    LOWER(REPLACE(SUBSTR("email", 1, INSTR("email", '@') - 1), '.', '_')) || '_' || SUBSTR("id", 1, 6) as "username",
    "password",
    "name",
    "status",
    "currentGrade",
    "desiredDirection",
    "motivation",
    "authProvider",
    "dnevnikId",
    "avatar",
    "agreedToTerms",
    "createdAt",
    "updatedAt"
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_dnevnikId_key" ON "User"("dnevnikId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
