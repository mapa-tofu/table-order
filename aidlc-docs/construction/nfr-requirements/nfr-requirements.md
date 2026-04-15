# 비기능 요구사항 (NFR Requirements) — 전체 유닛 통합

---

## 1. 확장성 (Scalability)

### SCL-01: 다중 매장 지원 규모
- **목표**: MVP 시점 5~20개 매장 동시 지원
- **데이터 격리**: storeId 기반 논리적 격리 (단일 DB, 인덱스 최적화)
- **인덱스 전략**: 모든 주요 테이블에 `storeId` 복합 인덱스 적용
  - `(storeId, tableNumber)` — TableEntity
  - `(storeId, username)` — StoreAdmin
  - `(storeId, status)` — Order
  - `(storeId)` — Category, TableSession
- **커넥션 풀**: 최소 5, 최대 20 (매장 수 대비 여유)

### SCL-02: 데이터 보존 및 아카이빙
- **OrderHistory 보존 기간**: 6개월 활성 보존
- **아카이빙 전략**: 6개월 경과 데이터는 별도 아카이브 테이블로 이동 (추후 배치 작업)
- **MVP 구현**: createdAt 기반 날짜 필터링 인덱스 추가, 아카이빙 배치는 운영 단계에서 구현
- **인덱스**: `(storeId, createdAt)` — OrderHistory

### SCL-03: SSE 연결 관리
- **동시 SSE 연결**: 매장당 최대 50개 (고객 + 관리자)
- **전체 시스템**: 최대 1,000개 SSE 연결 (20매장 × 50)
- **메모리 관리**: 클라이언트 Map 기반, 연결 종료 시 즉시 정리

---

## 2. 성능 (Performance)

### PER-01: API 응답 시간
- **REST API**: 합리적 수준 (명시적 SLA 없음, 일반적으로 1초 이내 목표)
- **SSE 이벤트 전달**: 2초 이내 (요구사항 NFR-01)
- **페이지 로딩**: 3초 이내 (요구사항 NFR-01)
- **DB 쿼리 최적화**: N+1 방지, eager loading 적용

### PER-02: 이미지 업로드
- **처리 방식**: 비동기 업로드
- **흐름**:
  1. 클라이언트 → 서버: multipart/form-data 수신
  2. 서버: 즉시 임시 URL 또는 업로드 ID 응답
  3. 백그라운드: S3 업로드 완료 후 MenuItem.imageUrl 업데이트
- **파일 제한**: 최대 5MB, JPEG/PNG/WebP만 허용
- **임시 저장**: 서버 로컬 임시 디렉토리 → S3 업로드 후 삭제

### PER-03: 동시 접속
- **동시 접속자**: 50명 이하 (요구사항 NFR-01)
- **Node.js 이벤트 루프**: 비동기 I/O로 충분히 처리 가능
- **Express 미들웨어**: compression, helmet 적용

---

## 3. 가용성 (Availability)

### AVL-01: 서비스 가용성
- **목표**: 높은 가용성 (매장 운영 시간 중 다운타임 최소화)
- **인스턴스 구성**: 다중 인스턴스 (최소 2개) + 로드 밸런서
- **헬스체크**: `/health` 엔드포인트 (DB 연결 상태, 메모리 사용량 확인)
- **자동 복구**: PM2 또는 컨테이너 오케스트레이션 기반 프로세스 재시작
- **Graceful Shutdown**: SIGTERM 수신 시 진행 중 요청 완료 후 종료

### AVL-02: SSE 이벤트 버퍼링 및 복구
- **재연결 전략**: 자동 재연결 + 놓친 이벤트 재전송
- **이벤트 버퍼**:
  - 매장별 최근 이벤트 100개 메모리 버퍼 유지
  - 각 이벤트에 순차 ID 부여 (`Last-Event-ID`)
  - 클라이언트 재연결 시 `Last-Event-ID` 헤더로 마지막 수신 ID 전달
  - 서버: 해당 ID 이후 버퍼된 이벤트 재전송
- **버퍼 만료**: 5분 경과 이벤트는 버퍼에서 제거
- **폴백**: 버퍼 범위 초과 시 전체 데이터 새로고침 트리거

### AVL-03: 데이터베이스 가용성
- **연결 풀 관리**: Sequelize 커넥션 풀 (min: 5, max: 20)
- **재연결**: 연결 실패 시 자동 재시도 (최대 3회, 지수 백오프)
- **타임아웃**: 쿼리 타임아웃 30초, 연결 타임아웃 10초

---

## 4. 신뢰성 (Reliability)

### REL-01: 에러 처리 체계
- **로깅 라이브러리**: winston
- **로그 레벨**: error, warn, info, debug
- **로그 포맷**: JSON 구조화 로깅
  ```json
  {
    "timestamp": "ISO8601",
    "level": "error",
    "message": "Order creation failed",
    "storeId": "uuid",
    "orderId": "uuid",
    "error": { "code": "VALIDATION_ERROR", "details": "..." },
    "requestId": "uuid"
  }
  ```
