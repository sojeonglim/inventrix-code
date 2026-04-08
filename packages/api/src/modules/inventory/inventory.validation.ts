import { z } from 'zod';

export const updateStockSchema = z.object({ stock: z.number().int().nonnegative() });
export const stockFiltersSchema = z.object({ lowStock: z.coerce.boolean().optional(), page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
