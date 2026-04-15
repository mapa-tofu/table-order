# 비즈니스 로직 모델 — Unit 2-B: Backend Admin API

> Unit 2-A의 공유 서비스(AuthService, OrderService, TableService, MenuService, SSEManager, FileService)를 활용합니다.
> 이 문서는 Admin API 라우터에서 공유 서비스를 호출하는 오케스트레이션 로직을 정의합니다.

---

## 1. 관리자 인증

### POST /api/admin/auth/login
```
1. Request body: { storeId, username, password }
2. AuthService.adminLogin(storeId, username, password) 호출
3. 성공: { token, admin } 반환 (200)
4. 실패: AuthenticationError (401) 또는 TooManyAttemptsError (429)
```

---

## 2. 실시간 주문 모니터링

### GET /api/admin/orders
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. OrderService.getActiveOrdersByStore(storeId) 호출
3. 테이블별 그룹화된 주문 목록 반환:
   - 각 테이블: tableNumber, totalAmount, orders[]
   - 각 주문: id, status, totalAmount, createdAt, items(축약)
4. 반환 (200)
```

### PATCH /api/admin/orders/:id/status
```
1. AdminAuthMiddleware로 JWT 검증
2. Request body: { status } (pending | preparing | completed)
3. OrderService.updateOrderStatus(orderId, status) 호출
4. SSE 이벤트 자동 발행 (OrderService 내부)
5. 반환: updated order (200)
```

### DELETE /api/admin/orders/:id
```
1. AdminAuthMiddleware로 JWT 검증
2. OrderService.deleteOrder(orderId) 호출
3. SSE 이벤트 자동 발행 (OrderService 내부)
4. 반환: { success, deletedOrderId, updatedTableTotal } (200)
```

### GET /api/admin/sse
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. SSE 헤더 설정 (Content-Type: text/event-stream)
3. SSEManager.addClient(clientId, storeId, 'admin', null, response)
4. 연결 유지 (클라이언트 종료 시 자동 removeClient)
```

---

## 3. 테이블 관리

### POST /api/admin/tables/setup
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. Request body: { tableNumber, password }
3. TableService.setupTable(storeId, tableNumber, password) 호출
4. 반환: { table, token } (201)
```

### POST /api/admin/tables/:id/complete
```
1. AdminAuthMiddleware로 JWT 검증
2. 해당 테이블의 활성 세션 조회
3. TableService.completeTable(tableId, sessionId) 호출
4. SSE 이벤트 자동 발행 (TableService 내부)
5. 반환: { success, historyCount } (200)
```

### GET /api/admin/tables/:id/history
```
1. AdminAuthMiddleware로 JWT 검증
2. Query params: { startDate?, endDate? }
3. TableService.getOrderHistory(tableId, dateFilter?) 호출
4. 반환: OrderHistory[] (시간 역순, 각 항목에 completedAt 포함) (200)
```

### GET /api/admin/tables/summary
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. TableService.getTableSummary(storeId) 호출
3. 반환: 테이블별 요약 (tableNumber, activeSession?, totalAmount, orderCount) (200)
```

---

## 4. 메뉴 관리

### GET /api/admin/menus
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. MenuService.getMenusByStore(storeId) 호출
3. 반환: CategoryWithMenus[] (200)
```

### POST /api/admin/menus
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. FileUploadMiddleware로 이미지 파일 처리 (선택)
3. Request body: { name, price, description?, categoryId, sortOrder? }
4. 이미지 있으면: FileService.uploadImage(file) → imageUrl
5. MenuService.createMenu(storeId, { ...body, imageUrl }) 호출
6. 검증 실패 시: ValidationError (400) — MENU-01~06 규칙 적용
7. 반환: MenuItem (201)
```

### PUT /api/admin/menus/:id
```
1. AdminAuthMiddleware로 JWT 검증
2. FileUploadMiddleware로 이미지 파일 처리 (선택)
3. Request body: { name?, price?, description?, categoryId?, sortOrder? }
4. 새 이미지 있으면: FileService.uploadImage(file) → newImageUrl
5. 기존 이미지 있고 새 이미지로 교체 시: FileService.deleteImage(oldImageUrl)
6. MenuService.updateMenu(menuId, { ...body, imageUrl }) 호출
7. 반환: MenuItem (200)
```

### DELETE /api/admin/menus/:id
```
1. AdminAuthMiddleware로 JWT 검증
2. 메뉴 조회 → imageUrl 있으면 FileService.deleteImage(imageUrl)
3. MenuService.deleteMenu(menuId) 호출
4. 반환: (204)
```

### PUT /api/admin/menus/reorder
```
1. AdminAuthMiddleware로 JWT 검증 → storeId 추출
2. Request body: { categoryId, menuIds: string[] }
3. MenuService.reorderMenus(storeId, categoryId, menuIds) 호출
4. 반환: (200)
```
