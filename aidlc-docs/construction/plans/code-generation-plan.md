# Code Generation 계획 — 전체 유닛 통합

> 의존성 순서: Phase 0 (공통 기반) → Unit 2-A (Shared & Customer) → Unit 2-B (Admin) → Unit 1 (Frontend)
> 단일 Express 서버 통합 구조 (infrastructure-design 결정 반영)

---

## 유닛 컨텍스트

### 프로젝트 정보
- **타입**: Greenfield (모노레포)
- **워크스페이스 루트**: `table-order/`
- **코드 위치**: `table-order/` (절대 `aidlc-docs/`에 코드 생성하지 않음)

### 스토리 매핑
| 유닛 | 담당 스토리 |
|---|---|
| Unit 2-A | US-C01, US-C02, US-C04, US-C05 (공유 서비스 + Customer API) |
| Unit 2-B | US-A01, US-A02, US-A03, US-A04 (Admin API) |
| Unit 1 | 전체 9개 스토리 UI (US-C01~C05, US-A01~A04) |

### 기술 스택 (확정)
- Node.js 20.x + Express 4.x + TypeScript 5.x
- Sequelize 6.x + PostgreSQL 15.x
- React 18.x + Vite 5.x + Zustand 4.x + CSS Modules
- Jest 29.x + fast-check (PBT)
- winston + ESLint + Prettier + swagger-jsdoc

---

## 코드 생성 단계

### Phase 0: 프로젝트 기반 설정

- [x] **Step 1**: 모노레포 루트 설정
  - `table-order/package.json` (workspaces, scripts)
  - `table-order/tsconfig.base.json` (공유 TypeScript 설정)
  - `table-order/.eslintrc.json`, `table-order/.prettierrc`
  - `table-order/.gitignore`, `table-order/.env.example`

- [x] **Step 2**: 공유 타입 정의
  - `table-order/shared/types/index.ts` (도메인 엔티티 타입, API 요청/응답 타입, SSE 이벤트 타입)

### Phase 1: Unit 2-A — Shared Layer + Customer API

- [x] **Step 3**: 서버 패키지 설정
  - `table-order/server/package.json` (의존성, scripts)
  - `table-order/server/tsconfig.json` (extends base)
  - `table-order/server/jest.config.ts`

- [x] **Step 4**: 데이터베이스 설정 + ORM 모델
  - `table-order/server/src/shared/database.ts` (Sequelize 연결, 커넥션 풀)
  - `table-order/server/src/shared/models/index.ts` (모델 등록, 관계 설정)
  - `table-order/server/src/shared/models/Store.ts`
  - `table-order/server/src/shared/models/StoreAdmin.ts`
  - `table-order/server/src/shared/models/TableEntity.ts`
  - `table-order/server/src/shared/models/TableSession.ts`
  - `table-order/server/src/shared/models/Category.ts`
  - `table-order/server/src/shared/models/MenuItem.ts`
  - `table-order/server/src/shared/models/Order.ts`
  - `table-order/server/src/shared/models/OrderItem.ts`
  - `table-order/server/src/shared/models/OrderHistory.ts`
  - 스토리: US-C01, US-C02, US-C04, US-C05, US-A01~A04 (전체 데이터 모델)

- [x] **Step 5**: 공유 유틸리티 + 에러 처리
  - `table-order/server/src/shared/utils/errors.ts` (에러 클래스 체계: ValidationError, AuthenticationError 등)
  - `table-order/server/src/shared/utils/logger.ts` (winston 설정)
  - `table-order/server/src/shared/utils/requestId.ts` (요청 ID 미들웨어)

- [x] **Step 6**: AuthService (인증 서비스)
  - `table-order/server/src/shared/services/AuthService.ts`
    - tableLogin(), adminLogin(), verifyToken(), generateToken()
  - 스토리: US-C01 (테이블 로그인), US-A01 (관리자 로그인)

- [x] **Step 7**: AuthService 단위 테스트
  - `table-order/server/src/shared/services/__tests__/AuthService.test.ts`
  - PBT: JWT 토큰 생성/검증 Round-trip, bcrypt 해싱/검증

- [x] **Step 8**: OrderService (주문 서비스)
  - `table-order/server/src/shared/services/OrderService.ts`
    - createOrder(), updateOrderStatus(), deleteOrder(), getActiveOrdersByStore(), getOrdersBySession()
  - 스토리: US-C04 (주문 생성), US-C05 (주문 조회), US-A02 (주문 모니터링)

- [x] **Step 9**: OrderService 단위 테스트
  - `table-order/server/src/shared/services/__tests__/OrderService.test.ts`
  - PBT: totalAmount 계산 Invariant, 주문 상태 전이 Idempotence

