import { Role } from '@prisma/client';

export { Role } from '@prisma/client';
export { OrderStatus, RefundStatus, ReservationStatus, NotificationType } from '@prisma/client';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
