# Unit Test Instructions — Infrastructure Unit

## CDK 스택 검증 테스트

Infrastructure Unit은 CDK 코드이므로, CDK의 내장 검증 기능과 snapshot 테스트를 사용합니다.

### 1. TypeScript 타입 검사
```bash
cd packages/infrastructure
pnpm exec tsc --noEmit
```
- **Expected**: 0 errors

### 2. CDK Synth 검증
```bash
# 모든 스택이 유효한 CloudFormation 템플릿을 생성하는지 확인
pnpm run synth -- -c env=staging -c deployerIp=0.0.0.0/32
```
- **Expected**: 6개 스택 모두 성공적으로 synth

### 3. Security Group 규칙 검증 (수동)
synth 결과에서 확인:
- [ ] Public SG: inbound 80, 443 from 0.0.0.0/0, SSH from deployer IP only
- [ ] App SG: inbound 3000 from Public SG only
- [ ] DB SG: inbound 5432 from App SG only
- [ ] DB SG: outbound 없음 (allowAllOutbound: false)

### 4. RDS 설정 검증 (수동)
synth 결과에서 확인:
- [ ] StorageEncrypted: true
- [ ] Engine: postgres 16
- [ ] BackupRetentionPeriod: 7
- [ ] rds.force_ssl: 1

### 5. IAM Policy 검증 (수동)
synth 결과에서 확인:
- [ ] EC2 Role: SSM GetParameter (inventrix/* 경로만)
- [ ] EC2 Role: SES SendEmail
- [ ] EC2 Role: Bedrock InvokeModel
- [ ] EC2 Role: CloudWatch PutMetricData, PutLogEvents
- [ ] 와일드카드 액션 없음 (SECURITY-06)

### 6. Nginx 설정 검증
```bash
# Nginx 설정 문법 검사 (로컬에 nginx 설치 시)
nginx -t -c packages/infrastructure/nginx/nginx.conf
```
- 로컬에 nginx가 없으면 배포 후 EC2에서 검증

### 7. GitHub Actions 워크플로우 검증
```bash
# actionlint 설치 시 (brew install actionlint)
actionlint .github/workflows/ci.yml
actionlint .github/workflows/cd-staging.yml
actionlint .github/workflows/cd-production.yml
```
- actionlint 미설치 시 GitHub에 push 후 Actions 탭에서 검증
