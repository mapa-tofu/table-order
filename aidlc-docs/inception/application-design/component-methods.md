# 컴포넌트 메서드 정의 (Component Methods)

> 비즈니스 규칙 상세는 Functional Design(Construction Phase)에서 정의합니다.

---

## 1. 서비스 레이어 메서드

### 1.1 AuthService
```typescript
// 테이블 인증
tableLogin(storeId: string, tableNumber: number, password: string): Promise<{ token: string; session: TableSession }>
// 관리자 인증
adminLogin(storeId: string, username: string, password: string): Promise<{ token: string; admin: StoreAdmin }>
// 토큰 검증
verifyToken(token: string, type: 'table' | 'admin'): Promise<TokenPayload>
// 토큰 갱신
refreshToken(token: string): Promise<{ token: string }>
```

### 1.2 MenuService
```typescript
// 카테고리별 메뉴 조회
getMenusByStore(storeId: string): Promise<CategoryWithMenus[]>
// 메뉴 상세 조회
getMenuById(menuId: string): Promise<MenuItem>
// 메뉴 등록
createMenu(storeId: string, data: CreateMenuInput): Promise<MenuItem>
// 메뉴 수정
updateMenu(menuId: string, data: UpdateMenuInput): Promise<MenuItem>
// 메뉴 삭제
deleteMenu(menuId: string): Promise<void>
// 메뉴 순서 변경
reorderMenus(storeId: string, categoryId: string, menuIds: string[]): Promise<void>
```

### 1.3 OrderService
```typescript
// 주문 생성
createOrder(storeId: string, tableId: string, sessionId: string, items: OrderItemInput[]): Promise<Order>
// 현재 세션 주문 조회 (고객용)
getOrdersBySession(sessionId: string): Promise<Order[]>
// 매장 전체 활성 주문 조회 (관리자용)
getActiveOrdersByStore(storeId: string): Promise<OrdersByTable[]>
// 주문 상태 변경
updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
// 주문 삭제
deleteOrder(orderId: string): Promise<void>
```

### 1.4 TableService
```typescript
// 테이블 초기 설정
setupTable(storeId: string, tableNumber: number, password: string): Promise<TableEntity>
// 테이블 세션 시작 (첫 주문 시 자동)
startSession(tableId: string): Promise<TableSession>
// 테이블 이용 완료 (세션 종료)
completeTable(tableId: string, sessionId: string): Promise<void>
// 테이블별 현재 주문 요약 조회
getTableSummary(storeId: string): Promise<TableSummary[]>
// 과거 주문 내역 조회
getOrderHistory(tableId: string, dateFilter?: DateRange): Promise<OrderHistory[]>
```

### 1.5 SSEManager
```typescript
// 클라이언트 SSE 연결 등록
addClient(clientId: string, storeId: string, type: 'customer' | 'admin', response: Response): void
// 클라이언트 연결 해제
removeClient(clientId: string): void
// 매장 전체에 이벤트 브로드캐스트
broadcastToStore(storeId: string, event: SSEEvent): void
// 특정 테이블에 이벤트 전송
sendToTable(storeId: string, tableId: string, event: SSEEvent): void
```

### 1.6 FileService
```typescript
// 이미지 업로드
uploadImage(file: Express.Multer.File): Promise<{ url: string }>
// 이미지 삭제
deleteImage(imageUrl: string): Promise<void>
```

---

## 2. API 라우터 엔드포인트

### 2.1 Customer API
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/customer/auth/login | 테이블 로그인 |
| GET | /api/customer/menus | 매장 메뉴 조회 |
| GET | /api/customer/menus/:id | 메뉴 상세 조회 |
| POST | /api/customer/orders | 주문 생성 |
| GET | /api/customer/orders | 현재 세션 주문 조회 |
| GET | /api/customer/sse | 고객용 SSE 연결 |

### 2.2 Admin API
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/admin/auth/login | 관리자 로그인 |
| GET | /api/admin/orders | 매장 활성 주문 조회 |
| PATCH | /api/admin/orders/:id/status | 주문 상태 변경 |
| DELETE | /api/admin/orders/:id | 주문 삭제 |
| POST | /api/admin/tables/setup | 테이블 초기 설정 |
| POST | /api/admin/tables/:id/complete | 테이블 이용 완료 |
| GET | /api/admin/tables/:id/history | 과거 주문 내역 |
| GET | /api/admin/tables/summary | 테이블 요약 |
| GET | /api/admin/menus | 메뉴 목록 조회 |
| POST | /api/admin/menus | 메뉴 등록 |
| PUT | /api/admin/menus/:id | 메뉴 수정 |
| DELETE | /api/admin/menus/:id | 메뉴 삭제 |
| PUT | /api/admin/menus/reorder | 메뉴 순서 변경 |
| GET | /api/admin/sse | 관리자용 SSE 연결 |
