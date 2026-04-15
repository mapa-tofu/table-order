# NFR Requirements 계획 — 전체 유닛 통합

> Unit 1 (Frontend), Unit 2-A (Backend Shared & Customer), Unit 2-B (Backend Admin)의 기능 설계를 기반으로
> 비기능 요구사항(NFR)을 정의하고 기술 스택 세부 결정을 확정합니다.

---

## 진행 체크리스트

- [x] Step 1: 기능 설계 분석 (전체 유닛)
- [x] Step 2: NFR 평가 질문 생성
- [x] Step 3: 사용자 답변 수집
- [x] Step 4: NFR Requirements 산출물 생성
- [x] Step 5: 사용자 승인 (2026-04-15)

---

## NFR 평가 질문

### 확장성 (Scalability)

**Q1. 매장 수 규모 예상**
요구사항에 "다중 매장 지원"이 명시되어 있습니다. MVP 시점에서 지원할 매장 수 규모는 어느 정도인가요?

- A) 1~5개 매장 (소규모 파일럿)
- B) 5~20개 매장 (중규모)
- C) 20개 이상 (대규모 — DB 파티셔닝 등 고려 필요)

[Answer]:B

**Q2. 데이터 보존 기간**
OrderHistory(과거 주문 이력)의 보존 기간 정책은 어떻게 하시겠습니까?

- A) 무기한 보존 (삭제 없음)
- B) 일정 기간 후 아카이빙 (예: 6개월/1년)
- C) MVP에서는 고려하지 않음 (추후 결정)

[Answer]:B

---

### 성능 (Performance)

**Q3. API 응답 시간 목표**
요구사항에 "SSE 2초 이내, 페이지 로딩 3초 이내"가 있습니다. 일반 REST API(주문 생성, 메뉴 조회 등)의 응답 시간 목표는?

- A) 500ms 이내 (빠른 응답)
- B) 1초 이내 (일반적)
- C) 특별한 기준 없음 (합리적 수준이면 OK)

[Answer]:C

**Q4. 이미지 업로드 처리 방식**
메뉴 이미지 업로드(최대 5MB) 시 처리 방식은?

- A) 동기 업로드 (요청 중 S3 업로드 완료 후 응답)
- B) 비동기 업로드 (즉시 응답 후 백그라운드 처리)
- C) MVP에서는 동기로 단순하게 처리

[Answer]:B

---

### 가용성 (Availability)

**Q5. 서비스 가용성 수준**
매장 운영 시간 중 서비스 다운타임에 대한 허용 수준은?

- A) 높은 가용성 필요 (다중 인스턴스, 헬스체크, 자동 복구)
- B) 단일 인스턴스 + 기본 모니터링 (MVP 수준)
- C) 개발/데모 수준 (다운타임 허용)

[Answer]:A

**Q6. SSE 연결 끊김 복구 전략**
고객/관리자의 SSE 연결이 끊어졌을 때 복구 전략은?

- A) 자동 재연결 + 놓친 이벤트 재전송 (이벤트 버퍼링)
- B) 자동 재연결 + 전체 데이터 새로고침 (단순하지만 확실)
- C) 자동 재연결만 (놓친 이벤트는 무시)

[Answer]:A

---

### 기술 스택 세부 결정 (Tech Stack)

**Q7. ORM 선택 확정**
기능 설계에서 Sequelize로 결정되었습니다. 확정하시겠습니까?

- A) Sequelize 확정
- B) Prisma로 변경 (타입 안전성 우수)
- C) TypeORM으로 변경

[Answer]: A

**Q8. 프론트엔드 상태 관리**
React 앱의 전역 상태 관리 방식은?

- A) React Context API만 사용 (현재 설계대로)
- B) Zustand 도입 (경량 상태 관리)
- C) Redux Toolkit 도입

[Answer]: B

**Q9. CSS/스타일링 방식**
프론트엔드 스타일링 접근 방식은?

- A) Tailwind CSS
- B) CSS Modules
- C) styled-components
- D) 일반 CSS / SCSS

[Answer]: B

**Q10. 테스트 프레임워크**
백엔드/프론트엔드 테스트 프레임워크 선택은?

- A) Vitest (프론트 + 백엔드 통합, Vite 생태계)
- B) Jest (프론트 + 백엔드 통합, 범용)
- C) 프론트: Vitest / 백엔드: Jest (분리)

[Answer]: B

---

### 신뢰성 (Reliability)

**Q11. 에러 처리 및 로깅 전략**
서버 에러 처리 및 로깅 수준은?

- A) 구조화된 로깅 (winston/pino) + 에러 분류 체계
- B) console.log 기반 기본 로깅 + 글로벌 에러 핸들러
- C) MVP 최소 수준 (에러 응답만 정의)

[Answer]: A

**Q12. 데이터베이스 트랜잭션 전략**
주문 생성, 이용 완료 등 복합 작업의 트랜잭션 처리는?

- A) 명시적 트랜잭션 필수 (모든 복합 작업에 적용)
- B) 핵심 작업만 트랜잭션 (주문 생성, 이용 완료)
- C) ORM 기본 동작에 의존

[Answer]: C

---

### 유지보수성 (Maintainability)

**Q13. 코드 품질 도구**
린팅/포매팅 도구 설정은?

- A) ESLint + Prettier (표준 구성)
- B) Biome (올인원, 빠른 속도)
- C) 특별한 선호 없음 (추천에 따름)

[Answer]: A

**Q14. API 문서화 방식**
OpenAPI 스펙 작성 방식은?

- A) YAML 파일 수동 작성 (코드와 별도 관리)
- B) 코드에서 자동 생성 (swagger-jsdoc 등)
- C) 둘 다 (수동 작성 + 코드 검증)

[Answer]: B
