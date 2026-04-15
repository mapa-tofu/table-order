# Unit of Work Plan

## 계획 개요
테이블오더 서비스를 프론트엔드/백엔드 유닛으로 분해하여 병렬 개발이 가능하도록 합니다.

---

## 질문 (Questions)

### Question 1
프론트엔드와 백엔드 유닛 간 API 계약(Contract)은 어떻게 관리하시겠습니까?

A) 공유 타입 패키지 (`shared/types/`)에 API 요청/응답 타입을 정의하고 양쪽에서 참조
B) OpenAPI(Swagger) 스펙 문서를 먼저 작성하고 양쪽에서 참조
C) 백엔드가 먼저 API를 구현하면 프론트엔드가 맞춰서 개발
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
백엔드 유닛 내에서 Customer API와 Admin API를 어떻게 나누시겠습니까?

A) 하나의 백엔드 유닛으로 통합 — 본인이 Customer API + Admin API 모두 담당
B) 별도 서브유닛으로 분리 — Customer API와 Admin API를 순차적으로 개발
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 3
공유 서비스 레이어(AuthService, OrderService 등)와 ORM 모델은 누가 담당하나요?

A) 백엔드 담당자(본인)가 전담
B) 프론트엔드 담당자와 협의하여 공유 타입만 함께 정의
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 실행 계획 (Execution Plan)

### Phase 1: 유닛 정의
- [x] Unit 1 (프론트엔드) 정의 — 범위, 책임, 담당자
- [x] Unit 2 (백엔드) 정의 — 범위, 책임, 담당자
- [x] 공유 컴포넌트 정의 — shared/types
- [x] `unit-of-work.md` 생성

### Phase 2: 의존성 매트릭스
- [x] 유닛 간 의존성 정의
- [x] 개발 순서 및 병렬화 전략 정의
- [x] `unit-of-work-dependency.md` 생성

### Phase 3: 스토리 매핑
- [x] 각 스토리를 유닛에 할당
- [x] 크로스 유닛 스토리 식별
- [x] `unit-of-work-story-map.md` 생성
