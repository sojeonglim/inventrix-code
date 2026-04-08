# Security Test Instructions — Infrastructure Unit

## SECURITY Baseline 검증

### SECURITY-01: 암호화 (at rest + in transit)
- [ ] RDS StorageEncrypted = true (CDK synth 결과 확인)
- [ ] RDS rds.force_ssl = 1 (Parameter Group 확인)
- [ ] EBS Encrypted = true (EC2 블록 디바이스 확인)

### SECURITY-02: 접근 로깅
- [ ] Nginx access_log 설정 확인 (nginx.conf)
- [ ] CloudWatch Log Group `/inventrix/{env}/nginx` 생성 확인

### SECURITY-04: HTTP 보안 헤더
배포 후 확인:
```bash
curl -I https://inventrix.example.com
```
- [ ] Strict-Transport-Security: max-age=31536000; includeSubDomains
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### SECURITY-07: 네트워크 설정
- [ ] Public SG: 80/443만 0.0.0.0/0, SSH는 배포자 IP만
- [ ] App SG: 3000 from Public SG only
- [ ] DB SG: 5432 from App SG only, outbound 없음
- [ ] DB가 public subnet에 있더라도 SG로 접근 제한

### SECURITY-09: 하드닝
- [ ] JWT_SECRET이 SSM Parameter Store에 저장 (소스코드에 없음)
- [ ] IMDSv2 강제 (requireImdsv2: true)
- [ ] 에러 응답에 내부 정보 미노출 (Nginx 기본 에러 페이지 비활성화)

### SECURITY-10: 공급망 보안
- [ ] CI에서 npm audit 실행 확인 (ci.yml)
- [ ] pnpm --frozen-lockfile 사용 확인 (cd-staging.yml, cd-production.yml)
- [ ] pnpm-lock.yaml이 git에 커밋됨

### SECURITY-12: 인증 관리
- [ ] JWT_SECRET이 환경 변수/SSM에서 로드 (하드코딩 없음)
- [ ] EC2가 IAM Role 사용 (Access Key 미사용)

### SECURITY-13: CI/CD 무결성
- [ ] GitHub OIDC → IAM Role (Access Key 미사용)
- [ ] Production 배포 시 manual dispatch + 확인 입력 필요
- [ ] Production environment에 required reviewers 설정 (GitHub 설정)

### SECURITY-14: 모니터링
- [ ] CloudWatch Alarm: HighCPU (>80%, 5min)
- [ ] CloudWatch Alarm: StatusCheckFailed
- [ ] SNS Topic → Email 알림 설정
