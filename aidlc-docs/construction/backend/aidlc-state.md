# AI-DLC State — Unit 1: Backend

## Unit Information
- **Unit Name**: Backend
- **Package**: `packages/api`
- **담당자**: Backend 담당자
- **Parent State**: `aidlc-docs/aidlc-state.md`
- **Start Date**: (담당자 시작 시 기록)
- **Current Stage**: CONSTRUCTION 대기 — role-specific-questions 답변 후 시작

## 참조 문서
- **Cross-Unit Contracts**: `aidlc-docs/inception/application-design/cross-unit-contracts.md`
- **Application Design**: `aidlc-docs/inception/application-design/`
- **Requirements**: `aidlc-docs/inception/requirements/requirements.md`
- **User Stories**: `aidlc-docs/inception/user-stories/stories.md`
- **Personas**: `aidlc-docs/inception/user-stories/personas.md`

## 사전 작업
- [x] `role-specific-questions-backend.md` 답변 완료
- [x] `backend-construction-questions.md` 답변 완료

## Extension Configuration
| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | Yes | Requirements Analysis |

## 기술 결정 요약
- **DB**: PostgreSQL + Prisma ORM
- **API**: Express REST 개선 (Service/Repository + Zod)
- **테스트**: ESLint + Prettier + Vitest
- **JWT**: Access 15분 + Refresh 7일
- **로깅**: Pino

## Stage Progress
- [x] Functional Design
- [x] NFR Requirements
- [ ] NFR Design
- [ ] NFR Requirements
- [ ] NFR Design
- [ ] Infrastructure Design — Skip 가능 (Unit 3 주 담당)
- [ ] Code Generation
- [ ] Build and Test
