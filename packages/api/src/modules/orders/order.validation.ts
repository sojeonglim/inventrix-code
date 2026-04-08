import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive().max(999) })).min(1).max(50),
});
export const updateStatusSchema = z.object({ status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']) });
export const orderFiltersSchema = z.object({ status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(), page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
