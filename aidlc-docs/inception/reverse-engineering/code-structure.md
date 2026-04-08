# 코드 구조

## 빌드 시스템
- **유형**: pnpm (monorepo with workspaces)
- **설정 파일**:
  - `package.json` - 루트 워크스페이스 정의
  - `pnpm-workspace.yaml` - packages/* 워크스페이스 설정
  - `packages/api/package.json` - 백엔드 의존성
  - `packages/frontend/package.json` - 프론트엔드 의존성
  - `packages/api/tsconfig.json` - 백엔드 TypeScript 설정
  - `packages/frontend/tsconfig.json` - 프론트엔드 TypeScript 설정

## 주요 모듈

### 백엔드 (packages/api/src/)

- `index.ts` - Express 서버 진입점, 미들웨어 설정, 라우트 등록
- `db.ts` - SQLite 데이터베이스 초기화, 테이블 생성, 시드 데이터 삽입
- `middleware/auth.ts` - JWT 인증/인가 미들웨어 (authenticate, requireAdmin, generateToken)
- `routes/auth.ts` - 로그인/회원가입 API 엔드포인트
- `routes/products.ts` - 상품 CRUD + AI 이미지 생성 API 엔드포인트
- `routes/orders.ts` - 주문 생성/조회/상태변경 API 엔드포인트
- `routes/analytics.ts` - 대시보드 분석 및 재고 현황 API 엔드포인트
- `services/imageGenerator.ts` - AWS Bedrock Nova Canvas 이미지 생성 서비스

### 프론트엔드 (packages/frontend/src/)

- `main.tsx` - React 앱 진입점
- `App.tsx` - 라우터 설정, ProtectedRoute 컴포넌트
- `context/AuthContext.tsx` - 인증 상태 관리 (login, register, logout)
- `components/Layout.tsx` - 네비게이션 바 및 레이아웃
- `pages/Login.tsx` - 로그인 페이지
- `pages/Register.tsx` - 회원가입 페이지
- `pages/Storefront.tsx` - 상품 목록 (메인 페이지)
- `pages/ProductDetail.tsx` - 상품 상세 및 주문
- `pages/Orders.tsx` - 고객 주문 이력
- `pages/AdminDashboard.tsx` - 관리자 대시보드 (매출, 주문, 인기상품)
- `pages/AdminProducts.tsx` - 상품 관리 (CRUD + AI 이미지 생성)
- `pages/AdminOrders.tsx` - 주문 관리 (상태 변경)
- `pages/AdminInventory.tsx` - 재고 현황

### 배포 스크립트

- `deploy.sh` - AWS EC2 배포 스크립트 (인스턴스 생성, 코드 업로드, Nginx 설정)
- `destroy.sh` - AWS 리소스 정리 스크립트

## 디자인 패턴

### 리포지토리 패턴 (암묵적)
- **위치**: 각 라우트 파일에서 직접 DB 쿼리 실행
- **목적**: 데이터 접근 (현재 별도 repository 계층 없이 라우트에서 직접 수행)
- **구현**: better-sqlite3 prepared statements 직접 사용

### 미들웨어 패턴
- **위치**: `middleware/auth.ts`
- **목적**: 인증/인가 처리
- **구현**: Express 미들웨어 체인 (authenticate → requireAdmin)

### 컨텍스트 패턴 (프론트엔드)
- **위치**: `context/AuthContext.tsx`
- **목적**: 전역 인증 상태 관리
- **구현**: React Context API + localStorage 영속화

## 핵심 의존성

### better-sqlite3 (v9.2.2)
- **사용처**: 모든 데이터 저장 및 조회
- **목적**: 동기식 SQLite 드라이버
- **위험**: 프로덕션 동시성 제한 (단일 writer)

### jsonwebtoken (v9.0.2)
- **사용처**: 인증 토큰 생성 및 검증
- **목적**: JWT 기반 무상태(stateless) 인증

### bcrypt (v5.1.1)
- **사용처**: 비밀번호 해싱
- **목적**: 안전한 비밀번호 저장

### @aws-sdk/client-bedrock-runtime (v3.700.0)
- **사용처**: AI 이미지 생성
- **목적**: AWS Bedrock Nova Canvas 모델 호출
