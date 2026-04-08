import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).regex(passwordRegex, 'Must include uppercase, lowercase, number, and special character'),
  name: z.string().trim().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'staff', 'customer']),
});
