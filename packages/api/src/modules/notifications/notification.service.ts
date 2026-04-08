import { NotificationRepository } from './notification.repository.js';
import { sseManager } from './sse-manager.js';
import { eventBus } from '../../shared/event-bus/event-bus.js';
import { OrderCreatedEvent, OrderStatusChangedEvent, OrderCancelledEvent, StockLowEvent, StockDepletedEvent, RoleChangedEvent, LoginFailedEvent } from '../../shared/event-bus/events.js';

export class NotificationService {
  constructor(private repo: NotificationRepository) { this.registerHandlers(); }

  async getNotifications(userId: string) { return this.repo.findByUserId(userId); }
  async markAsRead(id: string, userId: string) { return this.repo.markAsRead(id); }
  async getUnreadCount(userId: string) { return this.repo.countUnread(userId); }

  private registerHandlers() {
    eventBus.on<OrderCreatedEvent>('OrderCreated', async (e) => {
      const n = await this.repo.create({ userId: e.userId, type: 'order_created', title: '주문 생성', message: `주문이 생성되었습니다. (${e.total.toFixed(2)}원)`, data: { orderId: e.orderId } });
      sseManager.sendToUser(e.userId, { type: 'notification', payload: n });
    });

    eventBus.on<OrderStatusChangedEvent>('OrderStatusChanged', async (e) => {
      const n = await this.repo.create({ userId: e.userId, type: 'order_status_changed', title: '주문 상태 변경', message: `주문 상태: ${e.oldStatus} → ${e.newStatus}`, data: { orderId: e.orderId } });
      sseManager.sendToUser(e.userId, { type: 'notification', payload: n });
      sseManager.sendToUser(e.userId, { type: 'order_status_changed', payload: { orderId: e.orderId, oldStatus: e.oldStatus, newStatus: e.newStatus } });
    });

    eventBus.on<OrderCancelledEvent>('OrderCancelled', async (e) => {
      const n = await this.repo.create({ userId: e.userId, type: 'order_cancelled', title: '주문 취소', message: `주문이 취소되었습니다. 환불이 진행됩니다.`, data: { orderId: e.orderId, refundId: e.refundId } });
      sseManager.sendToUser(e.userId, { type: 'notification', payload: n });
    });

    eventBus.on<StockLowEvent>('StockLow', async (e) => {
      const n = await this.repo.create({ userId: 'system', type: 'stock_low', title: '재고 부족', message: `${e.productName} 재고: ${e.currentStock}개`, data: { productId: e.productId } });
      sseManager.sendToRole('admin', { type: 'stock_alert', payload: { productId: e.productId, productName: e.productName, currentStock: e.currentStock, type: 'low' } });
    });

    eventBus.on<StockDepletedEvent>('StockDepleted', async (e) => {
      await this.repo.create({ userId: 'system', type: 'stock_depleted', title: '품절', message: `${e.productName} 품절`, data: { productId: e.productId } });
      sseManager.sendToRole('admin', { type: 'stock_alert', payload: { productId: e.productId, productName: e.productName, currentStock: 0, type: 'depleted' } });
    });

    eventBus.on<RoleChangedEvent>('RoleChanged', async (e) => {
      await this.repo.create({ userId: e.userId, type: 'role_changed', title: '역할 변경', message: `역할이 ${e.oldRole} → ${e.newRole}로 변경되었습니다.`, data: { oldRole: e.oldRole, newRole: e.newRole } });
      sseManager.sendToUser(e.userId, { type: 'notification', payload: { type: 'role_changed' } });
    });

    eventBus.on<LoginFailedEvent>('LoginFailed', async (e) => {
      if (e.locked) {
        await this.repo.create({ userId: 'system', type: 'security_alert', title: '보안 알림', message: `${e.email} 계정이 ${e.attempts}회 로그인 실패로 잠겼습니다.`, data: { email: e.email } });
        sseManager.sendToRole('admin', { type: 'notification', payload: { type: 'security_alert', email: e.email } });
      }
    });
  }
}
