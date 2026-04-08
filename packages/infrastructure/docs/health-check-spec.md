# Health Check Endpoint Specification

Backend Unit에서 구현할 health check 엔드포인트 스펙입니다.

## Endpoint

```
GET /api/health
```

## Authentication
- 인증 불필요 (public endpoint)

## Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-04-08T15:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": "ok"
  }
}
```

## Response (503 Service Unavailable)

```json
{
  "status": "error",
  "timestamp": "2026-04-08T15:00:00.000Z",
  "checks": {
    "database": "error"
  }
}
```

## Checks
- `database`: PostgreSQL 연결 확인 (`SELECT 1`)

## Usage
- CI/CD 파이프라인에서 배포 후 health check로 사용
- 모니터링 시스템에서 주기적 polling
- Nginx upstream health check (선택)
