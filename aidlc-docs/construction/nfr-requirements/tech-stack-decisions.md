# 기술 스택 결정 (Tech Stack Decisions)

---

## 1. 확정 기술 스택 요약

| 계층 | 기술 | 버전 기준 | 결정 근거 |
|---|---|---|---|
| **런타임** | Node.js | LTS (20.x) | 요구사항 확정 |
| **프레임워크 (백엔드)** | Express | 4.x | 요구사항 확정 |
| **프레임워크 (프론트엔드)** | React | 18.x | 요구사항 확정 |
| **빌드 도구** | Vite | 5.x | Application Design 확정 |
| **언어** | TypeScript | 5.x | Application Design 확정 (Q4:A) |
| **ORM** | Sequelize | 6.x | NFR Q7:A — Sequelize 확정 |
| **데이터베이스** | PostgreSQL | 15.x+ | 요구사항 확정 |
| **상태 관리** | Zustand | 4.x | NFR Q8:B — 경량 상태 관리 |
| **스타일링** | CSS Modules | — | NFR Q9:B — 컴포넌트 스코프 스타일 |
| **테스트** | Jest | 29.x | NFR Q10:B — 프론트/백 통합 |
| **로깅** | winston | 3.x | NFR Q11:A — 구조화된 로깅 |
| **린터** | ESLint | 8.x | NFR Q13:A — 표준 구성 |
| **포매터** | Prettier | 3.x | NFR Q13:A — 표준 구성 |
| **API 문서** | swagger-jsdoc + swagger-ui-express | — | NFR Q14:B — 코드 자동 생성 |
| **실시간 통신** | SSE (네이티브) | — | 요구사항 확정 |
| **인증** | jsonwebtoken (JWT) | — | 요구사항 확정 |
| **해싱** | bcrypt | — | 요구사항 확정 |
| **파일 업로드** | multer + AWS SDK (S3) | — | 요구사항 확정 |
| **배포** | AWS (EC2, RDS, S3) | — | 요구사항 확정 |

---

## 2. 주요 의존성 패키지

### 2.1 백엔드 공통 (server/shared)

| 패키지 | 용도 |
|---|---|
| `express` | HTTP 프레임워크 |
| `sequelize` | ORM |
| `pg` / `pg-hstore` | PostgreSQL 드라이버 |
| `jsonwebtoken` | JWT 생성/검증 |
| `bcrypt` | 비밀번호 해싱 |
| `winston` | 구조화된 로깅 |
| `helmet` | HTTP 보안 헤더 |
| `cors` | CORS 설정 |
| `compression` | 응답 압축 |
| `express-rate-limit` | API 요청 제한 |
| `express-validator` | 입력 검증 |
| `uuid` | UUID 생성 |
| `dotenv` | 환경 변수 로드 |
| `swagger-jsdoc` | OpenAPI 스펙 자동 생성 |
| `swagger-ui-express` | Swagger UI 제공 |

### 2.2 백엔드 Admin API (server/admin-api)

| 패키지 | 용도 |
|---|---|
| `multer` | 파일 업로드 미들웨어 |
| `@aws-sdk/client-s3` | S3 파일 업로드 |

### 2.3 프론트엔드 (client)

| 패키지 | 용도 |
|---|---|
| `react` / `react-dom` | UI 프레임워크 |
| `react-router-dom` | 라우팅 |
| `zustand` | 전역 상태 관리 |
| `axios` | HTTP 클라이언트 |

### 2.4 개발 의존성 (공통)

| 패키지 | 용도 |
|---|---|
| `typescript` | 타입 시스템 |
| `jest` / `ts-jest` | 테스트 프레임워크 |
| `@testing-library/react` | React 컴포넌트 테스트 |
| `@testing-library/jest-dom` | DOM 매처 |
| `fast-check` | Property-Based Testing |
| `eslint` | 린터 |
| `prettier` | 포매터 |
| `husky` | Git Hook |
| `lint-staged` | 스테이징 파일 린트 |
| `@types/*` | TypeScript 타입 정의 |
| `nodemon` | 개발 서버 자동 재시작 |

