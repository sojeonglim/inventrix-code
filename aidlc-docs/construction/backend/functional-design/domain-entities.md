# Backend Functional Design — Domain Entities

## 기술 결정 요약
- **DB**: PostgreSQL + Prisma ORM
- **API**: Express REST (구조 개선 + Zod 검증)
- **JWT**: Access Token 15분 + Refresh Token 7일
- **로깅**: Pino (구조화 JSON)

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  staff
  customer
}

enum OrderStatus {
  pending
  processing
  shipped
  delivered
  cancelled
}

enum RefundStatus {
  pending_refund
  refunded
}

enum ReservationStatus {
  active
  confirmed
  expired
  released
}

enum NotificationType {
  order_created
  order_status_changed
  order_cancelled
  stock_low
  stock_depleted
  role_changed
  security_alert
}

model User {
  id             String         @id @default(cuid())
  email          String         @unique
  password       String
  name           String
  role           Role           @default(customer)
  lockedUntil    DateTime?
  loginAttempts  Int            @default(0)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  orders         Order[]
  notifications  Notification[]
  refreshTokens  RefreshToken[]
  auditLogs      AuditLog[]     @relation("actor")

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  stock       Int         @default(0)
  imageUrl    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
  reservations ReservationItem[]

  @@map("products")
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  subtotal  Float
  gst       Float
  total     Float
  status    OrderStatus @default(pending)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  refund    Refund?
  reservation Reservation?

  @@map("orders")
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  order       Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product @relation(fields: [productId], references: [id])
  quantity    Int
  price       Float

  @@map("order_items")
}

model Reservation {
  id        String            @id @default(cuid())
  orderId   String            @unique
  order     Order             @relation(fields: [orderId], references: [id])
  status    ReservationStatus @default(active)
  expiresAt DateTime
  createdAt DateTime          @default(now())
  items     ReservationItem[]

  @@map("reservations")
}

model ReservationItem {
  id            String      @id @default(cuid())
  reservationId String
  reservation   Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  productId     String
  product       Product     @relation(fields: [productId], references: [id])
  quantity      Int

  @@map("reservation_items")
}

model Refund {
  id          String       @id @default(cuid())
  orderId     String       @unique
  order       Order        @relation(fields: [orderId], references: [id])
  amount      Float
  status      RefundStatus @default(pending_refund)
  processedBy String?
  processedAt DateTime?
  createdAt   DateTime     @default(now())

  @@map("refunds")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@map("notifications")
}

model AuditLog {
  id            String   @id @default(cuid())
  userId        String
  actor         User     @relation("actor", fields: [userId], references: [id])
  action        String
  resourceType  String
  resourceId    String?
  previousValue Json?
  newValue      Json?
  ipAddress     String?
  userAgent     String?
  outcome       String   @default("success")
  createdAt     DateTime @default(now())

  @@map("audit_logs")
}
```

## Entity 관계 요약

```
User 1──* Order 1──* OrderItem *──1 Product
User 1──* RefreshToken
User 1──* Notification
User 1──* AuditLog
Order 1──0..1 Reservation 1──* ReservationItem *──1 Product
Order 1──0..1 Refund
```

## ID 전략
- 모든 entity에 `cuid()` 사용 (기존 INTEGER AUTOINCREMENT에서 마이그레이션)
- 외부 노출 시 예측 불가능한 ID로 IDOR 방지
