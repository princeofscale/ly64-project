-- DropIndex
DROP INDEX "DailyChallenge_date_key";

-- CreateTable
CREATE TABLE "MarathonRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "creatorId" TEXT NOT NULL,
    "opponentId" TEXT,
    "winnerId" TEXT,
    "questions" TEXT NOT NULL,
    "creatorAnswers" TEXT,
    "opponentAnswers" TEXT,
    "creatorScore" INTEGER,
    "opponentScore" INTEGER,
    "questionsCount" INTEGER NOT NULL DEFAULT 10,
    "timePerQuestion" INTEGER NOT NULL DEFAULT 30,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommentLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "MarathonRun_userId_subject_score_idx" ON "MarathonRun"("userId", "subject", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Duel_code_key" ON "Duel"("code");

-- CreateIndex
CREATE INDEX "Duel_status_subject_idx" ON "Duel"("status", "subject");

-- CreateIndex
CREATE INDEX "Duel_code_idx" ON "Duel"("code");

-- CreateIndex
CREATE INDEX "Comment_questionId_createdAt_idx" ON "Comment"("questionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_commentId_userId_key" ON "CommentLike"("commentId", "userId");

-- CreateIndex
CREATE INDEX "DailyChallenge_date_idx" ON "DailyChallenge"("date");

-- CreateIndex
CREATE INDEX "Question_subject_idx" ON "Question"("subject");

-- CreateIndex
CREATE INDEX "Question_topic_idx" ON "Question"("topic");

-- CreateIndex
CREATE INDEX "Test_subject_idx" ON "Test"("subject");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_testId_idx" ON "TestAttempt"("userId", "testId");

-- CreateIndex
CREATE INDEX "TestAttempt_completedAt_idx" ON "TestAttempt"("completedAt");
