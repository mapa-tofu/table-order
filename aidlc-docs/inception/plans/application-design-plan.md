# Application Design Plan

## 계획 개요
테이블오더 서비스의 고수준 컴포넌트 식별, 서비스 레이어 설계, 컴포넌트 간 의존성을 정의합니다.

---

## 질문 (Questions)

### Question 1
프론트엔드 아키텍처 구조는 어떤 방식을 선호하시나요?

A) 단일 React 앱 — 고객 UI와 관리자 UI를 하나의 React 앱에서 라우팅으로 분리
B) 별도 React 앱 — 고객 UI와 관리자 UI를 완전히 분리된 두 개의 React 앱으로 구성
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
백엔드 API 구조는 어떤 방식을 선호하시나요?

A) 단일 Express 서버 — 모든 API를 하나의 서버에서 라우터로 분리
B) 분리된 서버 — 고객용 API와 관리자용 API를 별도 서버로 구성
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
데이터베이스 접근 방식은 어떤 것을 선호하시나요?

A) ORM 사용 — Sequelize, TypeORM, Prisma 등 ORM 라이브러리 활용
B) Query Builder — Knex.js 등 쿼리 빌더 활용
C) Raw SQL — pg 라이브러리로 직접 SQL 작성
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
프로젝트 언어는 어떤 것을 사용하시겠습니까?

A) TypeScript — 프론트엔드와 백엔드 모두 TypeScript 사용
B) JavaScript — 프론트엔드와 백엔드 모두 JavaScript 사용
C) 혼합 — 프론트엔드는 TypeScript, 백엔드는 JavaScript
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
모노레포(Monorepo) vs 멀티레포(Multi-repo) 중 어떤 구조를 선호하시나요?

A) 모노레포 — 하나의 저장소에 프론트엔드, 백엔드 모두 포함 (예: root/client, root/server)
B) 멀티레포 — 프론트엔드와 백엔드를 별도 저장소로 관리
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 실행 계획 (Execution Plan)

### Phase 1: 컴포넌트 식별
- [x] 프론트엔드 컴포넌트 식별 (고객 UI, 관리자 UI)
- [x] 백엔드 컴포넌트 식별 (API 라우터, 서비스, 미들웨어)
- [x] 데이터 계층 컴포넌트 식별 (모델, 리포지토리)
- [x] 공통/인프라 컴포넌트 식별 (인증, SSE, 파일 업로드)
- [x] `components.md` 생성

### Phase 2: 컴포넌트 메서드 정의
- [x] 각 컴포넌트의 주요 메서드 시그니처 정의
- [x] 입출력 타입 정의
- [x] `component-methods.md` 생성

### Phase 3: 서비스 레이어 설계
- [x] 서비스 정의 및 책임 할당
- [x] 서비스 간 오케스트레이션 패턴 정의
- [x] `services.md` 생성

### Phase 4: 의존성 및 통신 패턴
- [x] 컴포넌트 간 의존성 매트릭스 작성
- [x] 데이터 흐름 다이어그램 작성
- [x] `component-dependency.md` 생성

### Phase 5: 통합 문서
- [x] `application-design.md` 통합 문서 생성
- [x] 설계 완전성 및 일관성 검증
