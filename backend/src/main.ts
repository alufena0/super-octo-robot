import { NestFactory } from '@nestjs/core';
import { MeuErpSistemaModule } from './meu-erp-sistema.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { seedIfEmpty } from '../prisma/seed';

async function bootstrap() {
  // Seed automático — roda antes de tudo, só popula se o banco estiver vazio.
  const prisma = new PrismaClient();
  await seedIfEmpty(prisma);
  await prisma.$disconnect();

  const app = await NestFactory.create(MeuErpSistemaModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000);
}
bootstrap();
