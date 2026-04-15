# 비즈니스 규칙 — Unit 1: Frontend

---

## 1. 인증 규칙 (프론트엔드)

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| FE-AUTH-01 | 로그인 정보 localStorage 저장 | storeId, tableNumber, password (테이블) 또는 JWT (관리자) |
| FE-AUTH-02 | JWT 만료 감지 시 자동 로그아웃 | 16시간 후 로그인 화면으로 리다이렉트 |
| FE-AUTH-03 | 401 응답 시 자동 로그아웃 | 토큰 무효화 감지 |
| FE-AUTH-04 | 고객/관리자 라우트 분리 | /customer/* 와 /admin/* 별도 인증 체크 |

## 2. 장바구니 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| FE-CART-01 | 장바구니 localStorage 저장 | 페이지 새로고침 시 유지 |
| FE-CART-02 | 수량 최소 1 | 0이 되면 항목 자동 삭제 |
| FE-CART-03 | 총 금액 = sum(quantity * price) | 클라이언트 실시간 계산 |
| FE-CART-04 | 서버 전송은 주문 확정 시에만 | 장바구니 변경은 로컬만 |
| FE-CART-05 | 주문 성공 시 장바구니 자동 비우기 | clearCart() 호출 |

## 3. 주문 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| FE-ORD-01 | 빈 장바구니 시 주문 버튼 비활성화 | 빈 주문 방지 |
| FE-ORD-02 | 주문 성공 후 5초 카운트다운 → 메뉴 화면 리다이렉트 | 자동 복귀 |
| FE-ORD-03 | 주문 실패 시 장바구니 유지 | 재시도 가능 |
| FE-ORD-04 | 현재 세션 주문만 표시 | sessionId 기반 필터링 |

## 4. UI/UX 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| FE-UI-01 | 터치 버튼 최소 44x44px | 터치 친화적 |
| FE-UI-02 | 카드 형태 메뉴 레이아웃 | 시각적 계층 구조 |
| FE-UI-03 | 신규 주문 시각적 강조 | 색상 변경 + 애니메이션 |
| FE-UI-04 | 확인 팝업 필수 (삭제, 이용 완료) | 실수 방지 |
| FE-UI-05 | 성공/실패 피드백 메시지 | 모든 액션에 결과 표시 |

## 5. SSE 규칙

| 규칙 ID | 규칙 | 설명 |
|---|---|---|
| FE-SSE-01 | 연결 끊김 시 자동 재연결 | 안정적 실시간 통신 |
| FE-SSE-02 | 고객: order:statusChanged, order:deleted 수신 | 주문 상태 실시간 반영 |
| FE-SSE-03 | 관리자: order:created, order:statusChanged, order:deleted, table:completed 수신 | 대시보드 실시간 반영 |

---

## 6. Testable Properties (PBT-01)

| 컴포넌트 | 속성 카테고리 | 설명 |
|---|---|---|
| CartContext totalAmount 계산 | Invariant | totalAmount = sum(items.quantity * items.price) — 항상 성립 |
| CartContext addItem/removeItem | Stateful | add/remove 시퀀스 후 items 상태 일관성 |
| CartContext localStorage 직렬화 | Round-trip | cart → JSON.stringify → localStorage → JSON.parse → cart 동일 |

### PBT 미적용 컴포넌트
| 컴포넌트 | 사유 |
|---|---|
| React UI 컴포넌트 렌더링 | UI 렌더링 — 통합/E2E 테스트로 커버 |
| SSEProvider 연결 관리 | 외부 EventSource API — mock 기반 단위 테스트 |
| ApiClient HTTP 요청 | 외부 I/O — mock 기반 단위 테스트 |
