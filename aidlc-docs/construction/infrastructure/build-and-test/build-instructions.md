# Build Instructions — Infrastructure Unit

## Prerequisites
- Node.js 22+
- pnpm 9+
- AWS CLI v2 configured
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS 계정 접근 권한 (CDK deploy 가능)

## Build Steps

### 1. Install Dependencies
```bash
cd packages/infrastructure
pnpm install
```

### 2. TypeScript Compile Check
```bash
pnpm exec tsc --noEmit
```

### 3. CDK Synth (CloudFormation 템플릿 생성)
```bash
# Staging
pnpm run synth -- -c env=staging -c deployerIp=YOUR_IP/32

# Production
pnpm run synth -- -c env=production -c deployerIp=YOUR_IP/32
```

### 4. Verify Build Success
- **Expected Output**: `cdk.out/` 디렉토리에 CloudFormation 템플릿 생성
- **Build Artifacts**:
  - `cdk.out/Inventrix-staging-Network.template.json`
  - `cdk.out/Inventrix-staging-Database.template.json`
  - `cdk.out/Inventrix-staging-Secrets.template.json`
  - `cdk.out/Inventrix-staging-Compute.template.json`
  - `cdk.out/Inventrix-staging-Monitoring.template.json`
  - `cdk.out/Inventrix-staging-SES.template.json`

### 5. CDK Diff (변경사항 확인)
```bash
pnpm run diff -- -c env=staging
```

## Troubleshooting

### CDK Synth 실패: "Cannot find module"
- **원인**: TypeScript 컴파일 에러
- **해결**: `pnpm exec tsc --noEmit`으로 에러 확인 후 수정

### CDK Synth 실패: "VPC not found"
- **원인**: 기본 VPC가 없는 리전
- **해결**: AWS 콘솔에서 기본 VPC 생성 또는 CDK에서 신규 VPC 생성으로 변경
