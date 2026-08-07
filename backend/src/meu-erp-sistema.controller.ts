import { Controller, Get } from '@nestjs/common';
import { MeuErpSistemaService } from './meu-erp-sistema.service';

@Controller()
export class MeuErpSistemaController {
  constructor(private readonly meuErpSistemaService: MeuErpSistemaService) {}

  @Get()
  getHello(): string {
    return this.meuErpSistemaService.getHello();
  }
}
