import { Module } from '@nestjs/common';
import { MeuErpSistemaController } from './meu-erp-sistema.controller';
import { MeuErpSistemaService } from './meu-erp-sistema.service';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, InventoryModule],
  controllers: [MeuErpSistemaController],
  providers: [MeuErpSistemaService],
})
export class MeuErpSistemaModule {}
