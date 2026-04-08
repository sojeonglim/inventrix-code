# API 문서

## REST API

### 인증

#### POST /api/auth/login
- **목적**: 사용자 로그인
- **요청**: `{ email: string, password: string }`
- **응답**: `{ token: string, user: { id, email, name, role } }`
- **인증**: 불필요

#### POST /api/auth/register
- **목적**: 신규 사용자 등록 (customer role 자동 부여)
- **요청**: `{ email: string, password: string, name: string }`
- **응답**: `{ token: string, user: { id, email, name, role } }`
- **인증**: 불필요

### 상품

#### GET /api/products
- **목적**: 전체 상품 목록 조회 (최신순)
- **응답**: `Product[]`
- **인증**: 불필요

#### GET /api/products/:id
- **목적**: 개별 상품 상세 조회
- **응답**: `Product`
- **인증**: 불필요

#### POST /api/products
- **목적**: 신규 상품 등록
- **요청**: `{ name, description, price, stock, image_url }`
- **응답**: `{ id, name, description, price, stock, image_url }`
- **인증**: Admin 필수

#### PUT /api/products/:id
- **목적**: 상품 정보 수정
- **요청**: `{ name, description, price, stock, image_url }`
- **응답**: `{ id, name, description, price, stock, image_url }`
- **인증**: Admin 필수

#### DELETE /api/products/:id
- **목적**: 상품 삭제
- **응답**: 204 No Content
- **인증**: Admin 필수

#### POST /api/products/generate-image
- **목적**: AWS Bedrock Nova Canvas를 이용한 AI 상품 이미지 생성
- **요청**: `{ productName: string, description: string }`
- **응답**: `{ imageUrl: string }`
- **인증**: Admin 필수

### 주문

#### GET /api/orders
- **목적**: 주문 목록 조회 (Admin: 전체, Customer: 본인 주문만)
- **응답**: `Order[]` (Admin의 경우 user_name, user_email 포함)
- **인증**: 필수

#### GET /api/orders/:id
- **목적**: 주문 상세 조회 (주문 항목 포함)
- **응답**: `{ ...order, items: OrderItem[] }`
- **인증**: 필수 (본인 주문 또는 Admin)

#### POST /api/orders
- **목적**: 신규 주문 생성 (재고 확인 → 주문 생성 → 재고 차감)
- **요청**: `{ items: [{ product_id, quantity }] }`
- **응답**: `{ id, subtotal, gst, total, status }`
- **인증**: 필수
- **비즈니스 로직**: Subtotal 계산, GST 10% 적용, 재고 차감

#### PATCH /api/orders/:id/status
- **목적**: 주문 상태 변경
- **요청**: `{ status: string }`
- **응답**: `{ id, status }`
- **인증**: Admin 필수

### 분석

#### GET /api/analytics/dashboard
- **목적**: 관리자 대시보드 데이터 (매출, 주문 수, 상품 수, 부족 재고, 최근 주문, 인기 상품, 상태별 주문)
- **응답**: `{ summary, recentOrders, topProducts, ordersByStatus }`
- **인증**: Admin 필수

#### GET /api/analytics/inventory
- **목적**: 재고 현황 (재고 수준별 상태 포함)
- **응답**: `InventoryItem[]` (stock 오름차순)
- **인증**: Admin 필수

## 데이터 모델

### 사용자 (User)
| 필드 | 타입 | 제약조건 |
|------|------|----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| email | TEXT | UNIQUE NOT NULL |
| password | TEXT | NOT NULL (bcrypt 해시) |
| name | TEXT | NOT NULL |
| role | TEXT | NOT NULL, CHECK('admin', 'customer') |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 상품 (Product)
| 필드 | 타입 | 제약조건 |
|------|------|----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| description | TEXT | nullable |
| price | REAL | NOT NULL |
| stock | INTEGER | NOT NULL DEFAULT 0 |
| image_url | TEXT | nullable |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 주문 (Order)
| 필드 | 타입 | 제약조건 |
|------|------|----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | NOT NULL, FK → users(id) |
| subtotal | REAL | NOT NULL |
| gst | REAL | NOT NULL |
| total | REAL | NOT NULL |
| status | TEXT | NOT NULL, CHECK('pending','processing','shipped','delivered','cancelled') |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 주문 항목 (OrderItem)
| 필드 | 타입 | 제약조건 |
|------|------|----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| order_id | INTEGER | NOT NULL, FK → orders(id) |
| product_id | INTEGER | NOT NULL, FK → products(id) |
| quantity | INTEGER | NOT NULL |
| price | REAL | NOT NULL |
