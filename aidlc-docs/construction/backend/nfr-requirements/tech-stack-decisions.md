# Backend Tech Stack Decisions

---

## 확정된 기술 스택

| 레이어 | 기술 | 버전 | 근거 |
|---|---|---|---|
| Runtime | Node.js | 22 LTS | 기존 유지, 프로젝트 요구사항 |
| Language | TypeScript | 5.x (strict) | 기존 유지, strict mode 활성화 |
| Framework | Express | 4.x | 기존 유지, 구조 개선 |
| Database | PostgreSQL | 16+ | Research P0 — 동시성, 프로덕션급 |
| ORM | Prisma | latest | 타입 안전, 마이그레이션, PostgreSQL 최적화 |
| Validation | Zod | latest | TypeScript 네이티브, Express 미들웨어 통합 |
| Auth | jsonwebtoken | 9.x | 기존 유지 |
| Password | bcrypt | 5.x | 기존 유지, rounds: 12 |
| Logging | Pino + pino-http | latest | 고성능 JSON 구조화 로깅 |
| Security Headers | helmet | latest | Express 보안 헤더 미들웨어 |
| Rate Limiting | express-rate-limit | latest | API 요청 제한 |
| CORS | cors | 2.x | 기존 유지, origin 제한 설정 |
| AI Image | @aws-sdk/client-bedrock-runtime | 3.x | 기존 유지 |
| Email | @aws-sdk/client-ses | 3.x | 신규 — 이메일 알림 |
| UUID | cuid2 (@paralleldrive/cuid2) | latest | Prisma cuid() 기본 제공 |
| Dev Server | tsx | 4.x | 기존 유지 |
| Linting | eslint + @typescript-eslint | latest | 코드 품질 |
| Formatting | prettier | latest | 코드 포맷팅 |
| Testing | vitest | latest | 단위 테스트 |

## 신규 의존성 요약

### dependencies (production)
```
@prisma/client
zod
pino
pino-http
helmet
express-rate-limit
@aws-sdk/client-ses
```

### devDependencies
```
prisma
eslint
@typescript-eslint/eslint-plugin
@typescript-eslint/parser
prettier
vitest
@types/express
@types/bcrypt
@types/jsonwebtoken
@types/cors
@types/node
typescript
tsx
```

## 제거 대상
```
better-sqlite3          → Prisma + PostgreSQL로 대체
@types/better-sqlite3   → 제거
```
