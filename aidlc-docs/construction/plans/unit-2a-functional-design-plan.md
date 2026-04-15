# Functional Design Plan — Unit 2-A: Backend Shared & Customer API

## 계획 개요
공유 서비스/모델 및 Customer API의 상세 비즈니스 로직, 도메인 모델, 비즈니스 규칙을 설계합니다.

---

## 질문 (Questions)

### Question 1
ORM 라이브러리는 어떤 것을 사용하시겠습니까?

A) Prisma — 타입 안전 ORM, 자동 마이그레이션, 직관적 스키마 정의
B) TypeORM — 데코레이터 기반, Active Record/Data Mapper 패턴 지원
C) Sequelize — 성숙한 ORM, 풍부한 기능, TypeScript 지원
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
테이블 세션 관리에서 "첫 주문 시 자동 세션 시작"의 구체적 동작은 어떻게 되어야 하나요?

A) 주문 생성 시 활성 세션이 없으면 자동으로 새 세션 생성 후 주문 진행
B) 테이블 로그인 시점에 세션을 미리 생성하고, 주문은 기존 세션에 연결
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
주문 번호 생성 방식은 어떤 것을 선호하시나요?

A) 매장별 순차 번호 — 매장 내에서 1번부터 순차 증가 (매일 리셋 가능)
B) UUID 기반 — 전역 고유 식별자
C) 날짜+순번 조합 — 예: 20260415-001, 20260415-002
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
주문 상태 전이(State Transition) 규칙은 어떻게 되어야 하나요?

A) 단방향만 허용 — 대기중 → 준비중 → 완료 (역방향 불가)
B) 유연하게 — 어떤 상태에서든 다른 상태로 변경 가능
C) 제한적 역방향 — 완료 → 준비중 역방향은 허용, 대기중으로 되돌리기는 불가
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 실행 계획 (Execution Plan)

### Phase 1: 도메인 엔티티 설계
- [x] Store, StoreAdmin 엔티티 상세 정의
- [x] TableEntity, TableSession 엔티티 상세 정의
- [x] Category, MenuItem 엔티티 상세 정의
- [x] Order, OrderItem 엔티티 상세 정의
- [x] OrderHistory 엔티티 상세 정의
- [x] 엔티티 관계(ER) 다이어그램 작성
- [x] `domain-entities.md` 생성

### Phase 2: 비즈니스 로직 모델
- [x] 테이블 인증 로직 설계
- [x] 주문 생성 로직 설계 (세션 자동 시작 포함)
- [x] 주문 상태 전이 로직 설계
- [x] 테이블 이용 완료 로직 설계
- [x] SSE 이벤트 발행 로직 설계
- [x] `business-logic-model.md` 생성

### Phase 3: 비즈니스 규칙
- [x] 인증 규칙 (JWT, bcrypt, 세션 만료)
- [x] 주문 검증 규칙 (필수 필드, 수량, 금액)
- [x] 메뉴 검증 규칙 (필수 필드, 가격 범위)
- [x] 상태 전이 규칙
- [x] 데이터 무결성 규칙
- [x] Testable Properties 식별 (PBT-01)
- [x] `business-rules.md` 생성
