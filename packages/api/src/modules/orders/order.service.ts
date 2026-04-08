import { OrderRepository } from './order.repository.js';
import { ReservationService } from '../inventory/reservation.service.js';
import { CatalogRepository } from '../catalog/catalog.repository.js';
import { canTransition } from './order-state-machine.js';
import { eventBus } from '../../shared/event-bus/event-bus.js';
import { OrderCreatedEvent, OrderStatusChangedEvent, OrderCancelledEvent } from '../../shared/event-bus/events.js';
import { Role, OrderStatus } from '@prisma/client';

export class OrderService {
  constructor(private orderRepo: OrderRepository, private reservationService: ReservationService, private catalogRepo: CatalogRepository) {}

  async createOrder(userId: string, items: { productId: string; quantity: number }[]) {
    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      const product = await this.catalogRepo.findById(item.productId);
      if (!product) throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 404 });
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
      subtotal += product.price * item.quantity;
    }
    const gst = Math.round(subtotal * 0.1 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    await this.reservationService.createReservation('temp', items);
    // Re-create with actual order — simplified: create order then reservation
    const order = await this.orderRepo.create({ userId, subtotal, gst, total, items: orderItems });
    // Update reservation to point to real order
    await this.reservationService.createReservation(order.id, items);

    eventBus.emit<OrderCreatedEvent>({ type: 'OrderCreated', orderId: order.id, userId, total, timestamp: new Date().toISOString() });
    return order;
  }

  async getOrderById(id: string, userId: string, role: Role) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    if (role === 'customer' && order.userId !== userId) throw Object.assign(new Error('Access denied'), { status: 403 });
    return order;
  }

  async getOrders(userId: string, role: Role, filters: { status?: OrderStatus; page: number; pageSize: number }) {
    const queryFilters = role === 'customer' ? { ...filters, userId } : filters;
    return this.orderRepo.findAll(queryFilters);
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus, role: Role, userId: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    if (!canTransition(order.status, newStatus, role)) {
      throw Object.assign(new Error(`Cannot transition from ${order.status} to ${newStatus}`), { status: 409, code: 'INVALID_STATUS_TRANSITION' });
    }

    if (newStatus === 'processing') await this.reservationService.confirmReservation(id);
    if (newStatus === 'cancelled') {
      await this.reservationService.releaseReservation(id);
      const refund = await this.orderRepo.createRefund(id, order.total);
      await this.orderRepo.updateStatus(id, newStatus);
      eventBus.emit<OrderCancelledEvent>({ type: 'OrderCancelled', orderId: id, userId: order.userId, total: order.total, refundId: refund.id, timestamp: new Date().toISOString() });
      return { ...order, status: newStatus };
    }

    await this.orderRepo.updateStatus(id, newStatus);
    eventBus.emit<OrderStatusChangedEvent>({ type: 'OrderStatusChanged', orderId: id, userId: order.userId, oldStatus: order.status, newStatus, timestamp: new Date().toISOString() });
    return { ...order, status: newStatus };
  }

  async cancelOrder(id: string, userId: string, role: Role) {
    return this.updateOrderStatus(id, 'cancelled', role, userId);
  }
}
