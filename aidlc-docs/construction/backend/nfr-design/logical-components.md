# Backend NFR Design — Logical Components

---

## 인프라 컴포넌트 매핑

| 논리 컴포넌트 | 구현 | 향후 확장 |
|---|---|---|
| Database | PostgreSQL (Prisma) | Read replica |
| Event Bus | In-memory EventEmitter | Redis Pub/Sub |
| SSE Manager | In-memory Map | Redis adapter |
| Email Service | AWS SES SDK | — |
| Scheduler | setInterval (60초) | Bull/BullMQ |
| Rate Limiter | express-rate-limit (메모리) | Redis store |
| Session/Token | DB refresh_tokens 테이블 | Redis |

## DB 인덱스

```prisma
model Order {
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
model Reservation {
  @@index([status, expiresAt])
}
model Notification {
  @@index([userId, read])
}
model AuditLog {
  @@index([userId])
  @@index([resourceType, resourceId])
}
```

## 환경 변수 (Backend 사용)

| 변수 | 용도 |
|---|---|
| DATABASE_URL | PostgreSQL 연결 (?connection_limit=20&sslmode=require) |
| JWT_SECRET | Access Token 서명 |
| JWT_REFRESH_SECRET | Refresh Token 서명 |
| JWT_EXPIRES_IN | 15m |
| JWT_REFRESH_EXPIRES_IN | 7d |
| PORT | 3000 |
| NODE_ENV | production |
| CORS_ORIGIN | 허용 origin |
| RATE_LIMIT_WINDOW_MS | 900000 |
| RATE_LIMIT_MAX | 100 |
| AWS_REGION | ap-northeast-2 |
| SES_FROM_EMAIL | 발신 이메일 |
| RESERVATION_TIMEOUT_MS | 900000 |
| LOW_STOCK_THRESHOLD | 10 |
| LOG_LEVEL | info |
