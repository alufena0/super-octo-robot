// ---------------------------------------------------------------------------
// api/index.js — entrypoint serverless do backend na Vercel
// ---------------------------------------------------------------------------
// A Vercel não roda `app.listen()` como um servidor tradicional: cada
// arquivo dentro de /api vira uma Function isolada, que recebe requests via
// handler (req, res) — não via porta TCP. Este arquivo cria a aplicação
// Nest uma vez por instância "quente" (cache em módulo, sobrevive entre
// invocações da mesma instância) e delega o request pro Express interno
// do Nest.
//
// SQLite em serverless: o filesystem da function é read-only, exceto
// /tmp, que é gravável mas efêmero — dura só enquanto a instância estiver
// "quente" (pode ser poucos minutos ou até ~1h, sem garantia). Por isso
// DATABASE_URL aqui aponta pra /tmp, e o seedIfEmpty (já existente no
// projeto) garante que a cada cold start o banco é recriado com os dados
// de exemplo. Isso é aceitável para demo/portfólio — não serve para dados
// que precisam persistir de verdade (nesse caso, ver nota sobre Postgres).
// ---------------------------------------------------------------------------

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:/tmp/dev.db';

const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { ValidationPipe } = require('@nestjs/common');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

const { MeuErpSistemaModule } = require('../backend/dist/src/meu-erp-sistema.module');
const { seedIfEmpty } = require('../backend/dist/prisma/seed');

let cachedServer;

async function ensureDatabase() {
  // Aplica as migrations no banco efêmero de /tmp toda vez que ele não
  // existir ainda (cold start). `prisma migrate deploy` é idempotente e
  // seguro de rodar em runtime aqui porque o banco é sempre novo.
  const dbPath = '/tmp/dev.db';
  if (!fs.existsSync(dbPath)) {
    execSync('npx prisma migrate deploy', {
      cwd: `${__dirname}/../backend`,
      stdio: 'inherit',
      env: process.env,
    });
  }
}

async function bootstrap() {
  await ensureDatabase();

  const prisma = new PrismaClient();
  await seedIfEmpty(prisma);
  await prisma.$disconnect();

  const expressApp = express();
  const app = await NestFactory.create(
    MeuErpSistemaModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();
  return expressApp;
}

module.exports = async (req, res) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  cachedServer(req, res);
};
