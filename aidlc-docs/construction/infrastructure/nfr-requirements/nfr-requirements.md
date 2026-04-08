# NFR Requirements — Infrastructure Unit

## 개요
Infrastructure Unit의 비기능 요구사항을 정의합니다.
role-specific-questions 답변(EC2+CDK, GitHub Actions CI/CD, Redis 미도입)과
requirements.md(NFR-01~05), Security Baseline(SECURITY-01~15)을 기반으로 평가합니다.

---

## 1. 성능 (NFR-01)

### 인프라 레벨 성능 요구사항

| 항목 | 요구사항 | 인프라 대응 |
|---|---|---|
| API 응답 p95 | < 500ms | EC2 인스턴스 사이징, Nginx 프록시 최적화 |
| 대시보드 로딩 | < 3초 | 정적 파일 캐싱 (Nginx), gzip 압축 |
| 동시 사용자 | ~500명 (현재), 1000명+ (확장 목표) | EC2 인스턴스 타입 선정, PM2 클러스터 모드 |
| DB 연결 | 커넥션 풀링 | PostgreSQL 커넥션 풀 설정 (max_connections) |
| 정적 파일 | 빠른 서빙 | Nginx 정적 파일 캐싱, Cache-Control 헤더 |

### 인프라 성능 설계 결정
- **EC2 인스턴스**: t3.medium 이상 (2 vCPU, 4GB RAM) — 500명 동시 사용자 기준
- **Nginx**: worker_processes auto, keepalive, gzip 활성화
- **PM2**: 클러스터 모드 (CPU 코어 수만큼 워커)
- **PostgreSQL**: RDS 또는 EC2 내 설치, 커넥션 풀 20~50

---

## 2. 보안 (NFR-02 / Security Baseline)

### 인프라 레벨 보안 요구사항

| SECURITY Rule | 인프라 대응 | 우선순위 |
|---|---|---|
| SECURITY-01: 암호화 | RDS 저장 암호화 + TLS 연결 강제 | Must |
| SECURITY-02: 접근 로깅 | Nginx 접근 로그 → CloudWatch Logs | Must |
| SECURITY-04: 보안 헤더 | Nginx에서 추가 보안 헤더 설정 (Backend 미들웨어와 이중) | Should |
| SECURITY-07: 네트워크 | Security Group: 80/443만 공개, DB/SSH는 내부만, 0.0.0.0/0 제한 | Must |
| SECURITY-09: 하드닝 | 시크릿 매니저(SSM Parameter Store)로 JWT_SECRET/DB 비밀번호 관리 | Must |
| SECURITY-10: 공급망 | CI/CD에서 의존성 취약점 스캔 (npm audit) | Must |
| SECURITY-12: 인증 관리 | 시크릿 외부화 (환경 변수 → SSM) | Must |
| SECURITY-13: 무결성 | CI/CD 파이프라인 접근 제어, 빌드 아티팩트 검증 | Should |
| SECURITY-14: 모니터링 | CloudWatch 알람 (CPU, 메모리, 5xx 에러율) | Should |

### 네트워크 보안 설계
```
Internet
    |
    v
[ALB or Nginx on EC2] — Port 80/443 only (0.0.0.0/0)
    |
    v
[Application EC2] — Port 3000 (Security Group: ALB/Nginx만 허용)
    |
    v
[PostgreSQL RDS] — Port 5432 (Security Group: App EC2만 허용)
```

### 시크릿 관리
- `JWT_SECRET` → AWS SSM Parameter Store (SecureString)
- `DATABASE_URL` → AWS SSM Parameter Store (SecureString)
- `SES_FROM_EMAIL` → 환경 변수 (비밀 아님)
- 기타 환경 변수 → CDK에서 EC2 UserData 또는 .env 파일로 주입

---

## 3. 확장성 (NFR-03)

### 인프라 레벨 확장성 요구사항

| 항목 | 현재 | 목표 | 인프라 대응 |
|---|---|---|---|
| 서버 | 단일 EC2 | 수평 확장 가능 | Stateless 설계, 세션은 DB 기반 |
| DB | SQLite (단일 파일) | PostgreSQL (다중 연결) | RDS 또는 EC2 내 PostgreSQL |
| 캐싱 | 없음 | 인메모리 (Redis 미도입) | Node.js 인메모리 캐시 (node-cache 등) |
| Rate Limiting | 없음 | 요청 제한 | 인메모리 기반 (express-rate-limit) |
| SSE | 없음 | 실시간 대시보드 | 단일 인스턴스 내 인메모리 관리 |

### Redis 미도입에 따른 대안
- **Rate Limiting**: express-rate-limit (인메모리) — 단일 인스턴스에서는 충분
- **세션**: JWT 기반 stateless — 서버 사이드 세션 저장소 불필요
- **캐싱**: node-cache 또는 lru-cache — 인스턴스별 로컬 캐시
- **SSE pub/sub**: 인메모리 EventEmitter — 단일 인스턴스에서는 충분
- **제약**: 수평 확장(다중 인스턴스) 시 Redis 도입 필요

---

## 4. 가용성 (NFR-05)

### 인프라 레벨 가용성 요구사항

| 항목 | 요구사항 | 인프라 대응 |
|---|---|---|
| 배포 중단 | 최소화 | PM2 reload (zero-downtime), CI/CD 자동 배포 |
| DB 마이그레이션 | 데이터 무결성 보장 | 마이그레이션 스크립트 + 롤백 절차 |
| 프로세스 관리 | 자동 재시작 | PM2 (crash 시 자동 재시작) |
| SSL | HTTPS 강제 | Nginx SSL 설정 (Let's Encrypt 또는 ACM) |
| 백업 | DB 백업 | RDS 자동 백업 또는 pg_dump 스케줄 |

---

## 5. 유지보수성 (NFR-04)

### 인프라 레벨 유지보수성 요구사항

| 항목 | 요구사항 | 인프라 대응 |
|---|---|---|
| IaC | 인프라 코드화 | AWS CDK (TypeScript) |
| CI/CD | 자동화된 빌드/배포 | GitHub Actions (staging → production) |
| 로그 수집 | 중앙화된 로깅 | CloudWatch Logs (Nginx + App 로그) |
| 모니터링 | 운영 메트릭 | CloudWatch 대시보드 + 알람 |
| 환경 분리 | staging / production | CDK 환경별 스택 분리 |

---

## 6. CI/CD 파이프라인 요구사항

### GitHub Actions 워크플로우

| 워크플로우 | 트리거 | 단계 |
|---|---|---|
| CI (빌드+테스트) | PR to main | lint → type-check → test → build → npm audit |
| CD (staging) | merge to main | CI + deploy to staging EC2 |
| CD (production) | manual approval 또는 tag | staging 검증 후 production EC2 배포 |

### 파이프라인 보안 (SECURITY-10, SECURITY-13)
- GitHub Secrets로 AWS 자격 증명 관리
- npm audit으로 의존성 취약점 스캔
- 빌드 아티팩트 무결성 검증
- 파이프라인 정의 변경 시 PR 리뷰 필수
