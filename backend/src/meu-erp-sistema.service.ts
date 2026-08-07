import { Injectable } from '@nestjs/common';

@Injectable()
export class MeuErpSistemaService {
  getHello(): string {
    return 'Hello World!';
  }
}