- **에러 분류 체계**:
  | 에러 코드 | HTTP 상태 | 설명 |
  |---|---|---|
  | VALIDATION_ERROR | 400 | 입력 검증 실패 |
  | AUTHENTICATION_ERROR | 401 | 인증 실패 |
  | AUTHORIZATION_ERROR | 403 | 권한 부족 |
  | NOT_FOUND_ERROR | 404 | 리소스 없음 |
  | DUPLICATE_ERROR | 409 | 중복 데이터 |
  | TOO_MANY_ATTEMPTS | 429 | 시도 횟수 초과 |
  | INTERNAL_ERROR | 500 | 서버 내부 오류 |
- **글로벌 에러 핸들러**: Express 에러 미들웨어에서 통합 처리
- **요청 ID**: 각 요청에 UUID 부여, 로그 추적용

### REL-02: 트랜잭션 전략
- **방식**: Sequelize ORM 기본 동작에 의존
- **자동 트랜잭션**: Sequelize의 기본 auto-commit 모드 사용
- **CASCADE 삭제**: 외래 키 CASCADE 설정으로 데이터 정합성 보장
- **참고**: 복합 작업(주문 생성 + 세션 생성, 이용 완료 + 히스토리 이동)은 Sequelize의 기본 동작으로 처리하되, 데이터 불일치 발생 시 운영 단계에서 명시적 트랜잭션 도입 검토

### REL-03: 입력 검증
- **서버 측 검증 필수**: 모든 API 엔드포인트에서 입력 검증
- **검증 라이브러리**: express-validator 또는 joi
- **클라이언트 검증**: UX 향상 목적 (서버 검증의 보조)

---

## 5. 유지보수성 (Maintainability)

### MNT-01: 코드 품질 도구
- **린터**: ESLint (TypeScript 규칙 포함)
- **포매터**: Prettier
- **설정**: 모노레포 루트에 공유 설정, 각 패키지에서 extends
- **규칙**:
  - `@typescript-eslint/recommended`
  - `prettier/recommended`
  - `no-console` (warn — winston 사용 유도)
- **Git Hook**: husky + lint-staged (커밋 시 자동 린트/포맷)

### MNT-02: API 문서화
- **방식**: swagger-jsdoc 기반 코드 내 자동 생성
- **도구**: swagger-jsdoc + swagger-ui-express
- **접근**: `/api-docs` 엔드포인트에서 Swagger UI 제공
- **JSDoc 주석**: 각 라우터 핸들러에 OpenAPI 어노테이션 작성
- **산출물**: Customer API 스펙 + Admin API 스펙 (자동 생성)

### MNT-03: 프로젝트 구조
- **모노레포**: 루트 package.json + workspaces
- **패키지 매니저**: npm workspaces
- **TypeScript**: 공유 tsconfig.base.json + 각 패키지별 extends
- **경로 별칭**: `@shared/*`, `@customer-api/*`, `@admin-api/*`, `@client/*`

---

## 6. 사용성 (Usability)

### USB-01: 프론트엔드 UX
- **터치 친화적**: 최소 44x44px 터치 타겟 (요구사항 NFR-04)
- **반응형 디자인**: 태블릿 우선 (고객), 데스크톱 우선 (관리자)
- **시각적 피드백**: 모든 사용자 액션에 로딩/성공/실패 상태 표시
- **접근성**: 시맨틱 HTML, ARIA 레이블, 키보드 네비게이션 지원

### USB-02: 에러 메시지
- **사용자 친화적**: 기술적 에러를 사용자가 이해할 수 있는 메시지로 변환
- **액션 가능**: 에러 발생 시 사용자가 취할 수 있는 행동 안내
- **다국어**: MVP에서는 한국어만 지원

---

## 7. 보안 (Security) — MVP 수준

### SEC-01: 인증
- **JWT 토큰**: 16시간 만료 (테이블/관리자 동일)
- **비밀번호**: bcrypt 해싱 (saltRounds: 10)
- **로그인 시도 제한**: 관리자 5회 (메모리 기반 카운터)
- **JWT 시크릿**: 환경 변수로 관리 (`JWT_SECRET`)

### SEC-02: 데이터 보호
- **HTTPS**: 프로덕션 환경 필수 (로드 밸런서 SSL 종료)
- **CORS**: 허용 오리진 환경 변수 설정
- **Helmet**: HTTP 보안 헤더 적용
- **Rate Limiting**: express-rate-limit (전체 API 기본 제한)

### SEC-03: 환경 변수
- **민감 정보**: JWT_SECRET, DB 접속 정보, AWS 자격 증명 → 환경 변수
- **.env 파일**: .gitignore에 포함, .env.example 제공
