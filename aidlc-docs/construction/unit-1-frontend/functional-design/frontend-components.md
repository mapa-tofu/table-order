# 프론트엔드 컴포넌트 설계 — Unit 1: Frontend

---

## 1. 라우팅 구조

```
/                           → 리다이렉트 (로그인 상태에 따라)
/customer/menu              → MenuBrowser (기본 화면)
/customer/cart              → Cart
/customer/order             → OrderCreate (주문 확인)
/customer/order/success     → OrderSuccess (5초 후 /customer/menu로 리다이렉트)
/customer/orders            → OrderHistory
/customer/setup             → TableAuth (초기 설정)
/admin/login                → AdminAuth
/admin/dashboard            → OrderDashboard
/admin/tables               → TableManager
/admin/menus                → MenuManager
```

---

## 2. 고객 모듈 컴포넌트

### 2.1 TableAuth (테이블 자동 로그인)
- **Props**: 없음
- **State**: storeId, tableNumber, password, isLoading, error
- **동작**:
  - 마운트 시 localStorage에서 저장된 인증 정보 확인
  - 저장된 정보 있으면 → 자동 로그인 시도 (POST /api/customer/auth/login)
  - 성공 → JWT 토큰 localStorage 저장 → /customer/menu로 리다이렉트
  - 실패 또는 저장 정보 없음 → 초기 설정 폼 표시
  - 초기 설정 완료 → 로그인 정보 localStorage 저장 → 자동 로그인
- **API**: POST /api/customer/auth/login
- **검증**: storeId 필수, tableNumber 필수 (양수 정수), password 필수

### 2.2 MenuBrowser (메뉴 조회 및 탐색)
- **Props**: 없음 (AuthContext에서 storeId 가져옴)
- **State**: categories[], selectedCategory, menus[], isLoading
- **동작**:
  - 마운트 시 GET /api/customer/menus 호출
  - 카테고리 탭 표시 → 클릭 시 해당 카테고리 메뉴 필터링
  - 메뉴 카드: 이미지, 메뉴명, 가격, 설명 표시
  - 카드에 "담기" 버튼 → CartContext.addItem() 호출
- **API**: GET /api/customer/menus
- **UI**: 카드 레이아웃, 터치 44x44px 최소, 카테고리 탭 상단 고정

### 2.3 Cart (장바구니)
- **Props**: 없음 (CartContext 사용)
- **State**: CartContext에서 items[], totalAmount 가져옴
- **동작**:
  - 장바구니 항목 목록 표시 (메뉴명, 수량, 단가, 소계)
  - 수량 +/- 버튼 → CartContext.updateQuantity()
  - 삭제 버튼 → CartContext.removeItem()
  - 장바구니 비우기 → CartContext.clearCart()
  - 총 금액 실시간 표시
  - "주문하기" 버튼 → /customer/order로 이동
  - 빈 장바구니 시 안내 메시지 표시
- **API**: 없음 (로컬 전용)
- **저장**: localStorage (페이지 새로고침 시 유지)

### 2.4 OrderCreate (주문 확인 및 확정)
- **Props**: 없음 (CartContext 사용)
- **State**: isSubmitting, error
- **동작**:
  - 장바구니 내역 최종 확인 표시
  - "주문 확정" 버튼 → POST /api/customer/orders 호출
  - 성공 → CartContext.clearCart() → /customer/order/success로 이동
  - 실패 → 에러 메시지 표시, 장바구니 유지
  - 빈 장바구니 시 주문 버튼 비활성화
- **API**: POST /api/customer/orders
- **요청 body**: { items: [{ menuItemId, quantity }] } (storeId, tableId, sessionId는 AuthContext에서)

### 2.5 OrderSuccess (주문 성공)
- **Props**: orderId (URL param 또는 state)
- **State**: countdown (5초)
- **동작**:
  - 주문 번호 표시
  - 5초 카운트다운 표시
  - 5초 후 /customer/menu로 자동 리다이렉트
- **API**: 없음

### 2.6 OrderHistory (주문 내역 조회)
- **Props**: 없음 (AuthContext에서 sessionId 가져옴)
- **State**: orders[], isLoading, page, hasMore
- **동작**:
  - 마운트 시 GET /api/customer/orders 호출 (현재 세션)
  - 주문 목록 시간 순 정렬 표시
  - 각 주문: 주문 번호, 시각, 메뉴/수량, 금액, 상태 배지
  - SSEProvider에서 order:statusChanged 이벤트 수신 → 실시간 상태 업데이트
  - 페이지네이션 또는 무한 스크롤
  - 주문 없을 시 안내 메시지
- **API**: GET /api/customer/orders, GET /api/customer/sse
- **SSE 이벤트**: order:statusChanged, order:deleted

---

## 3. 관리자 모듈 컴포넌트

