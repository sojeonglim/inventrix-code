# RBAC 접근 제어 테스트 케이스

> personas.md 권한 매트릭스 + cross-unit-contracts.md 기반

---

## 범례
- ✅ 허용 (200/201/204)
- ❌ 거부 (403)
- 🔒 인증 필요 (401 if no token)

---

## 사용자 관리

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/users | ✅ | ❌ | ❌ |
| PATCH /api/users/:id/role | ✅ | ❌ | ❌ |

테스트:
- [ ] staff → GET /api/users → 403
- [ ] customer → GET /api/users → 403
- [ ] staff → PATCH /api/users/:id/role → 403
- [ ] admin → PATCH role 변경 → 감사 로그 기록 확인

---

## 상품 관리

| 엔드포인트 | admin | staff | customer | 비인증 |
|---|---|---|---|---|
| GET /api/products | ✅ | ✅ | ✅ | ✅ |
| GET /api/products/:id | ✅ | ✅ | ✅ | ✅ |
| POST /api/products | ✅ | ❌ | ❌ | 🔒 |
| PUT /api/products/:id | ✅ | ❌ | ❌ | 🔒 |
| DELETE /api/products/:id | ✅ | ❌ | ❌ | 🔒 |
| POST /api/products/generate-image | ✅ | ❌ | ❌ | 🔒 |

테스트:
- [ ] staff → POST /api/products → 403
- [ ] customer → DELETE /api/products/:id → 403
- [ ] 비인증 → GET /api/products → 200 (공개)
- [ ] 비인증 → POST /api/products → 401

---

## 주문 관리

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/orders | ✅ (전체) | ✅ (전체) | ✅ (본인만) |
| GET /api/orders/:id | ✅ (전체) | ✅ (전체) | ✅ (본인만) |
| POST /api/orders | ❌ | ❌ | ✅ |
| PATCH /api/orders/:id/status | ✅ (전이별) | ✅ (배송만) | ❌ |
| POST /api/orders/:id/cancel | ✅ | ❌ | ✅ (본인 pending만) |

테스트:
- [ ] customer → GET /api/orders → 본인 주문만 반환
- [ ] customer → GET /api/orders/:id (타인) → 403 (IDOR 방지)
- [ ] admin → POST /api/orders → 403
- [ ] staff → POST /api/orders/:id/cancel → 403

---

## 환불 관리

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/refunds | ✅ | ❌ | ❌ |
| PATCH /api/refunds/:id | ✅ | ❌ | ❌ |

테스트:
- [ ] staff → GET /api/refunds → 403
- [ ] customer → PATCH /api/refunds/:id → 403

---

## 재고 관리

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/inventory | ✅ | ✅ | ❌ |
| PATCH /api/inventory/:productId | ✅ | ✅ | ❌ |

테스트:
- [ ] customer → GET /api/inventory → 403
- [ ] customer → PATCH /api/inventory/:productId → 403

---

## 분석

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/analytics/* | ✅ | ❌ | ❌ |

테스트:
- [ ] staff → GET /api/analytics/dashboard → 403
- [ ] customer → GET /api/analytics/revenue → 403

---

## 알림

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/notifications | ✅ (본인) | ✅ (본인) | ✅ (본인) |
| GET /api/notifications/unread-count | ✅ (본인) | ✅ (본인) | ✅ (본인) |
| PATCH /api/notifications/:id/read | ✅ (본인) | ✅ (본인) | ✅ (본인) |

테스트:
- [ ] 사용자 A → PATCH /api/notifications/:id/read (사용자 B의 알림) → 403

---

## SSE

| 엔드포인트 | admin | staff | customer |
|---|---|---|---|
| GET /api/sse/connect | ✅ | ✅ | ✅ |

테스트:
- [ ] 비인증 → GET /api/sse/connect → 401
- [ ] admin → dashboard_update 이벤트 수신 확인
- [ ] customer → 본인 order_status_changed 이벤트만 수신 확인
- [ ] staff → dashboard_update 이벤트 미수신 확인

---

## 토큰 만료

- [ ] 만료된 access token → 모든 인증 엔드포인트 → 401
- [ ] 유효한 refresh token으로 갱신 → 새 access token 발급
