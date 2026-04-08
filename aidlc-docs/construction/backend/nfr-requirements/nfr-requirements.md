# Backend NFR Requirements

---

## 1. 성능 (Performance)

| 메트릭 | 목표 | 근거 |
|---|---|---|
| API 응답 시간 (CRUD) | p95 < 500ms | NFR-01 |
| 대시보드 집계 쿼리 | < 3초 | NFR-01 |
| 주문 생성 (트랜잭션) | p95 < 1초 | 재고 예약 + 다중 INSERT 포함 |
| SSE 이벤트 전달 지연 | < 500ms | 실시간 알림 UX |
| DB 커넥션 풀 | 최대 20 연결 | 동시 500명 기준 |

### 적용 방안
- Prisma 커넥션 풀링 (`connection_limit` 설정)
- 대시보드 집계: 인덱스 최적화 (orders.status, orders.created_at, products.stock)
- 페이지네이션 필수 (기본 20, 최대 100)

---

## 2. 확장성 (Scalability)

| 항목 | 현재 목표 | 확장 목표 |
|---|---|---|
| 동시 사용자 | ~500명 | 1000명+ |
| 상품 수 | ~1000 | 10,000+ |
| 주문/일 | ~500 | 5,000+ |

### 적용 방안
- Stateless 서버 설계 (JWT, 세션 서버 저장 없음)
- 모듈러 모놀리스 → 향후 마이크로서비스 추출 가능
- EventBus: In-memory → 향후 Redis Pub/Sub 전환 가능한 인터페이스
- SSE: 사용자별 Map → 향후 Redis adapter 전환 가능

---

## 3. 가용성 (Availability)

| 항목 | 요구사항 |
|---|---|
| DB 마이그레이션 | 데이터 무결성 보장, 롤백 가능 |
| 배포 중단 | 최소화 (graceful shutdown) |
| 에러 복구 | 글로벌 에러 핸들러, 프로세스 크래시 방지 |

### 적용 방안
- Prisma migrate로 버전 관리된 마이그레이션
- Express graceful shutdown (SIGTERM 핸들링, SSE 연결 정리)
- 예약 타임아웃 스케줄러: 서버 재시작 시 자동 복구 (DB 기반 상태)

---

## 4. 보안 (Security) — SECURITY-01 ~ SECURITY-15

### SECURITY-01: 암호화
- DB 연결: TLS 필수 (`DATABASE_URL`에 `sslmode=require`)
- 비밀번호: bcrypt (salt rounds: 12)

### SECURITY-03: 애플리케이션 로깅
- Pino (JSON 구조화 로깅)
- 필수 필드: timestamp, requestId (uuid), level, message
- PII 마스킹: password, token 필드 로그 제외

### SECURITY-04: HTTP 보안 헤더
- `helmet()` 미들웨어 적용
- CSP: `default-src 'self'`
- HSTS: `max-age=31536000; includeSubDomains`
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`

### SECURITY-05: 입력 검증
- 모든 API endpoint에 Zod 스키마 검증 미들웨어
- 요청 body 크기 제한: 1MB (`express.json({ limit: '1mb' })`)
- SQL injection 방지: Prisma parameterized queries (기본 제공)

### SECURITY-06: 최소 권한
- RBAC 미들웨어: `authorize(...roles)` per-endpoint
- DB 사용자: 최소 권한 (SELECT/INSERT/UPDATE/DELETE만, DDL 제외)

### SECURITY-08: 애플리케이션 접근 제어
- IDOR 방지: `ownerOrRole()` 미들웨어 (주문 조회 시 본인 확인)
- CORS: `CORS_ORIGIN` 환경 변수로 허용 origin 제한
- JWT 서버사이드 검증 (매 요청)

### SECURITY-09: 하드닝
- 하드코딩된 시크릿 제거 → 환경 변수
- 프로덕션 에러 응답: 일반 메시지만 (스택 트레이스 제외)
- 기본 시드 비밀번호 제거 (프로덕션 빌드에서)

### SECURITY-10: 공급망 보안
- `pnpm-lock.yaml` 커밋
- 의존성 감사: `pnpm audit` (Build & Test 단계에서 실행)

### SECURITY-11: 보안 설계
- Rate limiting: `express-rate-limit` (윈도우 15분, 최대 100 요청)
- 로그인 endpoint: 별도 제한 (윈도우 15분, 최대 10 요청)
- 보안 로직 격리: `shared/middleware/` 전용 모듈

### SECURITY-12: 인증/자격 증명
- bcrypt (rounds: 12)
- 비밀번호 정책: 8자+, 대소문자/숫자/특수문자
- 브루트포스: 5회 실패 → 15분 잠금 + 관리자 알림
- JWT: Access 15분 + Refresh 7일 (rotation)
- 로그아웃 시 refresh token 전체 삭제

### SECURITY-13: 무결성 검증
- 안전하지 않은 역직렬화 없음 (JSON.parse는 Zod 검증 후)
- 감사 로그: 변경 전/후 값 기록

### SECURITY-14: 알림 및 모니터링
- 보안 이벤트 알림: 연속 로그인 실패 (EventBus → Notification)
- 감사 로그 보존: 최소 90일 (DB 기반)
- 애플리케이션 역할: 자체 감사 로그 삭제 권한 없음

### SECURITY-15: 예외 처리
- 글로벌 에러 핸들러: `shared/middleware/error-handler.ts`
- 모든 외부 호출 (DB, Bedrock, SES): try/catch
- 실패 시 접근 거부 (fail closed)
- 리소스 정리: Prisma `$disconnect()` on shutdown

---

## 5. 유지보수성 (Maintainability)

| 항목 | 요구사항 |
|---|---|
| TypeScript | strict mode |
| 코드 품질 | ESLint + Prettier |
| 테스트 | Vitest (단위 테스트) |
| 모듈 경계 | 명확한 Service/Repository 인터페이스 |
| 문서화 | API 계약은 cross-unit-contracts.md 참조 |
