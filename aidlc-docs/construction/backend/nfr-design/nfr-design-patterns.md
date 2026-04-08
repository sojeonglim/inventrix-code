# Backend NFR Design — Design Patterns

---

## 1. 보안 미들웨어 체인
```
Request → rateLimiter → helmet → cors → requestLogger → authenticate → authorize → validate → handler → errorHandler
```
- 전역 rate limit: 100/15분, 로그인: 10/15분
- `ownerOrRole()` 미들웨어로 IDOR 방지
- 글로벌 에러 핸들러: fail closed, 프로덕션에서 스택 트레이스 제외

## 2. 트랜잭션 + 동시성 제어
- Prisma `$transaction` + `SELECT FOR UPDATE`로 재고 예약 원자성 보장
- 트랜잭션 외부에서 EventBus 이벤트 발행 (부가 효과 격리)

## 3. 이벤트 에러 격리
- EventBus 핸들러 각각 try/catch 감싸기
- 알림/분석 실패가 주문 흐름에 영향 없음

## 4. Graceful Shutdown
- SIGTERM → 새 요청 중단 → 진행 중 완료 대기(30초) → SSE 정리 → 스케줄러 중지 → Prisma disconnect

## 5. 구조화 로깅 (Pino)
- 필수 필드: timestamp, requestId(uuid), level, module
- PII redact: password, token, authorization
- 감사 로그: DB audit_logs 테이블, DELETE 권한 없음

## 6. 의존성 주입 (수동 DI)
- 앱 초기화 시 조립: Prisma → Repository → Service → Routes
- 모듈 간 의존성은 생성자 주입
