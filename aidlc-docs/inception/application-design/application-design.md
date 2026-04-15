# Application Design — 통합 문서

## 1. 아키텍처 개요

| 항목 | 결정 |
|---|---|
| 프론트엔드 | 단일 React 앱 (고객/관리자 라우팅 분리) |
| 백엔드 | 분리된 Express 서버 (Customer API + Admin API) |
| 데이터베이스 | PostgreSQL + ORM (TypeORM/Prisma) |
| 언어 | TypeScript (프론트엔드 + 백엔드) |
| 저장소 구조 | 모노레포 (client/ + server/ + shared/) |
| 실시간 통신 | SSE (Server-Sent Events) |
| 인증 | JWT 토큰 기반 |
| 파일 저장 | AWS S3 |

## 2. 프로젝트 구조

```
table-order/
├── client/                          # React 단일 앱
│   ├── src/
│   │   ├── customer/                # 고객 모듈
│   │   │   ├── TableAuth/
│   │   │   ├── MenuBrowser/
│   │   │   ├── Cart/
│   │   │   ├── OrderCreate/
│   │   │   └── OrderHistory/
│   │   ├── admin/                   # 관리자 모듈
│   │   │   ├── AdminAuth/
│   │   │   ├── OrderDashboard/
│   │   │   ├── TableManager/
│   │   │   └── MenuManager/
│   │   ├── common/                  # 공통 컴포넌트
│   │   │   ├── SSEProvider/
│   │   │   ├── AuthContext/
│   │   │   ├── CartContext/
│   │   │   └── ApiClient/
│   │   └── App.tsx
│   └── package.json
├── server/
│   ├── customer-api/                # 고객용 Express 서버
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── admin-api/                   # 관리자용 Express 서버
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   └── package.json
│   └── shared/                      # 공유 서비스/모델
│       ├── src/
│       │   ├── services/
│       │   ├── models/
│       │   └── utils/
│       └── package.json
├── shared/                          # 공유 타입 정의
│   └── types/
└── package.json                     # 모노레포 루트
```

## 3. 컴포넌트 요약

- **프론트엔드**: 고객 모듈 5개 + 관리자 모듈 4개 + 공통 4개
- **백엔드**: Customer API (5 라우터) + Admin API (7 라우터)
- **서비스**: AuthService, MenuService, OrderService, TableService, SSEManager, FileService
- **ORM 모델**: Store, StoreAdmin, TableEntity, Category, MenuItem, Order, OrderItem, OrderHistory, TableSession

## 4. API 엔드포인트 요약

- Customer API: 6개 엔드포인트 (인증 1, 메뉴 2, 주문 2, SSE 1)
- Admin API: 14개 엔드포인트 (인증 1, 주문 3, 테이블 4, 메뉴 5, SSE 1)

## 5. 핵심 설계 결정

1. **단일 React 앱**: 고객/관리자 UI를 라우팅으로 분리하여 코드 공유 극대화
2. **분리된 백엔드 서버**: 고객 API와 관리자 API를 독립 배포 가능하게 분리
3. **공유 서비스 레이어**: 비즈니스 로직을 서비스로 추출하여 두 API 서버에서 공유
4. **SSE 기반 실시간**: WebSocket 대비 단순한 SSE로 실시간 통신 구현
5. **ORM 사용**: 타입 안전성과 마이그레이션 관리를 위해 ORM 채택

## 6. 상세 문서 참조

- 컴포넌트 정의: [components.md](components.md)
- 메서드 시그니처: [component-methods.md](component-methods.md)
- 서비스 설계: [services.md](services.md)
- 의존성 관계: [component-dependency.md](component-dependency.md)
