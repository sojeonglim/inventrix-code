# Unit of Work Dependencies

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 | 설명 |
|---|---|---|---|
| Unit 1: Backend | cross-unit-contracts.md | 계약 참조 | API 계약, 공유 타입, 환경 변수 기준으로 구현 |
| Unit 2: Frontend | cross-unit-contracts.md | 계약 참조 | API 계약, SSE 스키마, 공유 타입 기준으로 구현 |
| Unit 3: Infrastructure | cross-unit-contracts.md | 계약 참조 | 환경 변수, DB 요구사항, 외부 서비스 기준으로 구현 |

> cross-unit-contracts.md에 API 계약, SSE 이벤트 스키마, 환경 변수, 보안 계약이 모두 확정되었으므로 3개 Unit 모두 독립적으로 병렬 진행 가능합니다.

## 실행 순서

```
cross-unit-contracts.md (확정)
         |
         +---> Unit 1: Backend ──────────────>
         |
         +---> Unit 2: Frontend ─────────────>
         |
         +---> Unit 3: Infrastructure ───────>
```

- 3개 Unit 모두 **병렬 진행 가능**
- 각 Unit은 cross-unit-contracts.md를 기준으로 독립 개발

## Coordination Points

| 시점 | 내용 | 관련 Unit |
|---|---|---|
| 개발 시작 전 (완료) | API 계약, SSE 스키마, 환경 변수, 보안 계약 확정 | 전체 → cross-unit-contracts.md |
| 계약 변경 발생 시 | cross-unit-contracts.md 업데이트 + 영향받는 Unit 담당자 통보 | 변경 요청 Unit → 전체 |
| 통합 테스트 시 | Backend + Frontend + Infrastructure 연동 검증 | 전체 |

## 계약 변경 관리 규칙

1. 개발 중 API 계약 변경이 필요한 경우, cross-unit-contracts.md를 먼저 업데이트
2. 변경 사항은 영향받는 Unit 담당자에게 즉시 공유
3. Breaking change는 관련 담당자 합의 후 반영

## 통합 테스트 전략

| 테스트 유형 | 시점 | 범위 |
|---|---|---|
| Backend 단위 테스트 | Unit 1 개발 중 | 각 모듈 Service/Repository |
| Frontend 단위 테스트 | Unit 2 개발 중 | 컴포넌트, 훅 (Mock API) |
| API 통합 테스트 | Unit 1 + 3 완료 시 | Backend + DB + 외부 서비스 |
| E2E 테스트 | 전체 Unit 완료 시 | Frontend + Backend + Infrastructure |

> Frontend는 개발 중 cross-unit-contracts.md 기반 Mock API로 독립 테스트 가능
