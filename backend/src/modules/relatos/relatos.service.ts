import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRelatoDto } from './dto/create-relato.dto';

@Injectable()
export class RelatosService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.relato.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.relato.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAllByUser(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.relato.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.relato.count({ where: { userId } }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    return this.prisma.relato.findUnique({ where: { id } });
  }

  async create(data: CreateRelatoDto, userId: number) {
    return this.prisma.relato.create({
      data: {
        ...data,
        dataOcorrido: new Date(data.dataOcorrido),
        userId,
      },
    });
  }

  async update(id: number, data: Partial<CreateRelatoDto>) {
    return this.prisma.relato.update({
      where: { id },
      data: {
        ...data,
        ...(data.dataOcorrido && { dataOcorrido: new Date(data.dataOcorrido) }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.relato.delete({ where: { id } });
  }

  async stats() {
    const [total, relatos] = await Promise.all([
      this.prisma.relato.count(),
      this.prisma.relato.findMany({
        select: { status: true, tipoViolacao: true },
      }),
    ]);
    const abertos = relatos.filter(
      (r) => r.status === 'novo' || r.status === 'em_analise',
    ).length;
    const encaminhados = relatos.filter(
      (r) => r.status === 'encaminhado',
    ).length;
    const resolvidos = relatos.filter((r) => r.status === 'resolvido').length;
    const tiposUnicos = new Set(relatos.map((r) => r.tipoViolacao)).size;

    return { total, abertos, encaminhados, resolvidos, tiposUnicos };
  }

  async findPendentes() {
    return this.prisma.relato.findMany({
      where: { status: { in: ['novo', 'em_analise'] } },
      orderBy: { dataOcorrido: 'asc' },
    });
  }
}
