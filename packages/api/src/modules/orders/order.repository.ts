import prisma from '../../shared/database/connection.js';
import { OrderStatus } from '@prisma/client';

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { items: { include: { product: { select: { name: true } } } }, user: { select: { name: true, email: true } }, refund: true } });
  }

  async findAll(filters: { userId?: string; status?: OrderStatus; page: number; pageSize: number }) {
    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    const [data, total] = await Promise.all([
      prisma.order.findMany({ where, include: { items: { include: { product: { select: { name: true } } } }, user: { select: { name: true, email: true } } }, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    return { data, total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) };
  }

  async create(data: { userId: string; subtotal: number; gst: number; total: number; items: { productId: string; quantity: number; price: number }[] }) {
    return prisma.order.create({ data: { userId: data.userId, subtotal: data.subtotal, gst: data.gst, total: data.total, items: { create: data.items } }, include: { items: true } });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status } });
  }

  async createRefund(orderId: string, amount: number) {
    return prisma.refund.create({ data: { orderId, amount } });
  }
}
