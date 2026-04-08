# 기술 스택 트렌드 2025-2026

## 요약

TypeScript 풀스택 생태계가 크게 성숙했습니다. Zod 검증을 활용한 tRPC가 내부 TypeScript 모노레포 API의 주류 패턴으로, 코드 생성 없이 엔드투엔드 타입 안전성을 제공합니다. PostgreSQL이 가장 인기 있는 데이터베이스로 MySQL을 추월했습니다(개발자의 49%, Stack Overflow 2024). SQLite는 단일 writer 제한으로 프로덕션 전자상거래에 부적합합니다. Prisma 7(Rust 제거, 순수 TypeScript)이 선도적인 ORM입니다. Redis는 캐싱 및 pub/sub의 표준으로 유지됩니다.

---

## 1. 데이터베이스: SQLite → PostgreSQL 마이그레이션

### SQLite를 교체해야 하는 이유

SQLite의 단일 writer 아키텍처는 프로덕션 전자상거래의 하드 블로커입니다:

| 제한사항 | Inventrix에 미치는 영향 |
|---|---|
| 한 번에 하나의 writer만 가능 | 결제 + 백그라운드 작업이 서로 대기열에 쌓임 |
| 동시 연결 불가 | 수평 확장 불가 |
| 행 수준 잠금 없음 | 부하 시 재고 경쟁 조건 |
| 파일 기반 | 관리형 클라우드 DB 서비스 사용 불가 |
| 고급 기능 없음 | 전문 검색, JSON 연산, 행 수준 보안 없음 |

**경험 법칙**: 동시에 1명 이상의 사용자가 쓰기를 하거나, 10GB 이상의 데이터가 있거나, 고급 기능이 필요할 때 PostgreSQL로 마이그레이션하세요.

### 마이그레이션 전략 (무중단)

```
1단계: 이중 쓰기 (SQLite 주 + PostgreSQL 보조)
2단계: 데이터 동등성 검증 (24-48시간)
3단계: 읽기를 PostgreSQL로 전환
4단계: PostgreSQL을 주로 설정, SQLite 쓰기 중단
5단계: 7일 안정 운영 후 정리
```

**도구**: `pgloader` (자동 SQLite → PostgreSQL 마이그레이션), `sequel` gem, 또는 Prisma의 내장 마이그레이션 시스템.

### 2025년의 PostgreSQL

- **가장 인기 있는 데이터베이스**: 개발자의 49% (Stack Overflow 2024), 2년 연속 1위
- **관계형 DB 시장 점유율 16.85%** — MySQL에 이어 2위
- **조직의 96%**가 오픈소스 소프트웨어 사용을 늘리거나 유지 (OpenLogic 2025)
- **Prisma 7** (2026년 1월): Rust 제거 순수 TypeScript 런타임, 더 빠른 타입 생성, 아티팩트가 `node_modules` 밖으로 이동

### Inventrix 권장사항

1. **즉시 PostgreSQL로 마이그레이션** — SQLite가 가장 큰 기술적 위험
2. 타입 안전 쿼리 및 스키마 마이그레이션을 위한 **Prisma ORM** 사용
3. 서버리스/고동시성을 위한 PgBouncer 또는 Prisma Accelerate를 통한 **연결 풀링** 활성화
4. 경량 실시간 이벤트를 위한 **PostgreSQL LISTEN/NOTIFY** 사용

---

## 2. API 설계: REST vs. GraphQL vs. tRPC

### 2025/2026 합의

| API 스타일 | 적합한 경우 | 피해야 할 경우 |
|---|---|---|
| **REST** | 공개 API, 모바일 클라이언트, 다중 언어 팀 | TypeScript 모노레포 내부 API |
| **GraphQL** | 복잡한 데이터 요구사항, 다중 클라이언트 유형, 공개 API | 단순 CRUD, 적극적 HTTP 캐싱 필요 시 |
| **tRPC** | TypeScript 전용 풀스택 앱, 내부 도구, 대시보드 | 공개 API, 비TypeScript 클라이언트 |
| **gRPC** | 고성능 서비스 간 통신, 다중 언어 마이크로서비스 | 브라우저 전용 클라이언트, 소규모 팀 |

