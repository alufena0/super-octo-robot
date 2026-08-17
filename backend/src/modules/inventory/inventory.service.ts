import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: Partial<CreateProductDto>) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  async stats() {
    const [total, products] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        select: {
          price: true,
          cost: true,
          quantity: true,
          minStock: true,
          category: true,
        },
      }),
    ]);
    const stockValue = products.reduce(
      (acc, p) => acc + p.cost * p.quantity,
      0,
    );
    const lowStock = products.filter((p) => p.quantity < p.minStock).length;
    const avgMargin =
      total === 0
        ? 0
        : (products.reduce(
            (acc, p) => acc + (p.price > 0 ? (p.price - p.cost) / p.price : 0),
            0,
          ) /
            total) *
          100;
    const categories = new Set(products.map((p) => p.category).filter(Boolean))
      .size;
    return { total, stockValue, lowStock, avgMargin, categories };
  }
}
