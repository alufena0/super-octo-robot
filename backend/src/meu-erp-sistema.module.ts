import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MeuErpSistemaController } from './meu-erp-sistema.controller';
import { MeuErpSistemaService } from './meu-erp-sistema.service';
import { RelatosModule } from './modules/relatos/relatos.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    RelatosModule,
  ],
  controllers: [MeuErpSistemaController],
  providers: [MeuErpSistemaService],
})
export class MeuErpSistemaModule {}
