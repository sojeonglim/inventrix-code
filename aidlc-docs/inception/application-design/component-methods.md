# Component Methods

> 비즈니스 규칙 상세는 Functional Design (CONSTRUCTION) 단계에서 정의합니다.
> 여기서는 method signatures와 고수준 목적만 정의합니다.

---

## Catalog Module

### CatalogService
```typescript
getProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>>
getProductById(id: string): Promise<Product>
createProduct(data: CreateProductInput): Promise<Product>          // 관리자
updateProduct(id: string, data: UpdateProductInput): Promise<Product>  // 관리자
deleteProduct(id: string): Promise<void>                          // 관리자
generateImage(productId: string, prompt: string): Promise<string> // 관리자, Bedrock 연동
```

### CatalogRepository
```typescript
findAll(filters?: ProductFilters): Promise<PaginatedResult<Product>>
findById(id: string): Promise<Product | null>
create(data: ProductEntity): Promise<Product>
update(id: string, data: Partial<ProductEntity>): Promise<Product>
delete(id: string): Promise<void>
updateStock(id: string, quantity: number): Promise<void>
```

---

## Orders Module

### OrderService
```typescript
createOrder(userId: string, items: OrderItemInput[]): Promise<Order>  // 재고 예약 연동
getOrderById(id: string, userId: string, role: Role): Promise<Order>  // IDOR 방지
getOrders(userId: string, role: Role, filters?: OrderFilters): Promise<PaginatedResult<Order>>
updateOrderStatus(id: string, newStatus: OrderStatus, role: Role): Promise<Order>  // state machine
cancelOrder(id: string, userId: string, role: Role): Promise<Order>   // 역할별 취소 규칙
getRefunds(filters?: RefundFilters): Promise<PaginatedResult<Refund>> // 관리자
updateRefundStatus(id: string, status: RefundStatus): Promise<Refund> // 관리자
```

### OrderRepository
```typescript
findById(id: string): Promise<Order | null>
findByUserId(userId: string, filters?: OrderFilters): Promise<PaginatedResult<Order>>
findAll(filters?: OrderFilters): Promise<PaginatedResult<Order>>
create(data: OrderEntity): Promise<Order>
updateStatus(id: string, status: OrderStatus): Promise<Order>
createRefund(data: RefundEntity): Promise<Refund>
findRefunds(filters?: RefundFilters): Promise<PaginatedResult<Refund>>
updateRefund(id: string, data: Partial<RefundEntity>): Promise<Refund>
```

---

## Inventory Module

### InventoryService
```typescript
getStock(productId: string): Promise<StockInfo>           // 가용 재고 = 실제 - 예약
getStockList(filters?: StockFilters): Promise<PaginatedResult<StockInfo>>
updateStock(productId: string, quantity: number): Promise<StockInfo>  // 관리자/직원
```

### ReservationService
```typescript
createReservation(orderId: string, items: ReservationItem[]): Promise<Reservation>  // 원자적
confirmReservation(orderId: string): Promise<void>    // 예약 → 실제 차감
releaseReservation(orderId: string): Promise<void>    // 예약 해제 + 재고 복원
expireReservations(): Promise<number>                 // 타임아웃 일괄 해제 (스케줄러)
```

### InventoryRepository
```typescript
findByProductId(productId: string): Promise<StockEntity | null>
findAll(filters?: StockFilters): Promise<PaginatedResult<StockEntity>>
updateQuantity(productId: string, delta: number): Promise<StockEntity>  // 원자적 증감
createReservation(data: ReservationEntity): Promise<Reservation>
findReservationByOrderId(orderId: string): Promise<Reservation | null>
deleteReservation(orderId: string): Promise<void>
findExpiredReservations(cutoff: Date): Promise<Reservation[]>
```

---

## Users Module

### AuthService
```typescript
register(data: RegisterInput): Promise<AuthResult>    // 비밀번호 정책 적용
login(data: LoginInput): Promise<AuthResult>           // 브루트포스 방지
refreshToken(token: string): Promise<AuthResult>
logout(userId: string): Promise<void>
```

### UserService
```typescript
getUserById(id: string): Promise<User>
getUsers(): Promise<User[]>                            // 관리자
updateUserRole(id: string, role: Role): Promise<User>  // 관리자, 감사 로그
```

### UserRepository
```typescript
findById(id: string): Promise<User | null>
findByEmail(email: string): Promise<User | null>
findAll(): Promise<User[]>
create(data: UserEntity): Promise<User>
updateRole(id: string, role: Role): Promise<User>
recordLoginAttempt(email: string, success: boolean): Promise<void>
getLoginAttempts(email: string, since: Date): Promise<number>
```

---

## Analytics Module

### AnalyticsService
```typescript
getDashboardKPIs(): Promise<DashboardKPIs>
getRevenueStats(period: DateRange): Promise<RevenueStats>
getOrderStats(period: DateRange): Promise<OrderStats>
getInventoryStats(): Promise<InventoryStats>
```

### AnalyticsRepository
```typescript
aggregateRevenue(period: DateRange): Promise<RevenueStats>
aggregateOrders(period: DateRange): Promise<OrderStats>
aggregateInventory(): Promise<InventoryStats>
getTopProducts(limit: number): Promise<ProductStat[]>
```

---

## Notifications Module

### NotificationService
```typescript
createNotification(data: CreateNotificationInput): Promise<Notification>
getNotifications(userId: string): Promise<Notification[]>
markAsRead(id: string, userId: string): Promise<void>
getUnreadCount(userId: string): Promise<number>
```

### SSEManager
```typescript
addConnection(userId: string, res: Response): void
removeConnection(userId: string): void
sendToUser(userId: string, event: SSEEvent): void
sendToRole(role: Role, event: SSEEvent): void
broadcast(event: SSEEvent): void
```

### EmailService
```typescript
sendOrderStatusEmail(userId: string, orderId: string, status: OrderStatus): Promise<void>
sendLowStockAlert(productId: string, currentStock: number): Promise<void>
```

### NotificationRepository
```typescript
create(data: NotificationEntity): Promise<Notification>
findByUserId(userId: string): Promise<Notification[]>
markAsRead(id: string): Promise<void>
countUnread(userId: string): Promise<number>
```

---

## Shared Infrastructure

### EventBus
```typescript
emit<T extends DomainEvent>(event: T): void
on<T extends DomainEvent>(eventType: EventType, handler: (event: T) => Promise<void>): void
off(eventType: EventType, handler: Function): void
```

### RBAC Middleware
```typescript
authenticate(req: Request, res: Response, next: NextFunction): void       // JWT 검증
authorize(...roles: Role[]): RequestHandler                                // 역할 검사
ownerOrRole(paramName: string, ...roles: Role[]): RequestHandler           // IDOR 방지
```

### Validation Middleware
```typescript
validate(schema: ZodSchema): RequestHandler    // 요청 body/params/query 검증
```
