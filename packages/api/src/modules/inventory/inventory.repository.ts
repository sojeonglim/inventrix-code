import prisma from '../../shared/database/connection.js';
import { Prisma } from '@prisma/client';

export class InventoryRepository {
  async findByProductId(productId: string) { return prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true, stock: true } }); }

  async findAll(filters: { lowStock?: boolean; page: number; pageSize: number }) {
    const where = filters.lowStock ? { stock: { lt: parseInt(process.env.LOW_STOCK_THRESHOLD || '10') } } : {};
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, select: { id: true, name: true, stock: true, price: true }, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize, orderBy: { stock: 'asc' } }),
      prisma.product.count({ where }),
    ]);
    // Calculate reserved stock per product
    const productIds = items.map(i => i.id);
    const reservations = await prisma.reservationItem.groupBy({ by: ['productId'], where: { productId: { in: productIds }, reservation: { status: 'active' } }, _sum: { quantity: true } });
    const reservedMap = new Map(reservations.map(r => [r.productId, r._sum.quantity || 0]));
    const data = items.map(i => ({ productId: i.id, productName: i.name, stock: i.stock, reservedStock: reservedMap.get(i.id) || 0, availableStock: i.stock - (reservedMap.get(i.id) || 0) }));
    return { data, total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) };
  }

  async updateStock(productId: string, stock: number, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.update({ where: { id: productId }, data: { stock } });
  }

  async incrementStock(productId: string, delta: number, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.product.update({ where: { id: productId }, data: { stock: { increment: delta } } });
  }

  async createReservation(orderId: string, items: { productId: string; quantity: number }[], expiresAt: Date, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.reservation.create({ data: { orderId, expiresAt, items: { create: items } }, include: { items: true } });
  }

  async findReservationByOrderId(orderId: string) { return prisma.reservation.findUnique({ where: { orderId }, include: { items: true } }); }

  async updateReservationStatus(id: string, status: 'confirmed' | 'expired' | 'released', tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.reservation.update({ where: { id }, data: { status } });
  }

  async findExpiredReservations() {
    return prisma.reservation.findMany({ where: { status: 'active', expiresAt: { lt: new Date() } }, include: { items: true, order: true } });
  }
}
