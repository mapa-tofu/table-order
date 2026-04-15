# 컴포넌트 정의 (Components)

## 프로젝트 구조 개요

```
table-order/                    # 모노레포 루트
├── client/                     # React 단일 앱 (고객 + 관리자)
├── server/
│   ├── customer-api/           # 고객용 Express 서버
│   └── admin-api/              # 관리자용 Express 서버
├── shared/                     # 공유 타입/유틸리티
└── aidlc-docs/                 # 문서 (코드 아님)
```

---

## 1. 프론트엔드 컴포넌트

### 1.1 Client App (단일 React 앱)
- **위치**: `client/`
- **기술**: React + TypeScript + Vite
- **책임**: 고객 UI와 관리자 UI를 라우팅으로 분리하여 제공

#### 1.1.1 고객 모듈 (Customer Module)
| 컴포넌트 | 책임 |
|---|---|
| TableAuth | 테이블 자동 로그인 및 초기 설정 화면 |
| MenuBrowser | 카테고리별 메뉴 조회 및 탐색 |
| Cart | 장바구니 관리 (추가/삭제/수량/총액) |
| OrderCreate | 주문 확인 및 확정 처리 |
| OrderHistory | 현재 세션 주문 내역 조회 및 실시간 상태 |

#### 1.1.2 관리자 모듈 (Admin Module)
| 컴포넌트 | 책임 |
|---|---|
| AdminAuth | 관리자 로그인 화면 |
| OrderDashboard | 실시간 주문 모니터링 대시보드 (그리드 레이아웃) |
| TableManager | 테이블 설정, 주문 삭제, 이용 완료, 과거 내역 |
| MenuManager | 메뉴 CRUD, 이미지 업로드, 순서 조정 |

#### 1.1.3 공통 프론트엔드 컴포넌트
| 컴포넌트 | 책임 |
|---|---|
| SSEProvider | SSE 연결 관리 및 이벤트 분배 |
| AuthContext | 인증 상태 관리 (JWT 토큰, 세션) |
| CartContext | 장바구니 상태 관리 (로컬 저장소 연동) |
| ApiClient | HTTP 요청 래퍼 (인증 헤더 자동 첨부) |

---

## 2. 백엔드 컴포넌트

### 2.1 Customer API Server
- **위치**: `server/customer-api/`
- **기술**: Node.js + Express + TypeScript
- **책임**: 고객 대상 API 제공 (메뉴 조회, 주문 생성, 주문 내역)

| 컴포넌트 | 책임 |
|---|---|
| TableAuthRouter | 테이블 인증 API 라우터 |
| MenuRouter | 메뉴 조회 API 라우터 |
| OrderRouter | 주문 생성/조회 API 라우터 |
| SSERouter | 고객용 SSE 엔드포인트 |
| TableAuthMiddleware | 테이블 JWT 토큰 검증 미들웨어 |

### 2.2 Admin API Server
- **위치**: `server/admin-api/`
- **기술**: Node.js + Express + TypeScript
- **책임**: 관리자 대상 API 제공 (주문 관리, 테이블 관리, 메뉴 관리)

| 컴포넌트 | 책임 |
|---|---|
| AdminAuthRouter | 관리자 인증 API 라우터 |
| OrderManageRouter | 주문 모니터링/상태변경/삭제 API 라우터 |
| TableManageRouter | 테이블 설정/이용완료/과거내역 API 라우터 |
| MenuManageRouter | 메뉴 CRUD API 라우터 |
| SSERouter | 관리자용 SSE 엔드포인트 |
| AdminAuthMiddleware | 관리자 JWT 토큰 검증 미들웨어 |
| FileUploadMiddleware | 이미지 업로드 처리 미들웨어 |

### 2.3 공유 백엔드 컴포넌트
- **위치**: `server/shared/` 또는 `shared/`

| 컴포넌트 | 책임 |
|---|---|
| Database | PostgreSQL 연결 관리 (ORM 설정) |
| Models | ORM 모델 정의 (Store, Table, Menu, Order 등) |
| SSEManager | SSE 연결 풀 관리 및 이벤트 브로드캐스트 |
| AuthService | JWT 토큰 생성/검증 공통 로직 |
| FileService | S3 이미지 업로드/삭제 서비스 |

---

## 3. 데이터 계층 컴포넌트

### 3.1 ORM 모델
| 모델 | 책임 |
|---|---|
| Store | 매장 정보 관리 |
| StoreAdmin | 매장 관리자 계정 |
| TableEntity | 테이블 정보 및 세션 관리 |
| Category | 메뉴 카테고리 |
| MenuItem | 메뉴 항목 정보 |
| Order | 주문 정보 |
| OrderItem | 주문 항목 (메뉴-수량) |
| OrderHistory | 과거 주문 이력 (이용 완료 후) |
| TableSession | 테이블 세션 추적 |
