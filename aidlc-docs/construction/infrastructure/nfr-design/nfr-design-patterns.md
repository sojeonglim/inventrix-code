# NFR Design Patterns — Infrastructure Unit

---

## 1. 네트워크 보안 패턴

### Defense in Depth (다층 방어)

```
Internet
    |
    v
[Security Group: Public]
  - Inbound: 80, 443 from 0.0.0.0/0
  - Inbound: 22 from 배포자 IP only
    |
    v
[Nginx on EC2]
  - SSL termination (TLS 1.2+)
  - 보안 헤더 추가 (HSTS, X-Frame-Options 등)
  - Rate limiting (connection level)
  - 정적 파일 서빙 + 리버스 프록시
    |
    v
[Security Group: Application]
  - Inbound: 3000 from Nginx SG only
    |
    v
[Node.js App (PM2 cluster)]
  - Application-level rate limiting
  - JWT 인증/인가
  - 입력 검증 (Zod)
    |
    v
[Security Group: Database]
  - Inbound: 5432 from App SG only
    |
    v
[PostgreSQL]
  - TLS 연결 강제
  - 저장 암호화 (at rest)
```

### 적용 SECURITY 규칙
- SECURITY-01: DB 암호화 (at rest + in transit)
- SECURITY-07: 제한적 네트워크 (SG 체인)
- SECURITY-04: Nginx 보안 헤더 (Backend 미들웨어와 이중 적용)

---

## 2. 시크릿 관리 패턴

### External Secret Store

```
AWS SSM Parameter Store
  /inventrix/production/JWT_SECRET        (SecureString)
  /inventrix/production/DATABASE_URL      (SecureString)
  /inventrix/staging/JWT_SECRET           (SecureString)
  /inventrix/staging/DATABASE_URL         (SecureString)

CDK 배포 시:
  → SSM에서 시크릿 읽기
  → EC2 UserData에 환경 변수로 주입
  → 또는 애플리케이션이 런타임에 SSM SDK로 직접 읽기
```

### 적용 SECURITY 규칙
- SECURITY-09: 하드코딩된 시크릿 제거
- SECURITY-12: 인증 자격 증명 외부화

---

## 3. 배포 패턴

### Rolling Deployment (무중단 배포)

```
GitHub Actions CD:
  1. Build & Test (CI)
  2. SSH to EC2
  3. git pull (또는 아티팩트 전송)
  4. pnpm install --frozen-lockfile
  5. pnpm build (frontend + backend)
  6. pm2 reload ecosystem.config.js  ← zero-downtime
  7. Health check (curl /api/health)
  8. 실패 시 pm2 reload --previous  ← rollback
```

### 환경 분리 패턴

```
CDK App
  ├── InventrixStagingStack
  │     ├── EC2 (t3.small)
  │     ├── PostgreSQL (db.t3.micro)
  │     └── 별도 Security Groups
  └── InventrixProductionStack
        ├── EC2 (t3.medium)
        ├── PostgreSQL (db.t3.small)
        └── 별도 Security Groups
```

### 적용 요구사항
- NFR-05: 배포 중단 최소화
- SECURITY-13: CI/CD 파이프라인 보안

---

## 4. 모니터링 및 알림 패턴

### Centralized Logging + Alerting

```
[Nginx Access/Error Log] → CloudWatch Logs Agent → CloudWatch Logs
[PM2/App Log]            → CloudWatch Logs Agent → CloudWatch Logs
[PostgreSQL Log]         → CloudWatch Logs (RDS) 또는 로컬 로그

CloudWatch Metrics:
  - EC2: CPUUtilization, NetworkIn/Out, DiskReadOps
  - Custom: ActiveConnections, RequestLatency, 5xxErrorRate

CloudWatch Alarms:
  - CPU > 80% for 5min → SNS → Email
  - 5xx Error Rate > 5% for 3min → SNS → Email
  - Disk Usage > 85% → SNS → Email
  - DB Connections > 80% of max → SNS → Email
```

### 적용 SECURITY 규칙
- SECURITY-02: 접근 로깅 (Nginx)
- SECURITY-03: 애플리케이션 로깅 (CloudWatch)
- SECURITY-14: 보안 이벤트 알림

---

## 5. 데이터베이스 패턴

### Managed Database (RDS) vs Self-Managed

**선택: RDS PostgreSQL** (권장)
- 자동 백업 (7일 보존)
- 자동 패치
- 저장 암호화 기본 제공
- Multi-AZ 옵션 (향후 확장)

**대안: EC2 내 PostgreSQL** (비용 절감)
- pg_dump 스케줄 백업 필요
- 수동 패치 관리
- 암호화 수동 설정

### 마이그레이션 패턴

```
1. CDK로 PostgreSQL 인스턴스 프로비저닝
2. 마이그레이션 도구 (Prisma Migrate 또는 직접 SQL)로 스키마 생성
3. 시드 데이터 삽입 (기존 SQLite 데이터 export → import)
4. 애플리케이션 DB_URL 전환
5. 검증 후 SQLite 제거
```

---

## 6. CI/CD 파이프라인 패턴

### Branch-Based Deployment

```
feature/* → PR → main
                   |
                   v
              [CI: lint, type-check, test, build, npm audit]
                   |
                   v (자동)
              [CD: Deploy to Staging]
                   |
                   v (수동 승인 또는 tag)
              [CD: Deploy to Production]
```

### 파이프라인 보안 패턴
- AWS 자격 증명: GitHub OIDC → IAM Role (Access Key 미사용)
- npm audit: CI에서 high/critical 취약점 시 빌드 실패
- 빌드 캐시: pnpm store cache로 빌드 속도 최적화
- 환경 보호: production 배포 시 required reviewers
