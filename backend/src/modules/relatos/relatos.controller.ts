import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { RelatosService } from './relatos.service';
import { CreateRelatoDto } from './dto/create-relato.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('relatos')
@UseGuards(JwtAuthGuard)
export class RelatosController {
  constructor(private readonly relatosService: RelatosService) {}

  @Get('stats')
  stats() {
    return this.relatosService.stats();
  }

  @Get('pendentes')
  findPendentes() {
    return this.relatosService.findPendentes();
  }

  // Relatos do próprio usuário logado — usado na tela "amigável" (/inicio)
  @Get('meus')
  findMeus(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.relatosService.findAllByUser(
      req.user.userId,
      Number(page),
      Number(limit),
    );
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.relatosService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.relatosService.findOne(id);
  }

  @Post()
  create(@Body() createRelatoDto: CreateRelatoDto, @Req() req: any) {
    return this.relatosService.create(createRelatoDto, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRelatoDto: Partial<CreateRelatoDto>,
  ) {
    return this.relatosService.update(id, updateRelatoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.relatosService.remove(id);
  }
}
