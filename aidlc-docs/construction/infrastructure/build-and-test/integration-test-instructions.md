# Integration Test Instructions — Infrastructure Unit

## Purpose
CDK 스택 간 의존성과 실제 AWS 리소스 프로비저닝을 검증합니다.

## Staging 환경 통합 테스트

### Scenario 1: CDK Deploy — 전체 스택 배포
- **Description**: 6개 스택을 순서대로 배포하여 의존성 해결 확인
- **Setup**: AWS 계정 접근 권한, CDK bootstrap 완료
- **Test Steps**:
  ```bash
  cd packages/infrastructure
  cdk deploy --all -c env=staging -c deployerIp=YOUR_IP/32 -c alertEmail=test@example.com
  ```
- **Expected Results**: 6개 스택 모두 CREATE_COMPLETE
- **Cleanup**: `cdk destroy --all -c env=staging`

### Scenario 2: Network → Compute 연결
- **Description**: EC2 인스턴스가 올바른 Security Group에 연결되는지 확인
- **Test Steps**:
  1. CDK deploy 후 EC2 인스턴스 ID 확인
  2. AWS 콘솔에서 Security Group 확인
  3. SSH 접속 테스트: `ssh -i key.pem ec2-user@ELASTIC_IP`
- **Expected Results**: SSH 접속 성공, 포트 3000은 외부에서 직접 접근 불가

### Scenario 3: Compute → Database 연결
- **Description**: EC2에서 RDS PostgreSQL 연결 확인
- **Test Steps**:
  1. SSH로 EC2 접속
  2. `psql -h DB_ENDPOINT -U inventrix_admin -d inventrix` 실행
  3. `SELECT 1;` 쿼리 실행
- **Expected Results**: PostgreSQL 연결 성공, TLS 연결 확인

### Scenario 4: Secrets 접근
- **Description**: EC2에서 SSM Parameter Store 읽기 확인
- **Test Steps**:
  1. SSH로 EC2 접속
  2. `aws ssm get-parameter --name /inventrix/staging/JWT_EXPIRES_IN --query Parameter.Value --output text`
- **Expected Results**: "15m" 반환

### Scenario 5: Monitoring 알람
- **Description**: CloudWatch 알람이 정상 생성되었는지 확인
- **Test Steps**:
  1. AWS 콘솔 → CloudWatch → Alarms
  2. `inventrix-staging-high-cpu`, `inventrix-staging-status-check` 알람 확인
- **Expected Results**: 알람 상태 OK

### Scenario 6: CI/CD 파이프라인
- **Description**: GitHub Actions 워크플로우가 정상 실행되는지 확인
- **Test Steps**:
  1. feature 브랜치에서 PR 생성
  2. GitHub Actions → CI 워크플로우 실행 확인
  3. main merge 후 CD Staging 워크플로우 실행 확인
- **Expected Results**: CI 성공, CD Staging 배포 성공 (AWS 자격 증명 설정 후)
