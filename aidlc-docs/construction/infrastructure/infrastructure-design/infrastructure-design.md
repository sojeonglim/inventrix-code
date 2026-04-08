# Infrastructure Design — Infrastructure Unit

## 개요
NFR Design에서 정의한 논리적 컴포넌트를 실제 AWS 서비스에 매핑하고,
CDK 스택별 리소스 구성을 상세히 정의합니다.

---

## AWS 서비스 매핑

| 논리적 컴포넌트 | AWS 서비스 | 설정 |
|---|---|---|
| 컴퓨팅 | EC2 (Amazon Linux 2023) | t3.small(staging) / t3.medium(production) |
| 데이터베이스 | RDS PostgreSQL 16 | db.t3.micro(staging) / db.t3.small(production) |
| 시크릿 관리 | SSM Parameter Store | SecureString (KMS 암호화) |
| 로깅 | CloudWatch Logs | 로그 그룹 2개 (nginx, app) |
| 모니터링 | CloudWatch Metrics + Alarms | CPU, 5xx, Disk 알람 |
| 알림 | SNS | 이메일 구독 |
| 이메일 발송 | SES | 도메인 인증 (DKIM, SPF) |
| SSL 인증서 | ACM (또는 Let's Encrypt) | 도메인 인증서 |
| CI/CD 인증 | IAM OIDC Provider | GitHub Actions → IAM Role |
| 웹 서버 | Nginx (EC2 내) | 리버스 프록시 + SSL + 정적 파일 |
| 프로세스 관리 | PM2 (EC2 내) | 클러스터 모드 |

---

## CDK 스택 상세 설계

### Stack 1: InventrixNetworkStack

```typescript
// 리소스
- VPC (기본 VPC 사용 또는 신규)
- SecurityGroup: publicSg
    - Inbound: TCP 80, 443 from 0.0.0.0/0
    - Inbound: TCP 22 from 배포자 CIDR (CDK context로 주입)
- SecurityGroup: appSg
    - Inbound: TCP 3000 from publicSg
- SecurityGroup: dbSg
    - Inbound: TCP 5432 from appSg

// Outputs
- vpcId, publicSgId, appSgId, dbSgId
```

### Stack 2: InventrixDatabaseStack

```typescript
// 리소스
- RDS Instance: PostgreSQL 16
    - Engine: postgres 16
    - Instance: db.t3.micro (staging) / db.t3.small (production)
    - Storage: 20GB gp3, 암호화 활성화 (KMS default key)
    - Multi-AZ: false (staging) / false (production, 향후 true 전환 가능)
    - Backup: 7일 보존, 자동 스냅샷
    - Parameter Group: rds.force_ssl = 1 (TLS 강제)
    - Subnet: private (또는 public with SG 제한)
    - Security Group: dbSg
    - Deletion Protection: true (production)

// Outputs
- dbEndpoint, dbPort, dbName
```

### Stack 3: InventrixSecretsStack

```typescript
// 리소스
- SSM Parameter: /inventrix/{env}/JWT_SECRET (SecureString)
- SSM Parameter: /inventrix/{env}/DATABASE_URL (SecureString)
- SSM Parameter: /inventrix/{env}/JWT_EXPIRES_IN (String, default: "15m")
- SSM Parameter: /inventrix/{env}/JWT_REFRESH_EXPIRES_IN (String, default: "7d")

// 초기값은 CDK deploy 시 context 또는 수동 설정
```

### Stack 4: InventrixComputeStack

```typescript
// 리소스
- IAM Role: inventrix-ec2-role
    - Policy: SSM GetParameter (inventrix/* 경로만)
    - Policy: SES SendEmail
    - Policy: Bedrock InvokeModel
    - Policy: CloudWatch PutMetricData, PutLogEvents
    - Policy: S3 GetObject (이미지 저장 시, 선택)
- Instance Profile: inventrix-ec2-profile
- EC2 Instance:
    - AMI: Amazon Linux 2023 (latest)
    - Type: t3.small (staging) / t3.medium (production)
    - Security Group: publicSg (Nginx) + appSg (App)
    - IAM Profile: inventrix-ec2-profile
    - Key Pair: inventrix-{env}-key
    - Elastic IP: 연결
    - UserData:
        - Node.js 22 설치
        - pnpm 설치
        - PM2 글로벌 설치
        - Nginx 설치 및 설정
        - CloudWatch Logs Agent 설치
        - Let's Encrypt certbot 설치 (SSL)
        - 애플리케이션 코드 배포 디렉토리 생성

// Outputs
- instanceId, publicIp, elasticIp
```

### Stack 5: InventrixMonitoringStack

```typescript
// 리소스
- CloudWatch Log Group: /inventrix/{env}/nginx (보존: 90일)
- CloudWatch Log Group: /inventrix/{env}/app (보존: 90일)
- SNS Topic: inventrix-{env}-alerts
- SNS Subscription: 관리자 이메일
- CloudWatch Alarm: HighCPU
    - Metric: CPUUtilization > 80%, Period: 300s, EvaluationPeriods: 1
    - Action: SNS Topic
- CloudWatch Alarm: High5xxRate
    - Metric: Custom 5xxErrorRate > 5%, Period: 180s
    - Action: SNS Topic
- CloudWatch Alarm: HighDiskUsage
    - Metric: DiskSpaceUtilization > 85%, Period: 300s
    - Action: SNS Topic
- CloudWatch Dashboard: inventrix-{env}
    - Widgets: CPU, Memory, Network, Request Count, Error Rate, DB Connections
```

### Stack 6: InventrixSESStack

```typescript
// 리소스
- SES Email Identity: noreply@{domain}
- SES Domain Identity: {domain} (DKIM, SPF 레코드)
// DNS 레코드는 수동 설정 필요 (Route53 사용 시 자동화 가능)
```

---

## 디렉토리 구조

```
packages/infrastructure/
  bin/
    app.ts                          # CDK 앱 진입점
  lib/
    stacks/
      network-stack.ts              # VPC, Security Groups
      database-stack.ts             # RDS PostgreSQL
      secrets-stack.ts              # SSM Parameter Store
      compute-stack.ts              # EC2, IAM, EIP
      monitoring-stack.ts           # CloudWatch, SNS
      ses-stack.ts                  # SES
    config/
      environments.ts               # staging/production 설정값
    constructs/
      nginx-config.ts               # Nginx 설정 생성 헬퍼
      pm2-config.ts                 # PM2 ecosystem 생성 헬퍼
  nginx/
    nginx.conf                      # Nginx 설정 템플릿
  pm2/
    ecosystem.config.js             # PM2 설정
  cdk.json
  package.json
  tsconfig.json
```

---

## 환경별 설정

| 설정 | Staging | Production |
|---|---|---|
| EC2 Instance Type | t3.small | t3.medium |
| RDS Instance Type | db.t3.micro | db.t3.small |
| RDS Multi-AZ | false | false (향후 true) |
| RDS Deletion Protection | false | true |
| CloudWatch Log Retention | 30일 | 90일 |
| SSL | Let's Encrypt (staging) | ACM 또는 Let's Encrypt |
| PM2 Instances | 2 (CPU cores) | max (CPU cores) |