- [x] **Step 10**: TableService (테이블/세션 서비스)
  - `table-order/server/src/shared/services/TableService.ts`
    - setupTable(), completeTable(), getOrderHistory(), getTableSummary()
  - 스토리: US-A03 (테이블 관리)

- [x] **Step 11**: TableService 단위 테스트
  - `table-order/server/src/shared/services/__tests__/TableService.test.ts`
  - PBT: Order→OrderHistory 변환 Round-trip

- [x] **Step 12**: MenuService (메뉴 서비스)
  - `table-order/server/src/shared/services/MenuService.ts`
    - getMenusByStore(), createMenu(), updateMenu(), deleteMenu(), reorderMenus()
  - 스토리: US-C02 (메뉴 조회), US-A04 (메뉴 관리)

- [x] **Step 13**: MenuService 단위 테스트
  - `table-order/server/src/shared/services/__tests__/MenuService.test.ts`
  - PBT: sortOrder 재정렬 Invariant

- [x] **Step 14**: SSEManager (실시간 이벤트)
  - `table-order/server/src/shared/services/SSEManager.ts`
    - addClient(), removeClient(), broadcastToStore(), sendToTable()
    - 이벤트 버퍼링 (Last-Event-ID 지원)
  - 스토리: US-C05 (실시간 상태), US-A02 (실시간 모니터링)

- [x] **Step 15**: SSEManager 단위 테스트
  - `table-order/server/src/shared/services/__tests__/SSEManager.test.ts`
  - PBT: addClient/removeClient Stateful 테스트

- [x] **Step 16**: FileService (이미지 업로드)
  - `table-order/server/src/shared/services/FileService.ts`
    - uploadImage() (비동기 S3 업로드), deleteImage()
  - 스토리: US-A04 (메뉴 이미지)

- [x] **Step 17**: Customer API 미들웨어
  - `table-order/server/src/customer-api/middleware/tableAuth.ts` (테이블 JWT 검증)

- [x] **Step 18**: Customer API 라우터
  - `table-order/server/src/customer-api/routes/authRouter.ts` (POST /api/customer/auth/login)
  - `table-order/server/src/customer-api/routes/menuRouter.ts` (GET /api/customer/menus)
  - `table-order/server/src/customer-api/routes/orderRouter.ts` (POST/GET /api/customer/orders)
  - `table-order/server/src/customer-api/routes/sseRouter.ts` (GET /api/customer/sse)
  - `table-order/server/src/customer-api/index.ts` (라우터 통합)
  - 스토리: US-C01, US-C02, US-C04, US-C05

- [x] **Step 19**: Customer API 라우터 단위 테스트
  - `table-order/server/src/customer-api/routes/__tests__/authRouter.test.ts`
  - `table-order/server/src/customer-api/routes/__tests__/orderRouter.test.ts`

### Phase 2: Unit 2-B — Admin API

- [x] **Step 20**: Admin API 미들웨어
  - `table-order/server/src/admin-api/middleware/adminAuth.ts` (관리자 JWT 검증)
  - `table-order/server/src/admin-api/middleware/fileUpload.ts` (multer 설정)

- [x] **Step 21**: Admin API 라우터
  - `table-order/server/src/admin-api/routes/authRouter.ts` (POST /api/admin/auth/login)
  - `table-order/server/src/admin-api/routes/orderRouter.ts` (GET/PATCH/DELETE /api/admin/orders)
  - `table-order/server/src/admin-api/routes/tableRouter.ts` (POST/GET /api/admin/tables)
  - `table-order/server/src/admin-api/routes/menuRouter.ts` (GET/POST/PUT/DELETE /api/admin/menus)
  - `table-order/server/src/admin-api/routes/sseRouter.ts` (GET /api/admin/sse)
  - `table-order/server/src/admin-api/index.ts` (라우터 통합)
  - 스토리: US-A01, US-A02, US-A03, US-A04

- [x] **Step 22**: Admin API 라우터 단위 테스트
  - `table-order/server/src/admin-api/routes/__tests__/orderRouter.test.ts`
  - `table-order/server/src/admin-api/routes/__tests__/menuRouter.test.ts`
  - PBT: Admin JWT 검증 Invariant, 메뉴 이미지 교체 Invariant

- [x] **Step 23**: Express 앱 통합 + 헬스체크
  - `table-order/server/src/app.ts` (Express 앱 설정, 미들웨어, 라우터 마운트, 정적 파일 서빙)
  - `table-order/server/src/index.ts` (서버 시작, Graceful Shutdown)
  - swagger-jsdoc 설정 + /api-docs 엔드포인트
  - /health 헬스체크 엔드포인트

