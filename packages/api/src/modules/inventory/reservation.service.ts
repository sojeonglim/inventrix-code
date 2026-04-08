import prisma from '../../shared/database/connection.js';
import { InventoryRepository } from './inventory.repository.js';
import { eventBus } from '../../shared/event-bus/event-bus.js';
import { StockLowEvent, StockDepletedEvent, ReservationExpiredEvent } from '../../shared/event-bus/events.js';
import { logger } from '../../shared/logger/logger.js';

const LOW_STOCK = parseInt(process.env.LOW_STOCK_THRESHOLD || '10');
const RESERVATION_TIMEOUT = parseInt(process.env.RESERVATION_TIMEOUT_MS || '900000');

export class ReservationService {
  constructor(private inventoryRepo: InventoryRepository) {}

  async createReservation(orderId: string, items: { productId: string; quantity: number }[]) {
    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
        const reserved = await tx.reservationItem.aggregate({ where: { productId: item.productId, reservation: { status: 'active' } }, _sum: { quantity: true } });
        const available = product.stock - (reserved._sum.quantity || 0);
        if (available < item.quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 400, code: 'INSUFFICIENT_STOCK' });
        }
      }
      const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT);
      return this.inventoryRepo.createReservation(orderId, items, expiresAt, tx);
    });
  }

  async confirmReservation(orderId: string) {
    const reservation = await this.inventoryRepo.findReservationByOrderId(orderId);
    if (!reservation || reservation.status !== 'active') throw new Error('No active reservation');
    await prisma.$transaction(async (tx) => {
      for (const item of reservation.items) {
        await this.inventoryRepo.incrementStock(item.productId, -item.quantity, tx);
      }
      await this.inventoryRepo.updateReservationStatus(reservation.id, 'confirmed', tx);
    });
    await this.checkStockAlerts(reservation.items.map(i => i.productId));
  }

  async releaseReservation(orderId: string) {
    const reservation = await this.inventoryRepo.findReservationByOrderId(orderId);
    if (!reservation) return;
    await prisma.$transaction(async (tx) => {
      if (reservation.status === 'confirmed') {
        for (const item of reservation.items) {
          await this.inventoryRepo.incrementStock(item.productId, item.quantity, tx);
        }
      }
      await this.inventoryRepo.updateReservationStatus(reservation.id, 'released', tx);
    });
  }

  async expireReservations(): Promise<number> {
    const expired = await this.inventoryRepo.findExpiredReservations();
    for (const res of expired) {
      try {
        await this.inventoryRepo.updateReservationStatus(res.id, 'expired');
        await prisma.order.update({ where: { id: res.orderId }, data: { status: 'cancelled' } });
        await prisma.refund.create({ data: { orderId: res.orderId, amount: res.order.total, status: 'pending_refund' } });
        eventBus.emit<ReservationExpiredEvent>({ type: 'ReservationExpired', orderId: res.orderId, userId: res.order.userId, reservationId: res.id, timestamp: new Date().toISOString() });
      } catch (err) { logger.error({ err, reservationId: res.id }, 'Failed to expire reservation'); }
    }
    return expired.length;
  }

  private async checkStockAlerts(productIds: string[]) {
    for (const pid of productIds) {
      const product = await this.inventoryRepo.findByProductId(pid);
      if (!product) continue;
      if (product.stock === 0) {
        eventBus.emit<StockDepletedEvent>({ type: 'StockDepleted', productId: pid, productName: product.name, timestamp: new Date().toISOString() });
      } else if (product.stock < LOW_STOCK) {
        eventBus.emit<StockLowEvent>({ type: 'StockLow', productId: pid, productName: product.name, currentStock: product.stock, timestamp: new Date().toISOString() });
      }
    }
  }
}