**핵심 인사이트**: 모노레포의 Vite+React+TypeScript 프론트엔드 + Node.js+TypeScript 백엔드의 경우, **tRPC가 REST보다 확실히 우수합니다** — API 문서 불필요, TypeScript 자체가 문서, DB 스키마에서 UI 컴포넌트까지 컴파일 타임 안전성.

### 2025년의 tRPC

- **tRPC v11**: 네이티브 React Server Components 지원
- **TanStack Start + tRPC**: 새로운 풀스택 메타로 부상
- **패턴**: tRPC + Zod (검증) + Prisma (DB) = 엔드투엔드 타입 안전성
- **React Query 통합**: 내장 캐싱, 낙관적 업데이트, 재시도 로직

```typescript
// 서버: 프로시저 정의
export const appRouter = t.router({
  orders: t.router({
    list: t.procedure
      .input(z.object({ status: z.enum(['pending','shipped','delivered']).optional() }))
      .query(({ input }) => db.order.findMany({ where: input })),
    create: t.procedure
      .input(orderCreateSchema)
      .mutation(({ input }) => orderService.create(input)),
  }),
});

// 클라이언트: 완전한 타입 지정, API 문서 불필요
const { data } = trpc.orders.list.useQuery({ status: 'pending' });
```

### Inventrix 권장사항

1. 모든 내부 프론트엔드↔백엔드 통신을 **Express REST에서 tRPC로 마이그레이션**
2. 웹훅(배송사 콜백, 결제 게이트웨이 이벤트) 및 향후 공개 API에만 **얇은 REST 레이어** 유지
3. 모든 입력 검증에 **Zod** 사용 — 프론트엔드 폼과 백엔드 프로시저 간 스키마 공유
4. 클라이언트 측 캐싱 및 낙관적 업데이트를 위한 **React Query** (tRPC 경유) 사용

---

## 3. React 패턴: Server Components 및 Suspense

### 2025년의 React Server Components (RSC)

RSC는 데이터 페칭을 서버로 이동시켜 클라이언트 번들 크기를 줄이고 워터폴 요청을 제거합니다:

```typescript
// Server Component — 서버에서 실행, 클라이언트 JS 없음
async function OrderList() {
  const orders = await db.order.findMany(); // 직접 DB 접근, API 호출 없음
  return <OrderTable orders={orders} />;
}

// Client Component — 인터랙티브, 브라우저에서 실행
'use client';
function OrderStatusBadge({ status }: { status: string }) {
  const [expanded, setExpanded] = useState(false);
  return <button onClick={() => setExpanded(!expanded)}>{status}</button>;
}
```

**Inventrix에 대한 이점**:
- 대시보드 페이지 로딩 속도 향상 (서버 측 데이터 페칭)
- 더 작은 JS 번들 (무거운 데이터 처리가 서버에 유지)
- 공개 페이지의 더 나은 SEO

### Suspense 및 스트리밍

```typescript
// 대시보드 섹션을 독립적으로 스트리밍
<Suspense fallback={<MetricsSkeleton />}>
  <RevenueMetrics />      {/* 독립적으로 로드 */}
</Suspense>
<Suspense fallback={<OrdersSkeleton />}>
  <RecentOrders />        {/* 독립적으로 로드 */}
</Suspense>
```

### Inventrix 권장사항

1. **데이터 집중 페이지**에 RSC 채택 (대시보드, 주문 목록, 재고 목록)
2. 대시보드 위젯의 점진적 로딩을 위한 **Suspense 경계** 사용
3. 인터랙티브 요소(폼, 실시간 업데이트, 드래그 앤 드롭)에는 **클라이언트 컴포넌트** 유지
4. 타입 안전 서버 측 데이터 페칭을 위한 **tRPC와 RSC** 사용

---

## 4. Redis를 활용한 캐싱 전략

### 전자상거래를 위한 캐싱 레이어

```
브라우저 캐시 (정적 자산, CDN)
    ↓
Redis 캐시 (API 응답, 세션, 실시간 데이터)
    ↓
PostgreSQL (진실의 원천)
```

### Redis에 캐싱할 데이터

