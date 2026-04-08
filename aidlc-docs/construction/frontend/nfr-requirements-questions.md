# Frontend NFR Requirements 질문

> requirements.md의 NFR 섹션과 Functional Design을 기반으로 Frontend 특화 NFR을 확정합니다.
> 각 질문의 [Answer]: 뒤에 선택지 문자를 입력해주세요.

---

## Question 1
초기 페이지 로드 성능 목표는? (LCP 기준)

A) < 2초 (공격적 — 코드 스플리팅 + 프리로드 필수)
B) < 3초 (requirements.md 기준 — 대시보드 < 3초와 동일)
C) < 5초 (보수적)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
번들 사이즈 관리 전략은?

A) 적극적 — 라우트별 코드 스플리팅 + tree shaking + 번들 분석 도구
B) 기본 — Vite 기본 코드 스플리팅만
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
브라우저 지원 범위는?

A) 모던 브라우저만 (Chrome/Edge/Firefox/Safari 최신 2버전)
B) 모던 + IE11 호환 (polyfill 필요)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
이미지 최적화 전략은?

A) lazy loading + WebP/AVIF 포맷 + srcset 반응형
B) lazy loading만
C) 최적화 없음 (현재와 동일)
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
접근성(a11y) 수준은? (WCAG 2.1 AA는 범위 외이지만 기본 수준 확인)

A) Radix UI 기본 접근성 활용 + 키보드 네비게이션 + aria-label
B) 최소한 — 시맨틱 HTML만
C) Other (please describe after [Answer]: tag below)

[Answer]: A 
