# Application Design Plan

## 설계 범위
Inventrix 현대화 프로젝트의 모듈러 모놀리스 아키텍처 설계

---

## 설계 질문

아래 질문에 답변해주세요. 각 질문의 `[Answer]:` 뒤에 선택지 또는 자유 답변을 작성해주세요.

### Q1: 이벤트 버스 구현 방식
모듈 간 통신을 위한 내부 이벤트 버스 구현 방식을 선택해주세요.

A) In-memory EventEmitter 기반 (단일 프로세스, 단순, 현재 규모에 적합)
B) Redis Pub/Sub 기반 (다중 프로세스 확장 가능, 인프라 추가 필요)
C) 메시지 큐 기반 (SQS 등, 완전한 비동기, 인프라 복잡도 높음)

[Answer]: A A

### Q2: 알림 저장소
인앱 알림 데이터를 어디에 저장할지 선택해주세요.

A) 메인 DB에 notifications 테이블 (단순, 일관성 보장)
B) Redis에 저장 (빠른 읽기, 영속성 제한)
C) 메인 DB + Redis 캐시 (영속성 + 성능, 복잡도 증가)

[Answer]: A A

### Q3: SSE 연결 관리
SSE(Server-Sent Events) 연결 관리 방식을 선택해주세요.

A) 역할 기반 채널 (admin 채널, staff 채널, customer 채널 — 역할별 이벤트 분리)
B) 사용자별 개별 연결 (각 사용자에게 맞춤 이벤트 전달)
C) 단일 채널 + 클라이언트 필터링 (서버 단순, 클라이언트에서 관련 이벤트만 처리)

[Answer]: B B

---

## 설계 생성 계획

답변 확인 후 아래 순서로 설계 문서를 생성합니다:

- [x] Step 1: components.md — 6개 Backend 모듈 + Frontend 컴포넌트 정의
- [x] Step 2: component-methods.md — 각 모듈의 Service/Repository method signatures
- [x] Step 3: services.md — 서비스 계층 정의 및 orchestration 패턴
- [x] Step 4: component-dependency.md — 모듈 간 의존성 및 통신 패턴
- [x] Step 5: application-design.md — 통합 설계 문서
- [x] Step 6: 설계 완전성 및 일관성 검증
