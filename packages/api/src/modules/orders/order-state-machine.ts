import { OrderStatus, Role } from '@prisma/client';

type Transition = { to: OrderStatus; roles: Role[] };
const transitions: Record<string, Transition[]> = {
  pending: [{ to: 'processing', roles: ['admin'] }, { to: 'cancelled', roles: ['admin', 'customer'] }],
  processing: [{ to: 'shipped', roles: ['admin', 'staff'] }, { to: 'cancelled', roles: ['admin'] }],
  shipped: [{ to: 'delivered', roles: ['admin', 'staff'] }],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus, role: Role): boolean {
  return transitions[from]?.some(t => t.to === to && t.roles.includes(role)) ?? false;
}

export function isTerminal(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