---

## 3. 기술 결정 상세 근거

### 3.1 Zustand 선택 (Context API 대체)
- **이유**: 기존 설계의 AuthContext, CartContext를 Zustand 스토어로 전환
- **장점**:
  - 불필요한 리렌더링 방지 (selector 기반 구독)
  - 보일러플레이트 최소화
  - DevTools 지원
  - localStorage 미들웨어 내장 (persist)
- **변경 영향**:
  - `AuthContext` → `useAuthStore`
  - `CartContext` → `useCartStore`
  - `SSEProvider`는 React Context 유지 (EventSource 생명주기 관리)

### 3.2 CSS Modules 선택
- **이유**: 컴포넌트 단위 스타일 스코핑, 빌드 타임 최적화
- **장점**:
  - 클래스명 충돌 방지 (자동 해시)
  - 런타임 오버헤드 없음
  - Vite 기본 지원 (추가 설정 불필요)
  - TypeScript 타입 지원 (`*.module.css.d.ts`)
- **파일 규칙**: `ComponentName.module.css`

### 3.3 Jest 선택 (프론트/백 통합)
- **이유**: 프론트엔드와 백엔드 모두 동일한 테스트 프레임워크 사용
- **장점**:
  - 생태계 성숙도 (풍부한 매처, mock 기능)
  - fast-check 통합 용이 (PBT)
  - @testing-library 호환성
  - 모노레포 프로젝트 설정 (`projects` 옵션)
- **설정**: 루트 jest.config.ts + 각 패키지별 프로젝트 설정

### 3.4 winston 로깅
- **이유**: 프로덕션 수준 구조화된 로깅 필요 (Q5:A 높은 가용성과 연계)
- **설정**:
  - 개발: console 트랜스포트 (colorize, simple 포맷)
  - 프로덕션: file 트랜스포트 (JSON 포맷, 일별 로테이션)
- **로그 레벨**: error > warn > info > debug
- **컨텍스트**: requestId, storeId 자동 포함 (미들웨어)

### 3.5 비동기 이미지 업로드
- **이유**: 5MB 파일 S3 업로드 시 응답 지연 방지
- **구현 방식**:
  1. multer로 서버 임시 디렉토리에 저장
  2. 임시 파일 경로 기반 즉시 응답 (임시 URL 또는 placeholder)
  3. 백그라운드 워커(setImmediate 또는 별도 프로세스)에서 S3 업로드
  4. 업로드 완료 시 MenuItem.imageUrl 업데이트
  5. 임시 파일 삭제
- **실패 처리**: 업로드 실패 시 로그 기록, 재시도 1회

---

## 4. 환경 변수 목록

| 변수명 | 설명 | 예시 |
|---|---|---|
| `NODE_ENV` | 실행 환경 | development / production |
| `PORT` | 서버 포트 | 3000 |
| `DB_HOST` | PostgreSQL 호스트 | localhost |
| `DB_PORT` | PostgreSQL 포트 | 5432 |
| `DB_NAME` | 데이터베이스명 | table_order |
| `DB_USER` | DB 사용자명 | postgres |
| `DB_PASSWORD` | DB 비밀번호 | (secret) |
| `JWT_SECRET` | JWT 서명 키 | (secret) |
| `JWT_EXPIRES_IN` | JWT 만료 시간 | 16h |
| `AWS_REGION` | AWS 리전 | ap-northeast-2 |
| `AWS_S3_BUCKET` | S3 버킷명 | table-order-images |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 | (secret) |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 | (secret) |
| `CORS_ORIGIN` | 허용 오리진 | http://localhost:5173 |
| `LOG_LEVEL` | 로그 레벨 | info |
