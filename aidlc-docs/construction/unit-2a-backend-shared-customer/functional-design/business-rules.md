# 비즈니스 규칙 — Unit 2-A

---

## 1. 인증 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| AUTH-01 | 비밀번호는 bcrypt로 해싱 저장 | saltRounds: 10 |
| AUTH-02 | JWT 토큰 만료: 16시간 | 테이블/관리자 동일 |
| AUTH-03 | 관리자 로그인 시도 제한: 5회 | 5회 실패 시 일정 시간 잠금 |
| AUTH-04 | JWT payload에 storeId 필수 포함 | 매장 격리를 위한 필수 클레임 |
| AUTH-05 | 테이블 JWT에 tableId, tableNumber 포함 | 테이블 식별용 |
| AUTH-06 | 관리자 JWT에 adminId, role:'admin' 포함 | 권한 구분용 |

## 2. 주문 검증 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| ORD-01 | 주문 항목 최소 1개 이상 | 빈 주문 불가 |
| ORD-02 | 각 항목 수량 >= 1 | 0 이하 수량 불가 |
| ORD-03 | menuItemId는 해당 매장의 유효한 메뉴여야 함 | 다른 매장 메뉴 주문 불가 |
| ORD-04 | totalAmount = sum(각 item의 quantity * unitPrice) | 서버에서 재계산 (클라이언트 값 무시) |
| ORD-05 | 주문 시점 메뉴명/가격 스냅샷 저장 | 메뉴 변경 후에도 주문 이력 정확성 보장 |
| ORD-06 | 주문 번호 = UUID (Order.id) | 전역 고유 식별자 |

## 3. 메뉴 검증 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| MENU-01 | 메뉴명 필수, 최대 100자 | 빈 문자열 불가 |
| MENU-02 | 가격 필수, 0 이상 정수 | 음수 불가, 원 단위 |
| MENU-03 | 카테고리 필수 | 카테고리 없는 메뉴 불가 |
| MENU-04 | 카테고리는 해당 매장 소속이어야 함 | 다른 매장 카테고리 사용 불가 |
| MENU-05 | 이미지 URL은 유효한 URL 형식 | 선택사항, 있으면 형식 검증 |
| MENU-06 | sortOrder는 0 이상 정수 | 노출 순서 |

## 4. 상태 전이 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| STATE-01 | 주문 상태: pending, preparing, completed | 3가지 상태만 존재 |
| STATE-02 | 모든 방향 전이 허용 | pending ↔ preparing ↔ completed |
| STATE-03 | 상태 변경 시 SSE 이벤트 발행 필수 | 실시간 동기화 |
| STATE-04 | 세션 상태: active, completed | 2가지 상태만 존재 |
| STATE-05 | 세션은 active → completed 단방향만 허용 | 완료된 세션 재활성화 불가 |

## 5. 데이터 무결성 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| INT-01 | 매장 내 테이블 번호 고유 | UNIQUE(storeId, tableNumber) |
| INT-02 | 매장 내 관리자 사용자명 고유 | UNIQUE(storeId, username) |
| INT-03 | 주문 삭제 시 OrderItem CASCADE 삭제 | 고아 레코드 방지 |
| INT-04 | 이용 완료 시 Order→OrderHistory 이동 후 원본 삭제 | 데이터 정합성 |
| INT-05 | OrderHistory.items는 JSON 스냅샷 | 원본 삭제 후에도 이력 보존 |
| INT-06 | 테이블당 활성 세션 최대 1개 | 동시 세션 방지 |

---

## 6. Testable Properties (PBT-01)

### 식별된 속성 기반 테스트 대상

| 컴포넌트 | 속성 카테고리 | 설명 |
|---|---|---|
| Order.totalAmount 계산 | Invariant | totalAmount = sum(items.quantity * items.unitPrice) — 항상 성립 |
| OrderItem.subtotal 계산 | Invariant | subtotal = quantity * unitPrice — 항상 성립 |
| Order→OrderHistory 변환 | Round-trip | Order + OrderItems → OrderHistory(JSON) → 역직렬화 시 원본 데이터 보존 |
| JWT 토큰 생성/검증 | Round-trip | sign(payload) → verify(token) = payload (만료 전) |
| bcrypt 해싱/검증 | Easy verification | hash(password) → compare(password, hash) = true |
| 주문 상태 전이 | Idempotence | updateStatus(orderId, 'preparing') 2회 연속 = 1회와 동일 결과 |
| SSEManager 클라이언트 관리 | Stateful | addClient/removeClient 시퀀스 후 clients 상태 일관성 |
| 메뉴 sortOrder 재정렬 | Invariant | reorder 후 모든 메뉴의 sortOrder 값이 고유하고 연속적 |

### PBT 미적용 컴포넌트 (No PBT properties identified)
| 컴포넌트 | 사유 |
|---|---|
| FileService (S3 업로드) | 외부 서비스 I/O — 단위 테스트에서 mock 처리 |
| Express 라우터 | HTTP 핸들러 — 통합 테스트로 커버 |
