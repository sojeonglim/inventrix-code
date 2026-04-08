import { OrderStatus, RefundStatus, Role } from '@prisma/client';

export type EventType =
  | 'OrderCreated'
  | 'OrderStatusChanged'
  | 'OrderCancelled'
  | 'StockLow'
  | 'StockDepleted'
  | 'ReservationExpired'
  | 'RoleChanged'
  | 'LoginFailed';

export interface DomainEvent {
  type: EventType;
  timestamp: string;
}

export interface OrderCreatedEvent extends DomainEvent {
  type: 'OrderCreated';
  orderId: string;
  userId: string;
  total: number;
}

export interface OrderStatusChangedEvent extends DomainEvent {
  type: 'OrderStatusChanged';
  orderId: string;
  userId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
}

export interface OrderCancelledEvent extends DomainEvent {
  type: 'OrderCancelled';
  orderId: string;
  userId: string;
  total: number;
  refundId: string;
}

export interface StockLowEvent extends DomainEvent {
  type: 'StockLow';
  productId: string;
  productName: string;
  currentStock: number;
}

export interface StockDepletedEvent extends DomainEvent {
  type: 'StockDepleted';
  productId: string;
  productName: string;
}

export interface ReservationExpiredEvent extends DomainEvent {
  type: 'ReservationExpired';
  orderId: string;
  userId: string;
  reservationId: string;
}

export interface RoleChangedEvent extends DomainEvent {
  type: 'RoleChanged';
  userId: string;
  oldRole: Role;
  newRole: Role;
  changedBy: string;
}

export interface LoginFailedEvent extends DomainEvent {
  type: 'LoginFailed';
  email: string;
  attempts: number;
  locked: boolean;
}
