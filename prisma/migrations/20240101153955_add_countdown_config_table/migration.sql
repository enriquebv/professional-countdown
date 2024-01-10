-- CreateTable
CREATE TABLE "CountdownConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "finishAt" DATETIME NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "mode" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CountdownConfigDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "allDay" BOOLEAN NOT NULL,
    "rangeStart" TEXT NOT NULL,
    "rangeEnd" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "CountdownConfigDay_configId_fkey" FOREIGN KEY ("configId") REFERENCES "CountdownConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
