-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CountdownConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finishAt" DATETIME NOT NULL,
    "scheduledAt" DATETIME,
    "mode" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "removed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_CountdownConfig" ("finishAt", "id", "mode", "name", "scheduledAt", "shop") SELECT "finishAt", "id", "mode", "name", "scheduledAt", "shop" FROM "CountdownConfig";
DROP TABLE "CountdownConfig";
ALTER TABLE "new_CountdownConfig" RENAME TO "CountdownConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
