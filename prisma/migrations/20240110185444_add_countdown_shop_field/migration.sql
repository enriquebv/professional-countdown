/*
  Warnings:

  - Added the required column `shop` to the `CountdownConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CountdownConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finishAt" DATETIME NOT NULL,
    "scheduledAt" DATETIME,
    "mode" TEXT NOT NULL
);
INSERT INTO "new_CountdownConfig" ("finishAt", "id", "mode", "name", "scheduledAt") SELECT "finishAt", "id", "mode", "name", "scheduledAt" FROM "CountdownConfig";
DROP TABLE "CountdownConfig";
ALTER TABLE "new_CountdownConfig" RENAME TO "CountdownConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
