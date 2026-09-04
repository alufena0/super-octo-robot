-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Relato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "comunidade" TEXT NOT NULL,
    "tipoViolacao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "dataOcorrido" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Relato_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Relato" ("comunidade", "createdAt", "dataOcorrido", "descricao", "id", "local", "status", "tipoViolacao", "updatedAt") SELECT "comunidade", "createdAt", "dataOcorrido", "descricao", "id", "local", "status", "tipoViolacao", "updatedAt" FROM "Relato";
DROP TABLE "Relato";
ALTER TABLE "new_Relato" RENAME TO "Relato";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
