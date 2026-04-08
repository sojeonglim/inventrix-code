# 시스템 아키텍처

## 시스템 개요

Inventrix는 pnpm monorepo 구조의 full-stack 전자상거래 플랫폼입니다. Frontend(React SPA)와 Backend(Express REST API)로 구성되며, SQLite를 데이터 저장소로 사용합니다. 개발 시 Vite proxy를 통해 API 요청을 전달하고, 프로덕션에서는 Nginx reverse proxy를 사용합니다.

## 아키텍처 다이어그램

```mermaid
graph TB
    subgraph Client["클라이언트 계층"]
        Browser["웹 브라우저"]
    end
    
    subgraph Frontend["프론트엔드 (Vite + React + TypeScript)"]
        App["App.tsx (라우터)"]
        AuthCtx["AuthContext (상태 관리)"]
        Layout["Layout 컴포넌트"]
        Pages["페이지 (9개)"]
    end
    
    subgraph Backend["백엔드 (Node.js + Express + TypeScript)"]
        Server["index.ts (Express 서버)"]
        AuthMW["인증 미들웨어 (JWT)"]
        AuthRoute["인증 라우트 (/api/auth)"]
        ProductRoute["상품 라우트 (/api/products)"]
        OrderRoute["주문 라우트 (/api/orders)"]
        AnalyticsRoute["분석 라우트 (/api/analytics)"]
        ImageSvc["이미지 생성 서비스"]
    end
    
    subgraph Data["데이터 계층"]
        SQLite["SQLite (better-sqlite3)"]
    end
    
    subgraph External["외부 서비스"]
        Bedrock["AWS Bedrock (Nova Canvas)"]
    end
    
    subgraph Deploy["배포"]
        EC2["AWS EC2 (Amazon Linux 2023)"]
        Nginx["Nginx (리버스 프록시 + 정적 파일)"]
    end
    
    Browser --> Frontend
    Frontend -->|REST API 호출| Backend
    Server --> AuthMW
    AuthMW --> AuthRoute
    AuthMW --> ProductRoute
    AuthMW --> OrderRoute
    AuthMW --> AnalyticsRoute
    ProductRoute --> ImageSvc
    ImageSvc --> Bedrock
    Backend --> SQLite
    Nginx --> Frontend
    Nginx --> Backend
    EC2 --> Nginx
```

## 컴포넌트 설명

### 프론트엔드 (packages/frontend)
- **목적**: React 기반 SPA로 사용자 인터페이스 제공
- **책임**: 라우팅, 인증 상태 관리, API 호출, UI 렌더링
- **의존성**: react, react-dom, react-router-dom
- **유형**: 애플리케이션

### API (packages/api)
- **목적**: Express 기반 REST API 서버
- **책임**: 인증/인가, CRUD 연산, 비즈니스 로직, 외부 서비스 연동
- **의존성**: express, better-sqlite3, bcrypt, jsonwebtoken, @aws-sdk/client-bedrock-runtime
- **유형**: 애플리케이션

## 데이터 흐름

```mermaid
sequenceDiagram
    participant C as 고객
    participant F as 프론트엔드
    participant A as API 서버
    participant DB as SQLite
    
    Note over C,DB: 주문 생성 흐름
    C->>F: 상품 선택 및 수량 입력
    F->>A: POST /api/orders (Bearer Token)
    A->>A: JWT 검증
    A->>DB: 상품 재고 확인
    DB-->>A: 상품 정보 반환
    A->>A: 재고 충분 여부 확인
    A->>A: Subtotal, GST(10%), Total 계산
    A->>DB: INSERT orders
    A->>DB: INSERT order_items
    A->>DB: UPDATE products (재고 차감)
    DB-->>A: 성공
    A-->>F: 201 Created (주문 정보)
    F-->>C: 주문 성공 메시지 표시
```

## 연동 지점

- **외부 API**:
  - AWS Bedrock (Nova Canvas v1) - AI 기반 상품 이미지 생성
- **데이터베이스**:
  - SQLite (better-sqlite3) - 모든 애플리케이션 데이터 저장 (users, products, orders, order_items)
- **서드파티 서비스**: 없음 (결제, 배송 등 미연동)

## 인프라 구성요소

- **배포 모델**: 단일 EC2 인스턴스에 Nginx + Node.js 배포
- **CDK 스택**: 없음 (bash 스크립트 기반 배포)
- **네트워킹**: 단일 Security Group, SSH/HTTP/HTTPS/3000 포트 개방 (배포자 IP 제한)
- **SSL**: 자체 서명 인증서 (Nginx)
- **프로세스 관리자**: PM2 (API 서버)
