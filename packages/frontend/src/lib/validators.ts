import { z } from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '최소 8자').regex(passwordRegex, '대소문자, 숫자, 특수문자 포함'),
  name: z.string().min(1, '이름을 입력하세요').max(100),
})

export const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력하세요').max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive('가격은 양수여야 합니다'),
  stock: z.coerce.number().int().min(0, '재고는 0 이상'),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export const stockSchema = z.object({
  stock: z.coerce.number().int().min(0, '재고는 0 이상'),
})

export const roleSchema = z.object({
  role: z.enum(['admin', 'staff', 'customer']),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ProductForm = z.infer<typeof productSchema>
export type StockForm = z.infer<typeof stockSchema>
export type RoleForm = z.infer<typeof roleSchema>
