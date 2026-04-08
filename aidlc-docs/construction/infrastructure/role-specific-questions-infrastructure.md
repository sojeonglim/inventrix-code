# Cloud/Infra 담당자 기술 결정 질문

> ⚠️ CONSTRUCTION PHASE 시작 전에 답변을 완료해주세요.
> 팀 전체 협의로 확정된 요구사항(`requirements.md`)과 인프라 계약(`cross-unit-contracts.md` Section 4)을 기반으로 결정합니다.

---

### Infra-Q1: 배포 인프라
배포 인프라 현대화 방향은?

A) 현재 EC2 + Nginx 유지 (스크립트 개선만)
B) EC2 유지 + CDK/IaC 도입
C) 컨테이너화 (Docker + ECS/Fargate)
D) 서버리스 (Lambda + API Gateway)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

### Infra-Q2: CI/CD 파이프라인
CI/CD 파이프라인 도입 범위는?

A) 도입 안 함 — 수동 배포 유지
B) 기본 — GitHub Actions (빌드 + 린트 + 테스트)
C) 중간 — GitHub Actions + 자동 배포 (staging → production)
D) 고급 — 중간 + 인프라 변경 자동화 (CDK deploy)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

### Infra-Q3: Redis 도입 여부
캐싱/세션 저장소로 Redis 도입 여부는?

A) 도입 — Redis 사용 (세션, 요청 제한, 캐시, pub/sub)
B) 도입하되 최소 범위 — 세션 + 요청 제한만
C) 도입 안 함 — 인메모리 또는 DB 기반으로 처리
D) Other (please describe after [Answer]: tag below)

[Answer]: A
