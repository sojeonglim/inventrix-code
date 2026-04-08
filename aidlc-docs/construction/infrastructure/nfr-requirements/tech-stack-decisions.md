# Tech Stack Decisions — Infrastructure Unit

## 확정된 기술 스택

| 카테고리 | 선택 | 근거 |
|---|---|---|
| **컴퓨팅** | AWS EC2 (Amazon Linux 2023) | 기존 인프라 유지, CDK로 코드화 |
| **IaC** | AWS CDK (TypeScript) | 프로젝트 전체가 TypeScript, 타입 안전한 인프라 정의 |
| **웹 서버** | Nginx | 기존 유지 — 리버스 프록시 + 정적 파일 + SSL |
| **프로세스 관리** | PM2 | 기존 유지 — 클러스터 모드, 자동 재시작 |
| **데이터베이스** | PostgreSQL (RDS 또는 EC2 내) | Backend 결정 (A: PostgreSQL) |
| **캐싱** | 인메모리 (node-cache) | Redis 미도입 결정 (Infra-Q3: C) |
| **CI/CD** | GitHub Actions | Infra-Q2: C — staging→production 자동 배포 |
| **시크릿 관리** | AWS SSM Parameter Store | SECURITY-09, SECURITY-12 준수 |
| **로깅** | CloudWatch Logs | SECURITY-02, SECURITY-03 준수 |
| **모니터링** | CloudWatch Metrics + Alarms | SECURITY-14 준수 |
| **SSL** | Let's Encrypt 또는 ACM | 자체 서명 → 정식 인증서 전환 |
| **이메일** | AWS SES | FR-06 이메일 알림 요구사항 |

---

## CDK 스택 구조 (예상)

```
packages/infrastructure/        # 신규 패키지
  bin/
    app.ts                      # CDK 앱 진입점
  lib/
    network-stack.ts            # VPC, Security Groups
    database-stack.ts           # RDS PostgreSQL
    compute-stack.ts            # EC2, Nginx, PM2
    monitoring-stack.ts         # CloudWatch 대시보드, 알람
    secrets-stack.ts            # SSM Parameter Store
    ses-stack.ts                # SES 도메인 인증
  cdk.json
  package.json
  tsconfig.json
```

---

## 환경 분리

| 환경 | 용도 | 배포 방식 |
|---|---|---|
| staging | 테스트/검증 | GitHub Actions — main merge 시 자동 |
| production | 실서비스 | GitHub Actions — manual approval 또는 tag |

---

## Redis 미도입에 따른 제약 및 대안

| 기능 | Redis 대안 | 제약 |
|---|---|---|
| Rate Limiting | express-rate-limit (인메모리) | 다중 인스턴스 시 인스턴스별 독립 카운트 |
| 세션 | JWT stateless | 서버 사이드 세션 무효화 제한적 |
| 캐싱 | node-cache / lru-cache | 인스턴스별 독립 캐시, 일관성 없음 |
| SSE pub/sub | EventEmitter (인메모리) | 단일 인스턴스에서만 동작 |

**수평 확장 시**: Redis 도입이 필요하며, 이는 향후 3~4단계에서 검토 가능.