- [x] **Step 24**: 데이터베이스 마이그레이션 + Seed 데이터
  - `table-order/server/src/shared/database/migrations/` (Sequelize CLI 마이그레이션)
  - `table-order/server/src/shared/database/seeders/` (초기 매장, 관리자, 카테고리, 메뉴 데이터)
  - `.sequelizerc` (마이그레이션 경로 설정)

### Phase 3: Unit 1 — Frontend

- [ ] **Step 25**: 클라이언트 패키지 설정
  - `table-order/client/package.json` (의존성, scripts)
  - `table-order/client/tsconfig.json`
  - `table-order/client/vite.config.ts` (프록시 설정, CSS Modules)
  - `table-order/client/jest.config.ts`

- [ ] **Step 26**: Zustand 스토어 + API 클라이언트
  - `table-order/client/src/stores/authStore.ts` (useAuthStore — JWT, 로그인/로그아웃)
  - `table-order/client/src/stores/cartStore.ts` (useCartStore — 장바구니, localStorage persist)
  - `table-order/client/src/api/client.ts` (axios 인스턴스, 인터셉터)
  - 스토리: US-C01 (인증), US-C03 (장바구니)

- [ ] **Step 27**: Zustand 스토어 단위 테스트
  - `table-order/client/src/stores/__tests__/authStore.test.ts`
  - `table-order/client/src/stores/__tests__/cartStore.test.ts`
  - PBT: CartStore totalAmount Invariant, localStorage Round-trip

- [ ] **Step 28**: SSE Provider + 공통 컴포넌트
  - `table-order/client/src/common/SSEProvider.tsx` (EventSource 관리, useSSE 훅)
  - `table-order/client/src/common/ProtectedRoute.tsx` (인증 가드)
  - `table-order/client/src/App.tsx` (라우팅 설정)
  - `table-order/client/src/main.tsx` (엔트리포인트)
  - `table-order/client/index.html`

- [ ] **Step 29**: 고객 모듈 컴포넌트
  - `table-order/client/src/customer/TableAuth.tsx` + `.module.css`
  - `table-order/client/src/customer/MenuBrowser.tsx` + `.module.css`
  - `table-order/client/src/customer/Cart.tsx` + `.module.css`
  - `table-order/client/src/customer/OrderCreate.tsx` + `.module.css`
  - `table-order/client/src/customer/OrderSuccess.tsx` + `.module.css`
  - `table-order/client/src/customer/OrderHistory.tsx` + `.module.css`
  - 스토리: US-C01, US-C02, US-C03, US-C04, US-C05
  - data-testid 속성 포함

- [ ] **Step 30**: 관리자 모듈 컴포넌트
  - `table-order/client/src/admin/AdminAuth.tsx` + `.module.css`
  - `table-order/client/src/admin/OrderDashboard.tsx` + `.module.css`
  - `table-order/client/src/admin/TableManager.tsx` + `.module.css`
  - `table-order/client/src/admin/MenuManager.tsx` + `.module.css`
  - 스토리: US-A01, US-A02, US-A03, US-A04
  - data-testid 속성 포함

- [ ] **Step 31**: 프론트엔드 컴포넌트 단위 테스트
  - `table-order/client/src/customer/__tests__/MenuBrowser.test.tsx`
  - `table-order/client/src/customer/__tests__/Cart.test.tsx`
  - `table-order/client/src/admin/__tests__/OrderDashboard.test.tsx`

### Phase 4: 배포 산출물

- [x] **Step 32**: 배포 설정 파일
  - `table-order/ecosystem.config.js` (PM2 설정)
  - `table-order/server/src/shared/database/config.ts` (Sequelize CLI 설정)
  - `table-order/README.md` (프로젝트 설명, 설치/실행 가이드)

---

## 스토리 완료 추적

| 스토리 | 구현 단계 | 완료 |
|---|---|---|
| US-C01: 테이블 자동 로그인 | Step 6, 18, 26, 29 | [ ] |
| US-C02: 메뉴 조회 및 탐색 | Step 12, 18, 29 | [ ] |
| US-C03: 장바구니 관리 | Step 26, 29 | [ ] |
| US-C04: 주문 생성 | Step 8, 18, 29 | [ ] |
| US-C05: 주문 내역 조회 | Step 8, 14, 18, 29 | [ ] |
| US-A01: 매장 인증 | Step 6, 21, 30 | [ ] |
| US-A02: 실시간 주문 모니터링 | Step 8, 14, 21, 30 | [ ] |
| US-A03: 테이블 관리 | Step 10, 21, 30 | [ ] |
| US-A04: 메뉴 관리 | Step 12, 16, 21, 30 | [ ] |
