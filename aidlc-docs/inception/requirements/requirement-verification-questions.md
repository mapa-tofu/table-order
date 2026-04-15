# 요구사항 확인 질문

제공해주신 요구사항 문서를 분석했습니다. 아래 질문에 답변해주시면 더 정확한 요구사항을 정리할 수 있습니다.
각 질문의 `[Answer]:` 태그 뒤에 선택지 문자를 입력해주세요.

---

## Question 1
프로젝트의 기술 스택(Tech Stack)은 어떤 것을 사용하시겠습니까?

A) React (프론트엔드) + Node.js/Express (백엔드) + PostgreSQL (데이터베이스)
B) React (프론트엔드) + Spring Boot/Java (백엔드) + MySQL (데이터베이스)
C) Next.js (풀스택) + PostgreSQL (데이터베이스)
D) Vue.js (프론트엔드) + Node.js/Express (백엔드) + MongoDB (데이터베이스)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
배포 환경(Deployment Target)은 어디를 계획하고 계십니까?

A) AWS 클라우드 (EC2, RDS, S3 등)
B) 로컬/온프레미스 서버
C) Docker 컨테이너 기반 (Docker Compose)
D) 배포 환경은 아직 미정 — 로컬 개발 환경에서 실행 가능하도록만 구현
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
매장(Store) 관리 범위는 어떻게 되나요? 이 시스템은 단일 매장용인가요, 다중 매장용인가요?

A) 단일 매장 전용 — 하나의 매장만 관리
B) 다중 매장 지원 — 여러 매장을 하나의 시스템에서 관리 (각 매장별 독립 데이터)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4
테이블 수는 매장당 대략 몇 개 정도를 예상하시나요?

A) 소규모 (1~10개 테이블)
B) 중규모 (11~30개 테이블)
C) 대규모 (31개 이상 테이블)
D) 유동적 — 매장마다 다르며 제한 없이 설정 가능해야 함
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 5
메뉴 이미지 관리 방식은 어떻게 하시겠습니까?

A) 외부 이미지 URL 직접 입력 (별도 이미지 업로드 기능 없음)
B) 서버에 이미지 파일 업로드 기능 포함
C) 이미지 없이 텍스트 기반 메뉴만 지원 (MVP 단순화)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
관리자 계정 관리 범위는 어떻게 되나요?

A) 매장당 1개의 관리자 계정 (사전 설정, 회원가입 없음)
B) 매장당 여러 관리자 계정 지원 (회원가입 기능 포함)
C) 시스템 초기 데이터로 관리자 계정을 미리 생성 (seed data)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 7
주문 상태 실시간 업데이트(고객 화면)에 대해 어떻게 하시겠습니까? 요구사항에 "선택사항"으로 표기되어 있습니다.

A) MVP에 포함 — 고객 화면에서도 SSE로 주문 상태 실시간 반영
B) MVP에서 제외 — 고객은 페이지 새로고침으로 상태 확인 (관리자 화면만 SSE)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
메뉴 관리 기능은 MVP에 포함하시겠습니까? 요구사항 문서의 MVP 범위에 메뉴 관리가 명시적으로 포함되어 있지 않습니다.

A) MVP에 포함 — 관리자가 메뉴 CRUD(등록/수정/삭제) 가능
B) MVP에서 제외 — 초기 데이터(seed data)로 메뉴를 미리 설정
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
동시 접속자 수 및 성능 요구사항은 어느 수준을 기대하시나요?

A) 소규모 — 동시 10명 이하 (소규모 매장 1곳)
B) 중규모 — 동시 50명 이하 (중규모 매장 또는 소규모 다중 매장)
C) 성능 요구사항 없음 — MVP이므로 기본적인 동작만 보장
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10: Security Extensions
이 프로젝트에 보안 확장 규칙(Security Extension Rules)을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 블로킹 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 11: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(Property-Based Testing) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 블로킹 제약으로 적용 (비즈니스 로직, 데이터 변환이 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 규칙 적용
C) No — PBT 규칙 건너뛰기 (단순 CRUD 애플리케이션, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: A
