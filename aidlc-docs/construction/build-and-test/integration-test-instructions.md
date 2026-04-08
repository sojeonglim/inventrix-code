# Frontend Integration Test Instructions

## 목적
Frontend ↔ Backend API 연동이 cross-unit-contracts.md 계약대로 동작하는지 검증

## 사전 조건
- Backend API 서버 실행 중 (`http://localhost:3000`)
- 테스트 데이터 시딩 완료

## 테스트 시나리오

### Scenario 1: 인증 흐름
1. `POST /api/auth/register` → 회원가입 성공 → 토큰 수신
2. `POST /api/auth/login` → 로그인 성공 → 토큰 수신
3. `POST /api/auth/refresh` → 토큰 갱신 성공
4. `POST /api/auth/logout` → 로그아웃 성공

### Scenario 2: 고객 주문 흐름
1. `GET /api/products` → 상품 목록 (pagination)
2. `GET /api/products/:id` → 상품 상세
3. `POST /api/orders` → 주문 생성 (재고 예약)
4. `GET /api/orders` → 본인 주문 목록
5. `POST /api/orders/:id/cancel` → 주문 취소 (pending만)

### Scenario 3: 관리자 대시보드 + SSE
1. `GET /api/analytics/dashboard` → KPI 데이터
2. `GET /api/sse/connect` → SSE 연결
3. 다른 사용자가 주문 생성 → `dashboard_update` 이벤트 수신 확인

### Scenario 4: RBAC 접근 제어
1. Customer 토큰으로 `DELETE /api/products/:id` → 403
2. Staff 토큰으로 `PATCH /api/users/:id/role` → 403
3. Admin 토큰으로 `PATCH /api/users/:id/role` → 200

### Scenario 5: 알림 흐름
1. `GET /api/notifications` → 알림 목록
2. `GET /api/notifications/unread-count` → 읽지 않은 수
3. `PATCH /api/notifications/:id/read` → 읽음 처리

## 수동 테스트 체크리스트

- [ ] 로그인 → 역할별 네비게이션 메뉴 확인
- [ ] 다크 모드 토글 → 전체 UI 테마 전환
- [ ] 상품 목록 무한 스크롤 → 추가 로드
- [ ] 주문 생성 → 토스트 알림 + 주문 목록 갱신
- [ ] 주문 취소 → ConfirmDialog → 상태 변경
- [ ] Admin 대시보드 → KPI 카드 + 차트 표시
- [ ] 재고 수정 → 테이블 즉시 갱신
- [ ] 역할 변경 → ConfirmDialog → 즉시 반영
- [ ] SSE 연결 끊김 → 자동 재연결
- [ ] 알림 벨 → 드롭다운 → 읽음 처리