### 3.1 AdminAuth (관리자 로그인)
- **Props**: 없음
- **State**: storeId, username, password, isLoading, error
- **동작**:
  - 마운트 시 localStorage에서 JWT 확인 → 유효하면 /admin/dashboard로 리다이렉트
  - 로그인 폼: 매장 식별자, 사용자명, 비밀번호
  - 제출 → POST /api/admin/auth/login
  - 성공 → JWT localStorage 저장 → /admin/dashboard로 이동
  - 실패 → 에러 메시지 (인증 실패, 시도 횟수 초과 등)
- **API**: POST /api/admin/auth/login
- **세션**: 16시간 후 자동 로그아웃 (JWT 만료 감지)

### 3.2 OrderDashboard (실시간 주문 모니터링)
- **Props**: 없음 (AuthContext에서 storeId)
- **State**: tableOrders: Map<tableId, { table, orders[], totalAmount }>, filter, selectedTable
- **동작**:
  - 마운트 시 GET /api/admin/orders + GET /api/admin/sse 연결
  - 그리드 레이아웃: 테이블별 카드
  - 각 카드: 테이블 번호, 총 주문액, 최신 주문 n개 미리보기
  - 신규 주문 시각적 강조 (색상 변경, 애니메이션) — SSE order:created
  - 카드 클릭 → 해당 테이블 전체 주문 상세 모달/패널
  - 상세 보기에서 주문 상태 변경 버튼 (대기중/준비중/완료)
  - 테이블별 필터링 드롭다운
- **API**: GET /api/admin/orders, PATCH /api/admin/orders/:id/status, GET /api/admin/sse
- **SSE 이벤트**: order:created, order:statusChanged, order:deleted, table:completed

### 3.3 TableManager (테이블 관리)
- **Props**: 없음
- **State**: tables[], selectedTable, showHistory, historyData[], dateFilter
- **동작**:
  - **초기 설정 탭**: 테이블 번호 + 비밀번호 입력 → POST /api/admin/tables/setup
  - **테이블 목록**: GET /api/admin/tables/summary
  - **주문 삭제**: 삭제 버튼 → 확인 팝업 → DELETE /api/admin/orders/:id → 성공/실패 피드백
  - **이용 완료**: 이용 완료 버튼 → 확인 팝업 → POST /api/admin/tables/:id/complete → 성공/실패 피드백
  - **과거 내역**: "과거 내역" 버튼 → GET /api/admin/tables/:id/history → 모달/패널 표시
    - 시간 역순 정렬
    - 각 주문: 주문 번호, 시각, 메뉴 목록, 총 금액, 이용 완료 시각
    - 날짜 필터링
    - "닫기" 버튼
- **API**: POST /api/admin/tables/setup, GET /api/admin/tables/summary, DELETE /api/admin/orders/:id, POST /api/admin/tables/:id/complete, GET /api/admin/tables/:id/history

### 3.4 MenuManager (메뉴 관리)
- **Props**: 없음
- **State**: categories[], menus[], editingMenu, isUploading
- **동작**:
  - 카테고리별 메뉴 목록 표시: GET /api/admin/menus
  - **등록**: 폼 (메뉴명*, 가격*, 설명, 카테고리*, 이미지 업로드) → POST /api/admin/menus
  - **수정**: 기존 메뉴 선택 → 수정 폼 → PUT /api/admin/menus/:id
  - **삭제**: 삭제 버튼 → 확인 팝업 → DELETE /api/admin/menus/:id
  - **순서 조정**: 드래그 앤 드롭 → PUT /api/admin/menus/reorder
  - 검증: 메뉴명 필수(100자), 가격 필수(0이상), 카테고리 필수
  - 이미지: 파일 선택 → 미리보기 → 서버 업로드
- **API**: GET/POST /api/admin/menus, PUT/DELETE /api/admin/menus/:id, PUT /api/admin/menus/reorder

---

## 4. 공통 컴포넌트

### 4.1 AuthContext
- **State**: token, storeId, tableId?, tableNumber?, sessionId?, adminId?, role
- **동작**:
  - localStorage에서 JWT 로드
  - JWT 디코딩하여 payload 추출
  - 토큰 만료 감지 → 자동 로그아웃
  - login(token) / logout() 메서드 제공

### 4.2 CartContext
- **State**: items: CartItem[], totalAmount
- **동작**:
  - localStorage 연동 (읽기/쓰기)
  - addItem(menuItem, quantity) — 이미 있으면 수량 증가
  - removeItem(menuItemId)
  - updateQuantity(menuItemId, quantity) — 0이면 삭제
  - clearCart()
  - totalAmount 자동 계산: sum(items.quantity * items.price)

### 4.3 SSEProvider
- **Props**: children, endpoint (customer or admin SSE URL)
- **State**: eventSource, isConnected
- **동작**:
  - EventSource 연결 관리
  - 이벤트 수신 → 등록된 리스너에 분배
  - 연결 끊김 시 자동 재연결
  - useSSE(eventType) 커스텀 훅 제공

### 4.4 ApiClient
- **동작**:
  - axios 또는 fetch 래퍼
  - 요청 시 Authorization: Bearer {token} 자동 첨부
  - 401 응답 시 자동 로그아웃
  - baseURL 설정 (customer-api / admin-api 분리)
