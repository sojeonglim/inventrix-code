# 재고 예약 시나리오 테스트 케이스

> cross-unit-contracts.md + US-4.1~4.3 + Backend B-Q2, B-Q3 답변 기반

---

## 예약 생성 (주문 생성 시)

- [ ] 재고 10, 주문 3 → 예약 생성, availableStock=7
- [ ] 재고 0 → 409 INSUFFICIENT_STOCK
- [ ] 재고 5, 주문 6 → 409 INSUFFICIENT_STOCK
- [ ] 주문 생성 실패 시 → 예약 롤백, 재고 원복

---

## 동시성 (경쟁 조건)

- [ ] 재고 1, 2명 동시 주문 → 1명 성공 + 1명 409
- [ ] 재고 5, 3명이 각각 2개 주문 → 2명 성공(4개) + 1명 409
- [ ] 동시 주문 후 stock + reservedStock 합계 일관성 유지

---

## 예약 확정 (processing 전환 시)

- [ ] pending → processing 전환 → 예약 확정, 실제 재고 차감, 예약 제거
- [ ] 확정 중 DB 에러 → 예약 상태 유지, 재시도 가능
- [ ] 이미 만료된 예약으로 확정 시도 → 409 "예약이 만료되었습니다"

---

## 예약 타임아웃 (15분)

- [ ] 15분 경과 → 예약 자동 해제, 재고 복원
- [ ] 14분 59초 → 예약 유지
- [ ] 타임아웃 직전 주문 확정 → 정상 확정, 타임아웃 취소
- [ ] 다수 예약 동시 만료 → 모두 정상 해제, 각각 재고 복원

---

## 예약 해제 (주문 취소 시)

- [ ] pending 취소 → 예약 해제 + 재고 복원
- [ ] processing 취소 (admin) → 확정된 재고 복원
- [ ] 취소 + 재고 복원 원자성 (하나 실패 시 전체 롤백)

---

## 가용 재고 표시

- [ ] GET /api/products → availableStock = stock - reservedStock
- [ ] GET /api/inventory → stock, availableStock, reservedStock 모두 표시
- [ ] 예약 생성 후 → availableStock 감소 확인
- [ ] 예약 해제 후 → availableStock 증가 확인
