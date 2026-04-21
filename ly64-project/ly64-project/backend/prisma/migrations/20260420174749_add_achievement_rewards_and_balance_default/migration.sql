-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "rutheniumReward" REAL NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Achievement" ("condition", "createdAt", "description", "icon", "id", "name", "points") SELECT "condition", "createdAt", "description", "icon", "id", "name", "points" FROM "Achievement";
DROP TABLE "Achievement";
ALTER TABLE "new_Achievement" RENAME TO "Achievement";
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
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
    "diagnosticCompleted" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "rutheniumBalance" REAL NOT NULL DEFAULT 1,
    "lastDailyBonusAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("agreedToTerms", "authProvider", "avatar", "bio", "createdAt", "currentGrade", "desiredDirection", "diagnosticCompleted", "email", "id", "isPublic", "lastDailyBonusAt", "motivation", "name", "password", "role", "rutheniumBalance", "status", "updatedAt", "username") SELECT "agreedToTerms", "authProvider", "avatar", "bio", "createdAt", "currentGrade", "desiredDirection", "diagnosticCompleted", "email", "id", "isPublic", "lastDailyBonusAt", "motivation", "name", "password", "role", "rutheniumBalance", "status", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
