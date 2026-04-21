-- CreateTable
CREATE TABLE "RocketRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crashMultiplier" REAL NOT NULL,
    "serverSeed" TEXT NOT NULL,
    "clientSeedHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BETTING',
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RocketBet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "cashOutMultiplier" REAL,
    "winAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RocketBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RocketBet_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "RocketRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
    "diagnosticCompleted" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "rutheniumBalance" REAL NOT NULL DEFAULT 10,
    "lastDailyBonusAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("agreedToTerms", "authProvider", "avatar", "bio", "createdAt", "currentGrade", "desiredDirection", "diagnosticCompleted", "email", "id", "isPublic", "motivation", "name", "password", "role", "status", "updatedAt", "username") SELECT "agreedToTerms", "authProvider", "avatar", "bio", "createdAt", "currentGrade", "desiredDirection", "diagnosticCompleted", "email", "id", "isPublic", "motivation", "name", "password", "role", "status", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RocketRound_createdAt_idx" ON "RocketRound"("createdAt");

-- CreateIndex
CREATE INDEX "RocketBet_userId_createdAt_idx" ON "RocketBet"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RocketBet_roundId_idx" ON "RocketBet"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "RocketBet_userId_roundId_key" ON "RocketBet"("userId", "roundId");
