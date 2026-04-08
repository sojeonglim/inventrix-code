# 컴포넌트 인벤토리

## 애플리케이션 패키지
- **packages/api** - Express REST API 서버 (인증, 상품, 주문, 분석, AI 이미지 생성)
- **packages/frontend** - Vite + React SPA (고객 상점, 관리자 대시보드)

## 인프라 패키지
- 없음 (CDK/Terraform/CloudFormation 미사용)

## 공유 패키지
- 없음 (프론트엔드/백엔드 간 공유 패키지 없음)

## 테스트 패키지
- 없음 (테스트 코드 미존재)

## 배포 스크립트
- `deploy.sh` - AWS EC2 프로비저닝 및 애플리케이션 배포
- `destroy.sh` - AWS 리소스 정리

## 총 개수
- **전체 패키지**: 2
- **애플리케이션**: 2 (api, frontend)
- **인프라**: 0
- **공유**: 0
- **테스트**: 0
