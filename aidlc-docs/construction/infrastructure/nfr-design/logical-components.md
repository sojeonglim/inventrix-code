# Logical Components — Infrastructure Unit

---

## CDK 스택 구성

### 1. NetworkStack

| 리소스 | 설명 |
|---|---|
| VPC | 기본 VPC 사용 또는 신규 VPC (public + private subnet) |
| Security Group: Public | Nginx용 — 80/443 inbound from 0.0.0.0/0, 22 from 배포자 IP |
| Security Group: App | Node.js용 — 3000 inbound from Public SG only |
| Security Group: DB | PostgreSQL용 — 5432 inbound from App SG only |

### 2. DatabaseStack

| 리소스 | 설명 |
|---|---|
| RDS PostgreSQL | db.t3.micro (staging) / db.t3.small (production) |
| DB Subnet Group | Private subnet에 배치 |
| Parameter Group | TLS 강제, 커넥션 제한 설정 |
| 자동 백업 | 7일 보존, 일일 스냅샷 |
| 저장 암호화 | AWS KMS 기본 키 |

### 3. ComputeStack

| 리소스 | 설명 |
|---|---|
| EC2 Instance | t3.small (staging) / t3.medium (production), Amazon Linux 2023 |
| IAM Role | EC2용 — SSM 읽기, SES 발송, Bedrock 호출, CloudWatch 쓰기 |
| Instance Profile | IAM Role 연결 |
| UserData | Node.js, pnpm, PM2, Nginx 설치 + 환경 변수 설정 |
| Elastic IP | 고정 IP (DNS 연결용) |
| Key Pair | SSH 접근용 (배포/디버깅) |

### 4. SecretsStack

| 리소스 | 설명 |
|---|---|
| SSM Parameter: JWT_SECRET | SecureString — JWT 서명 키 |
| SSM Parameter: DATABASE_URL | SecureString — PostgreSQL 연결 문자열 |
| SSM Parameter: JWT_EXPIRES_IN | String — 토큰 만료 시간 |
| SSM Parameter: JWT_REFRESH_EXPIRES_IN | String — 리프레시 토큰 만료 |

### 5. MonitoringStack

| 리소스 | 설명 |
|---|---|
| CloudWatch Log Group: /inventrix/nginx | Nginx 접근/에러 로그 |
| CloudWatch Log Group: /inventrix/app | Node.js 애플리케이션 로그 |
| CloudWatch Alarm: HighCPU | CPU > 80% for 5min |
| CloudWatch Alarm: High5xx | 5xx 에러율 > 5% for 3min |
| CloudWatch Alarm: HighDisk | 디스크 사용률 > 85% |
| CloudWatch Dashboard | CPU, 메모리, 요청 수, 에러율, DB 연결 수 |
| SNS Topic | 알람 알림 → 이메일 |

### 6. SESStack

| 리소스 | 설명 |
|---|---|
| SES Domain Identity | 도메인 인증 (DKIM, SPF) |
| SES Email Identity | 발신 이메일 주소 인증 |

---

## GitHub Actions 워크플로우 파일

### .github/workflows/ci.yml
- 트리거: PR to main
- 단계: checkout → pnpm install → lint → type-check → test → build → npm audit

### .github/workflows/cd-staging.yml
- 트리거: push to main (CI 성공 후)
- 단계: CI + SSH deploy to staging EC2 → health check

### .github/workflows/cd-production.yml
- 트리거: manual dispatch 또는 release tag
- 단계: CI + SSH deploy to production EC2 → health check
- 보호: required reviewers

---

## Nginx 설정

### nginx.conf 주요 설정

```
# SSL
ssl_certificate /etc/letsencrypt/live/inventrix.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/inventrix.example.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;

# 보안 헤더
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 정적 파일 캐싱
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API 리버스 프록시
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# SSE 프록시 (타임아웃 연장)
location /api/sse/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
}

# SPA 라우팅
location / {
    root /var/www/inventrix/frontend;
    try_files $uri $uri/ /index.html;
}
```

---

## PM2 설정

### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'inventrix-api',
    script: 'dist/index.js',
    cwd: '/var/www/inventrix/api',
    instances: 'max',        // CPU 코어 수만큼
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '512M',
    error_file: '/var/log/inventrix/pm2-error.log',
    out_file: '/var/log/inventrix/pm2-out.log',
    merge_logs: true
  }]
}
```

---

## 리소스 요약

| 환경 | EC2 | RDS | 예상 월 비용 (USD) |
|---|---|---|---|
| Staging | t3.small (2 vCPU, 2GB) | db.t3.micro (2 vCPU, 1GB) | ~$30-40 |
| Production | t3.medium (2 vCPU, 4GB) | db.t3.small (2 vCPU, 2GB) | ~$60-80 |
