# Code Summary — Infrastructure Unit

## 생성된 파일 목록

### CDK 패키지 (`packages/infrastructure/`)
| 파일 | 설명 |
|---|---|
| `package.json` | CDK 패키지 의존성 및 스크립트 |
| `tsconfig.json` | TypeScript strict 설정 |
| `cdk.json` | CDK 앱 설정 및 context |
| `bin/app.ts` | CDK 앱 진입점 — 6개 스택 인스턴스화 |
| `lib/config/environments.ts` | staging/production 환경 설정값 |
| `lib/stacks/network-stack.ts` | VPC, Security Groups (Public/App/DB) |
| `lib/stacks/database-stack.ts` | RDS PostgreSQL 16, 암호화, TLS, 백업 |
| `lib/stacks/secrets-stack.ts` | SSM Parameter Store (JWT, 토큰 만료) |
| `lib/stacks/compute-stack.ts` | EC2, IAM Role, EIP, UserData |
| `lib/stacks/monitoring-stack.ts` | CloudWatch Logs, Alarms, SNS |
| `lib/stacks/ses-stack.ts` | SES Domain Identity |
| `nginx/nginx.conf` | Nginx 설정 (SSL, 보안 헤더, 프록시, SSE, SPA) |
| `pm2/ecosystem.config.js` | PM2 클러스터 설정 |
| `docs/health-check-spec.md` | Health check 엔드포인트 스펙 |
| `docs/deployment-guide.md` | 초기 프로비저닝 및 배포 가이드 |

### GitHub Actions (`.github/workflows/`)
| 파일 | 설명 |
|---|---|
| `ci.yml` | CI — PR 트리거, lint/type-check/test/build/audit |
| `cd-staging.yml` | CD Staging — main push 시 자동 배포 |
| `cd-production.yml` | CD Production — manual dispatch, 확인 필요 |

## SECURITY Baseline 준수 현황
| Rule | 구현 |
|---|---|
| SECURITY-01 | RDS 저장 암호화 + TLS 강제 (rds.force_ssl=1) |
| SECURITY-02 | Nginx 접근 로그 → CloudWatch Logs |
| SECURITY-04 | Nginx 보안 헤더 (HSTS, X-Frame-Options, nosniff, Referrer-Policy) |
| SECURITY-07 | Security Group 체인 (Public→App→DB), SSH 배포자 IP 제한 |
| SECURITY-09 | SSM Parameter Store로 시크릿 외부화, IMDSv2 강제 |
| SECURITY-10 | CI에서 npm audit, pnpm --frozen-lockfile |
| SECURITY-12 | JWT_SECRET SSM 관리, EC2 IAM Role (Access Key 미사용) |
| SECURITY-13 | GitHub OIDC → IAM Role, production environment protection |
| SECURITY-14 | CloudWatch Alarms (CPU, StatusCheck) → SNS → Email |
