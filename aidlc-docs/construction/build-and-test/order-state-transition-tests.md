# 주문 상태 전이 테스트 케이스

> cross-unit-contracts.md 상태 전이 규칙 + Backend B-Q1 답변 기반

---

## 유효한 전이

### admin 역할
- [ ] pending → processing ✅
- [ ] pending → cancelled ✅
- [ ] processing → shipped ✅
- [ ] processing → cancelled ✅
- [ ] shipped → delivered ✅

### staff 역할
- [ ] processing → shipped ✅
- [ ] shipped → delivered ✅

### customer 역할 (본인 주문)
- [ ] pending → cancelled ✅ (POST /api/orders/:id/cancel)

---

## 무효한 전이 (모든 역할에서 거부)

- [ ] pending → shipped → 409
- [ ] pending → delivered → 409
- [ ] processing → pending → 409
- [ ] processing → delivered → 409
- [ ] shipped → pending → 409
- [ ] shipped → processing → 409
- [ ] shipped → cancelled → 409
- [ ] delivered → (any) → 409
- [ ] cancelled → (any) → 409

---

## 역할별 권한 거부

- [ ] staff: pending → processing → 403
- [ ] staff: pending → cancelled → 403
- [ ] staff: processing → cancelled → 403
- [ ] customer: pending → processing → 403
- [ ] customer: processing → shipped → 403
- [ ] customer: processing → cancelled → 409 ("관리자에게 문의")

---

## 취소 + 재고 복원

- [ ] pending 주문 취소 → 재고 예약 해제 + 재고 복원
- [ ] processing 주문 취소 (admin) → 재고 복원 + 환불 레코드 자동 생성 (status: pending_refund)
- [ ] 취소 + 재고 복원 실패 시 → 전체 롤백 (원자성)

---

## 취소 + 환불 레코드

- [ ] pending 취소 → 환불 레코드 생성 (pending_refund)
- [ ] processing 취소 → 환불 레코드 생성 (pending_refund)
- [ ] 환불 레코드에 orderId, amount, createdAt 포함
