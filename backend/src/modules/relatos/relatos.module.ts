import { Module } from '@nestjs/common';
import { RelatosController } from './relatos.controller';
import { RelatosService } from './relatos.service';

@Module({
  controllers: [RelatosController],
  providers: [RelatosService],
})
export class RelatosModule {}
