# Frontend Business Rules

> 역할별 UI 규칙, 주문 상태 전이, 재고 표시, 에러 처리 규칙

---

## 1. 주문 상태 전이 UI 규칙 (cross-unit-contracts 기반)

### 역할별 허용 액션 버튼

| 현재 상태 | Admin 버튼 | Staff 버튼 | Customer 버튼 |
|---|---|---|---|
| pending | [Processing] [Cancel] | — | [Cancel] (본인만) |
| processing | [Shipped] [Cancel] | [Shipped] | — |
| shipped | [Delivered] | [Delivered] | — |
| delivered | — | — | — |
| cancelled | — | — | — |

### 상태 배지 색상

| 상태 | 색상 (Light) | 색상 (Dark) |
|---|---|---|
| pending | amber/yellow | amber-400 |
| processing | blue | blue-400 |
| shipped | indigo | indigo-400 |
| delivered | green | green-400 |
| cancelled | red | red-400 |

### 취소 확인
- 취소 버튼 클릭 시 Radix UI AlertDialog로 확인 요청
- 확인 메시지: "주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."

---

## 2. 재고 표시 규칙

### 상품 카드/상세 (고객 뷰)
- `availableStock > 10`: "In Stock" (초록)
- `availableStock > 0 && availableStock <= 10`: "Low Stock — N left" (주황)
- `availableStock === 0`: "Out of Stock" (빨강) + 주문 버튼 비활성화

### 재고 관리 (Admin/Staff 뷰)
- 3개 컬럼 표시: 실제 재고(`stock`), 가용 재고(`availableStock`), 예약(`reservedStock`)
- `availableStock <= LOW_STOCK_THRESHOLD(10)`: 행 하이라이트 (경고색)
- `availableStock === 0`: 행 하이라이트 (위험색)

---

## 3. 역할별 네비게이션 규칙

### 헤더 네비게이션

| 메뉴 항목 | Admin | Staff | Customer | 비인증 |
|---|---|---|---|---|
| Store | ✅ | ✅ | ✅ | ✅ |
| My Orders | ✅ | — | ✅ | — |
| Admin | ✅ | — | — | — |
| Staff | — | ✅ | — | — |
| 알림 벨 | ✅ | ✅ | ✅ | — |
| 다크 모드 토글 | ✅ | ✅ | ✅ | ✅ |
| Login/Register | — | — | — | ✅ |
| 사용자 이름 + Logout | ✅ | ✅ | ✅ | — |

### Admin 사이드바/서브 네비게이션

| 메뉴 | 경로 |
|---|---|
| Dashboard | `/admin` |
| Products | `/admin/products` |
| Orders | `/admin/orders` |
| Inventory | `/admin/inventory` |
| Users | `/admin/users` |
| Refunds | `/admin/refunds` |
| Analytics | `/admin/analytics` |

### Staff 서브 네비게이션

| 메뉴 | 경로 |
|---|---|
| Orders | `/staff/orders` |
| Inventory | `/staff/inventory` |

---

## 4. 에러 처리 규칙

### API 에러 매핑 (cross-unit-contracts ErrorResponse 기반)

| HTTP 상태 | error.code 예시 | UI 처리 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 폼 필드별 인라인 에러 표시 |
| 401 | — | 토큰 refresh 시도 → 실패 시 로그인 리다이렉트 |
| 403 | — | "권한이 없습니다" 토스트 (error) |
| 404 | — | "리소스를 찾을 수 없습니다" 에러 페이지 |
| 409 | `INSUFFICIENT_STOCK` | "재고가 부족합니다" 토스트 (warning) |
| 429 | — | "요청이 너무 많습니다. 잠시 후 다시 시도해주세요" 토스트 (warning) |
| 500 | — | "서버 오류가 발생했습니다" 토스트 (error) + 재시도 버튼 |

### Error Boundary
- 최상위 Error Boundary: 예상치 못한 렌더링 에러 캐치
- 에러 페이지 표시: "문제가 발생했습니다" + "홈으로 돌아가기" 버튼
- 에러 정보를 console.error로 로깅 (사용자에게 내부 정보 노출 금지 — SECURITY-09)

### 네트워크 에러
- fetch 실패 시: "네트워크 연결을 확인해주세요" 토스트 (error)
- React Query retry: 3회 (exponential backoff)

---

## 5. Pagination 규칙

### 관리자/직원 테이블 (전통적 페이지네이션)
- 기본 pageSize: 20
- 페이지 번호 + 이전/다음 버튼
- 총 건수 표시: "N건 중 M-K 표시"
- query param으로 page/pageSize 전달

### 고객 상품 목록 (무한 스크롤)
- React Query `useInfiniteQuery` 사용
- 스크롤 하단 도달 시 다음 페이지 자동 로드
- 로딩 중 스피너 표시
- 더 이상 데이터 없으면 "모든 상품을 확인했습니다" 표시

---

## 6. 폼 제출 규칙

### 중복 제출 방지
- mutation `isPending` 상태에서 제출 버튼 비활성화
- 버튼 텍스트 변경: "저장 중..." + 스피너

### 성공 피드백
- 생성 성공: 토스트 (success) + 목록 페이지로 이동
- 수정 성공: 토스트 (success) + 현재 페이지 유지
- 삭제 성공: 토스트 (success) + 목록 페이지로 이동

### 낙관적 업데이트 (Optimistic Update)
- 알림 읽음 처리: 즉시 UI 반영 → 실패 시 롤백
- 주문 상태 변경: 서버 응답 대기 (데이터 정합성 중요)
