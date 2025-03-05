-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pretest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER,
    CONSTRAINT "Pretest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pretest" ("authorId", "createdAt", "description", "id", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "id", "title", "updatedAt" FROM "Pretest";
DROP TABLE "Pretest";
ALTER TABLE "new_Pretest" RENAME TO "Pretest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
