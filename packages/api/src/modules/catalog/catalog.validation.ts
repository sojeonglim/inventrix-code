import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  price: z.number().positive().min(0.01),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const generateImageSchema = z.object({
  productName: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
