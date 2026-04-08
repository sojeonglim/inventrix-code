import prisma from '../../shared/database/connection.js';
import { PaginatedResult } from '../../shared/types/common.js';
import { Product } from '@prisma/client';

export class CatalogRepository {
  async findAll(filters: { search?: string; page: number; pageSize: number }): Promise<PaginatedResult<Product>> {
    const where = filters.search ? { OR: [{ name: { contains: filters.search, mode: 'insensitive' as const } }, { description: { contains: filters.search, mode: 'insensitive' as const } }] } : {};
    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    return { data, total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) };
  }

  async findById(id: string) { return prisma.product.findUnique({ where: { id } }); }
  async create(data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) { return prisma.product.create({ data }); }
  async update(id: string, data: Partial<{ name: string; description: string; price: number; stock: number; imageUrl: string }>) { return prisma.product.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.product.delete({ where: { id } }); }
}
