-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "year" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "curriculumCode" TEXT NOT NULL DEFAULT '-',
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER,
    CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Answer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "questionId" INTEGER NOT NULL,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Answer" ("id", "isCorrect", "questionId", "text") SELECT "id", "isCorrect", "questionId", "text" FROM "Answer";
DROP TABLE "Answer";
ALTER TABLE "new_Answer" RENAME TO "Answer";
CREATE TABLE "new_PretestAttempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pretestId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "PretestAttempt_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PretestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PretestAttempt" ("completedAt", "id", "pretestId", "startedAt", "userId") SELECT "completedAt", "id", "pretestId", "startedAt", "userId" FROM "PretestAttempt";
DROP TABLE "PretestAttempt";
ALTER TABLE "new_PretestAttempt" RENAME TO "PretestAttempt";
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "pretestId" INTEGER NOT NULL,
    "correctAnswer" TEXT,
    CONSTRAINT "Question_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("correctAnswer", "id", "orderIndex", "pretestId", "text", "type") SELECT "correctAnswer", "id", "orderIndex", "pretestId", "text", "type" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
