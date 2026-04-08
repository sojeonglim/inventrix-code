# Frontend Functional Design 질문

> 아래 질문에 답변 후 알려주세요. 각 질문의 [Answer]: 뒤에 선택지 문자를 입력해주세요.

---

## Question 1
React Query의 캐싱 전략은?

A) 적극적 캐싱 — staleTime 길게 설정 (5분+), 수동 invalidation 위주
B) 보수적 캐싱 — staleTime 짧게 (30초~1분), 자동 refetch 위주
C) 하이브리드 — 정적 데이터(상품 목록)는 길게, 동적 데이터(주문/재고)는 짧게
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
페이지 라우팅 구조는?

A) 현재 구조 유지 — 플랫 라우팅 (`/admin/products`, `/admin/orders` 등)
B) 중첩 라우팅 — 역할별 레이아웃 분리 (`/admin/*`에 AdminLayout, `/`에 CustomerLayout)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
알림 토스트 위치 및 동작은?

A) 우측 상단 — 자동 닫힘 (5초), 최대 3개 스택
B) 우측 하단 — 자동 닫힘 (5초), 최대 3개 스택
C) 중앙 상단 — 자동 닫힘 (3초), 최대 1개
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
반응형 breakpoint 기준은?

A) Tailwind 기본값 — sm:640px, md:768px, lg:1024px, xl:1280px
B) 커스텀 — 모바일 우선 3단계 (mobile:<768px, tablet:768~1024px, desktop:1024px+)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
다크 모드 구현 방식은?

A) Tailwind `dark:` 클래스 — CSS 변수 + `class` 전략 (html에 `dark` 클래스 토글)
B) CSS 변수만 사용 — `prefers-color-scheme` media query + 수동 토글
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
테이블/리스트 데이터의 pagination UI는?

A) 전통적 페이지네이션 — 페이지 번호 + 이전/다음 버튼
B) 무한 스크롤 — 스크롤 시 자동 로드
C) 하이브리드 — 관리자 테이블은 페이지네이션, 고객 상품 목록은 무한 스크롤
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 7
폼 관리 라이브러리는?

A) React Hook Form + Zod (검증 통합)
B) Formik + Zod
C) 네이티브 React state + Zod (라이브러리 없이)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
관리자 대시보드의 차트/그래프 라이브러리는?

A) Recharts (React 네이티브, 가벼움)
B) Chart.js + react-chartjs-2
C) 차트 없이 숫자/테이블만 표시 (현재와 유사)
D) Other (please describe after [Answer]: tag below)

[Answer]: A 
