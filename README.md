# Table Order — 테이블오더 서비스

다중 매장 지원 디지털 테이블오더 플랫폼

## 기술 스택

- **백엔드**: Node.js 20 + Express + TypeScript + Sequelize
- **데이터베이스**: PostgreSQL 15
- **실시간**: SSE (Server-Sent Events)
- **인증**: JWT + bcrypt
- **테스트**: Jest + fast-check (PBT)

## 시작하기

### 사전 요구사항

- Node.js 20.x LTS
- PostgreSQL 15.x
- npm 10.x

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DB 접속 정보 수정

# 데이터베이스 생성
createdb table_order

# 서버 시작 (개발 모드 — 테이블 자동 동기화)
npm run dev

# Seed 데이터 삽입
npm run db:seed
```

### 개발 서버

```bash
npm run dev
```

- API 서버: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs
- 헬스체크: http://localhost:3000/health

### 테스트

```bash
npm test
```

### 빌드

```bash
npm run build
npm start
```

## 데모 계정

Seed 데이터 기준:

- **매장**: 데모 매장
- **관리자**: admin / admin1234
- **테이블 비밀번호**: 1234 (1~5번 테이블)

## API 엔드포인트

### Customer API (`/api/customer`)

| Method | Path | 설명 |
|--------|------|------|
| POST | /auth/login | 테이블 로그인 |
| GET | /menus | 메뉴 조회 |
| POST | /orders | 주문 생성 |
| GET | /orders | 주문 내역 조회 |
| GET | /sse | SSE 연결 |

### Admin API (`/api/admin`)

| Method | Path | 설명 |
|--------|------|------|
| POST | /auth/login | 관리자 로그인 |
| GET | /orders | 활성 주문 조회 |
| PATCH | /orders/:id/status | 주문 상태 변경 |
| DELETE | /orders/:id | 주문 삭제 |
| POST | /tables/setup | 테이블 설정 |
| POST | /tables/:id/complete | 이용 완료 |
| GET | /tables/:id/history | 과거 내역 |
| GET | /tables/summary | 테이블 요약 |
| GET | /menus | 메뉴 조회 |
| POST | /menus | 메뉴 등록 |
| PUT | /menus/:id | 메뉴 수정 |
| DELETE | /menus/:id | 메뉴 삭제 |
| PUT | /menus/reorder | 순서 재정렬 |
| GET | /sse | SSE 연결 |

## 프로젝트 구조

```
table-order/
├── server/src/
│   ├── shared/
│   │   ├── models/          # Sequelize ORM 모델
│   │   ├── services/        # 비즈니스 로직 서비스
│   │   ├── utils/           # 유틸리티 (에러, 로거)
│   │   └── database.ts      # DB 연결
│   ├── customer-api/        # 고객 API 라우터
│   ├── admin-api/           # 관리자 API 라우터
│   ├── app.ts               # Express 앱
│   └── index.ts             # 엔트리포인트
├── shared/types/            # 공유 TypeScript 타입
└── ecosystem.config.js      # PM2 설정
```
