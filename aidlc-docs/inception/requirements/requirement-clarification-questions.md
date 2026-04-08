# Requirements Clarification Questions

답변 분석 중 아래 모순/모호한 점이 발견되었습니다. 확인 부탁드립니다.

---

## Contradiction 1: 구현 범위 vs UX/접근성 요구 수준
Q1에서 **1~2단계** (기반 구축 + 아키텍처)를 선택했지만, Q8에서 **WCAG 2.1 AA + PWA + 모바일 최적화**를 선택했습니다.
Research 로드맵에서 WCAG/PWA는 **4단계** 범위입니다. 1~2단계 범위 내에서 4단계 수준의 UX를 구현하면 전체 작업량이 크게 증가합니다.

### Clarification Question 1
UX/접근성 관련 의도를 명확히 해주세요.

A) 1~2단계 범위 유지 — UX는 B(중간: 반응형 + 다크 모드 + 로딩 상태)로 조정, WCAG/PWA는 다음 프로젝트로 연기
B) 범위 확장 — 1~2단계 + UX 현대화(4단계)를 이번에 함께 진행
C) UX를 별도 트랙으로 — 1~2단계 먼저 완료 후, 같은 프로젝트 내에서 UX를 후속 단계로 진행
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Contradiction 2: 구현 범위 vs 실시간 기능 요구 수준
Q1에서 **1~2단계**를 선택했지만, Q5에서 **고급 실시간 기능** (대시보드 + 토스트 + 알림 벨 + 이메일 알림)을 선택했습니다.
이메일 알림은 외부 이메일 서비스 연동이 필요하고, 알림 시스템 전체는 Research 로드맵 2~3단계에 걸쳐있습니다.

### Clarification Question 2
실시간/알림 기능의 범위를 명확히 해주세요.

A) 2단계 범위에 맞게 조정 — SSE 기반 실시간 대시보드 + 인앱 토스트 알림만 (이메일 알림은 제외)
B) 이메일 알림 포함 — 외부 이메일 서비스(SES 등) 연동까지 이번에 구현
C) Other (please describe after [Answer]: tag below)

[Answer]: B로 조정

## Ambiguity 1: 대규모 사용자 + 1~2단계 범위
Q7에서 **동시 사용자 1000명+**를 선택했습니다. 이 규모를 지원하려면 인프라 설계(캐싱, 로드밸런싱, DB 커넥션 풀링 등)가 중요한데, 이는 담당자별 질문(Infra)에서 다룰 예정입니다.

### Clarification Question 3
1000명+ 동시 사용자는 현재 목표인가요, 아니면 향후 확장 가능성을 고려한 것인가요?

A) 현재 목표 — 출시 시점부터 1000명+ 동시 사용자 지원 필요
B) 향후 목표 — 현재는 중규모(~500명)로 시작하되, 아키텍처는 1000명+ 확장 가능하게 설계
C) Other (please describe after [Answer]: tag below)

[Answer]: B