| 데이터 | TTL | 전략 |
|---|---|---|
| 상품 카탈로그 | 5-15분 | Cache-aside, 업데이트 시 무효화 |
| 사용자 세션 | 24시간 | Write-through |
| 재고 수량 (읽기) | 30초 | pub/sub 무효화가 포함된 Cache-aside |
| 대시보드 집계 | 1-5분 | 백그라운드 갱신 |
| 요청 제한 카운터 | 1분 | 원자적 증가 |
| 실시간 알림 | 해당 없음 | Pub/Sub 채널 |

### Redis 패턴

```typescript
// Prisma를 사용한 Cache-aside 패턴
async function getProduct(id: string) {
  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  const product = await prisma.product.findUnique({ where: { id } });
  await redis.set(`product:${id}`, JSON.stringify(product), { ex: 900 }); // 15분 TTL
  return product;
}

// 실시간 재고 업데이트를 위한 Pub/Sub
await redis.publish('inventory:updated', JSON.stringify({ sku, quantity }));
```

### Inventrix 권장사항

1. 필수 인프라 의존성으로 **Redis 추가**
2. 상품 카탈로그, 대시보드 집계, 세션 데이터 캐싱
3. 실시간 재고 및 주문 상태 알림을 위한 Redis **pub/sub** 사용
4. Redis 원자적 카운터를 사용한 API 엔드포인트 **요청 제한** 구현

---

## 5. 인증: OAuth 2.0 및 패스키

### 2025 인증 환경

- **패스키 (WebAuthn)**: 비밀번호 대체 — 피싱 방지, 생체 인증 기반, 모든 주요 브라우저/OS 지원
- **OAuth 2.0 + PKCE**: 서드파티 인증(Google, GitHub SSO)의 표준
- **JWT와 리프레시 토큰**: 단기 액세스 토큰(15분) + 장기 리프레시 토큰(7-30일)을 httpOnly 쿠키에 저장
- **세션 기반 인증**: 서버 렌더링 앱에 여전히 유효; 모놀리스에서 JWT보다 단순

### 패스키 도입 현황

- iOS 16+, Android 9+, Windows 11, macOS Ventura+에서 지원
- **FIDO2/WebAuthn** 표준 — 비밀번호 저장 없음, 피싱 위험 없음
- 라이브러리: `@simplewebauthn/server`, `@simplewebauthn/browser`

### Inventrix 권장사항

1. JWT 리프레시 토큰 로테이션이 포함된 httpOnly 쿠키를 사용하도록 **현재 인증 업그레이드**
2. Google/GitHub SSO를 위한 **OAuth 2.0** 추가 (`passport.js` 또는 `better-auth` 사용)
3. 관리자 사용자를 위한 2단계 개선으로 **패스키 지원 계획**
4. 관리자 계정을 위한 **MFA** 구현 (`otplib`를 통한 TOTP)

---

## 6. TypeScript 모범 사례 (2025)

### 주요 패턴

```typescript
// 엄격 모드 — 항상 활성화
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}

// 런타임 검증 + 타입 추론을 위한 Zod
const OrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    skuId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
});
type Order = z.infer<typeof OrderSchema>; // 스키마에서 타입 파생

// 예외 던지기 대신 Result 타입
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

### Inventrix 권장사항

1. 전체 코드베이스에 **엄격한 TypeScript** 활성화
2. 모든 외부 데이터 검증(API 입력, 웹훅 페이로드, 환경 변수)에 **Zod** 사용
3. `orderId`와 `customerId` 혼동 방지를 위한 **브랜드 타입** 채택
4. 타입 확장 없이 타입 검사를 받기 위한 설정 객체에 **`satisfies` 연산자** 사용

---

## 출처

- Stack Overflow Developer Survey 2024 (PostgreSQL 1위 데이터베이스)
- InfoQ, "Prisma 7: Rust-Free Architecture and Performance Gains" (2026년 1월)
- dev.to, "REST vs GraphQL vs tRPC vs gRPC in 2026: The Definitive Guide"
- Directus, "REST vs. GraphQL vs. tRPC: Choosing Your API Architecture"
- tRPC docs, "Set up with React Server Components"
- Upstash, "Caching Prisma Queries with Upstash Redis"
- Render, "How to migrate from SQLite to PostgreSQL" (2025년 11월)
- Yugabyte, "Why PostgreSQL Remains the Top Choice for Developers in 2025"
- noqta.tn, "Building a Production-Ready API with tRPC, Prisma, and Next.js" (2026)
