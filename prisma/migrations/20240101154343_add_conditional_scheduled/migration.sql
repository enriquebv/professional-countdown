-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CountdownConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "finishAt" DATETIME NOT NULL,
    "scheduledAt" DATETIME,
    "mode" TEXT NOT NULL
);
INSERT INTO "new_CountdownConfig" ("finishAt", "id", "mode", "scheduledAt") SELECT "finishAt", "id", "mode", "scheduledAt" FROM "CountdownConfig";
DROP TABLE "CountdownConfig";
ALTER TABLE "new_CountdownConfig" RENAME TO "CountdownConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
