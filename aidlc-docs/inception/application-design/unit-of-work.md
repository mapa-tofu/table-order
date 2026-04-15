# Unit of Work 정의

## 유닛 구성 개요

| 유닛 | 담당자 | 범위 | 개발 순서 |
|---|---|---|---|
| Unit 1: Frontend | 프론트엔드 담당자 | React 클라이언트 앱 | 병렬 (OpenAPI 스펙 기반) |
| Unit 2-A: Backend - Shared & Customer API | 본인 (백엔드) | 공유 서비스/모델 + Customer API | 1순위 |
| Unit 2-B: Backend - Admin API | 본인 (백엔드) | Admin API | 2순위 (2-A 완료 후) |

---

## Unit 1: Frontend (프론트엔드)

### 범위
- **위치**: `client/`
- **기술**: React + TypeScript + Vite
- **담당자**: 프론트엔드 담당자

### 책임
- 고객 모듈: TableAuth, MenuBrowser, Cart, OrderCreate, OrderHistory
- 관리자 모듈: AdminAuth, OrderDashboard, TableManager, MenuManager
- 공통: SSEProvider, AuthContext, CartContext, ApiClient
- 라우팅 설정 (고객/관리자 분리)
- 로컬 저장소 관리 (장바구니, 인증 토큰)

### 입력 의존성
- OpenAPI 스펙 문서 (API 엔드포인트 및 요청/응답 타입)
- `shared/types/` 공유 타입 정의

### 산출물
- React 앱 전체 소스코드
- 프론트엔드 단위 테스트
- 프론트엔드 빌드 설정

---

## Unit 2-A: Backend — Shared & Customer API

### 범위
- **위치**: `server/shared/` + `server/customer-api/`
- **기술**: Node.js + Express + TypeScript + ORM
- **담당자**: 본인 (백엔드)

### 책임
- **공유 레이어 (server/shared/)**:
  - ORM 모델 정의 (Store, StoreAdmin, TableEntity, Category, MenuItem, Order, OrderItem, OrderHistory, TableSession)
  - 데이터베이스 연결 및 마이그레이션
  - AuthService (JWT 생성/검증, bcrypt)
  - OrderService (주문 생성/조회)
  - TableService (세션 관리)
  - MenuService (메뉴 조회)
  - SSEManager (연결 풀 관리, 이벤트 브로드캐스트)
  - FileService (S3 이미지 업로드)
- **Customer API (server/customer-api/)**:
  - TableAuthRouter (테이블 로그인)
  - MenuRouter (메뉴 조회)
  - OrderRouter (주문 생성/조회)
  - SSERouter (고객용 SSE)
  - TableAuthMiddleware (테이블 JWT 검증)
- **OpenAPI 스펙 문서 작성** (프론트엔드 계약)
- **Seed Data** (초기 매장/관리자/메뉴 데이터)

### 산출물
- 공유 서비스/모델 소스코드
- Customer API 소스코드
- OpenAPI 스펙 문서
- DB 마이그레이션 스크립트
- Seed 데이터 스크립트
- 단위 테스트 + PBT 테스트

---

## Unit 2-B: Backend — Admin API

### 범위
- **위치**: `server/admin-api/`
- **기술**: Node.js + Express + TypeScript
- **담당자**: 본인 (백엔드)

### 책임
- AdminAuthRouter (관리자 로그인)
- OrderManageRouter (주문 모니터링/상태변경/삭제)
- TableManageRouter (테이블 설정/이용완료/과거내역)
- MenuManageRouter (메뉴 CRUD)
- SSERouter (관리자용 SSE)
- AdminAuthMiddleware (관리자 JWT 검증)
- FileUploadMiddleware (이미지 업로드)

### 입력 의존성
- Unit 2-A의 공유 서비스/모델 (server/shared/)

### 산출물
- Admin API 소스코드
- OpenAPI 스펙 문서 (Admin 부분)
- 단위 테스트 + PBT 테스트

---

## 코드 조직 전략 (Greenfield)

```
table-order/
├── client/                          # Unit 1: Frontend
│   ├── src/
│   │   ├── customer/
│   │   ├── admin/
│   │   ├── common/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── shared/                      # Unit 2-A: Shared Layer
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── database.ts
│   │   └── package.json
│   ├── customer-api/                # Unit 2-A: Customer API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   └── package.json
│   └── admin-api/                   # Unit 2-B: Admin API
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── index.ts
│       └── package.json
├── shared/                          # 공유 타입 (프론트/백 공통)
│   └── types/
├── docs/
│   └── openapi/                     # OpenAPI 스펙
│       ├── customer-api.yaml
│       └── admin-api.yaml
├── package.json                     # 모노레포 루트
└── aidlc-docs/                      # 문서 (코드 아님)
```
