# Code Generation Plan — Infrastructure Unit

## Unit Context
- **Unit**: Infrastructure
- **패키지**: `packages/infrastructure/` (신규 CDK 패키지) + `.github/workflows/` (CI/CD)
- **의존**: Backend Unit (DB 스키마), Frontend Unit (빌드 아티팩트)
- **산출물**: CDK 스택, GitHub Actions 워크플로우, Nginx 설정, PM2 설정

## 참조 설계 문서
- `aidlc-docs/construction/infrastructure/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/infrastructure/infrastructure-design/deployment-architecture.md`
- `aidlc-docs/construction/infrastructure/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/infrastructure/nfr-design/logical-components.md`
- `aidlc-docs/construction/infrastructure/nfr-requirements/tech-stack-decisions.md`

---

## 실행 체크리스트

### Step 1: 프로젝트 구조 설정
- [x] `packages/infrastructure/` 디렉토리 생성
- [x] `packages/infrastructure/package.json` 생성 (aws-cdk-lib, constructs 의존성)
- [x] `packages/infrastructure/tsconfig.json` 생성
- [x] `packages/infrastructure/cdk.json` 생성
- [x] `pnpm-workspace.yaml`에 infrastructure 패키지 추가 (이미 packages/* 와일드카드)

### Step 2: 환경 설정 파일
- [x] `packages/infrastructure/lib/config/environments.ts` — staging/production 설정값

### Step 3: CDK App 진입점
- [x] `packages/infrastructure/bin/app.ts` — CDK 앱 진입점, 스택 인스턴스화

### Step 4: NetworkStack
- [x] `packages/infrastructure/lib/stacks/network-stack.ts` — VPC, Security Groups (Public/App/DB)

### Step 5: DatabaseStack
- [x] `packages/infrastructure/lib/stacks/database-stack.ts` — RDS PostgreSQL 16, 암호화, TLS, 백업

### Step 6: SecretsStack
- [x] `packages/infrastructure/lib/stacks/secrets-stack.ts` — SSM Parameter Store (JWT_SECRET, DATABASE_URL)

### Step 7: ComputeStack
- [x] `packages/infrastructure/lib/stacks/compute-stack.ts` — EC2, IAM Role, Instance Profile, EIP, UserData

### Step 8: MonitoringStack
- [x] `packages/infrastructure/lib/stacks/monitoring-stack.ts` — CloudWatch Log Groups, Alarms, Dashboard, SNS

### Step 9: SESStack
- [x] `packages/infrastructure/lib/stacks/ses-stack.ts` — SES Domain/Email Identity

### Step 10: Nginx 설정
- [x] `packages/infrastructure/nginx/nginx.conf` — SSL, 보안 헤더, 리버스 프록시, SSE 프록시, SPA 라우팅

### Step 11: PM2 설정
- [x] `packages/infrastructure/pm2/ecosystem.config.js` — 클러스터 모드, 로그, 메모리 제한

### Step 12: GitHub Actions — CI
- [x] `.github/workflows/ci.yml` — PR 트리거, lint, type-check, test, build, npm audit

### Step 13: GitHub Actions — CD Staging
- [x] `.github/workflows/cd-staging.yml` — main merge 트리거, CI + SSH deploy + health check

### Step 14: GitHub Actions — CD Production
- [x] `.github/workflows/cd-production.yml` — manual dispatch, required reviewers, deploy + health check

### Step 15: Health Check 엔드포인트 (Backend 참조)
- [x] `packages/infrastructure/docs/health-check-spec.md` — Backend에 구현할 /api/health 스펙 문서

### Step 16: 배포 가이드
- [x] `packages/infrastructure/docs/deployment-guide.md` — 초기 프로비저닝 순서, CDK deploy 명령어

### Step 17: 코드 요약 문서
- [x] `aidlc-docs/construction/infrastructure/code/code-summary.md` — 생성된 코드 요약
