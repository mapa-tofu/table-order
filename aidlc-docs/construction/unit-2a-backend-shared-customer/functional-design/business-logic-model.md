# 비즈니스 로직 모델 — Unit 2-A

---

## 1. 테이블 인증 로직

### tableLogin(storeId, tableNumber, password)
```
1. Store 존재 확인 → 없으면 NotFoundError
2. TableEntity 조회 (storeId + tableNumber) → 없으면 NotFoundError
3. bcrypt.compare(password, table.password) → 불일치 시 AuthenticationError
4. 현재 활성 세션 조회 (tableId, status='active')
5. JWT 토큰 생성:
   - payload: { storeId, tableId, tableNumber, sessionId? }
   - expiresIn: 16시간
6. 반환: { token, table, activeSession? }
```

### adminLogin(storeId, username, password)
```
1. Store 존재 확인 → 없으면 NotFoundError
2. StoreAdmin 조회 (storeId + username) → 없으면 AuthenticationError
3. 로그인 시도 횟수 확인 → 5회 초과 시 TooManyAttemptsError
4. bcrypt.compare(password, admin.password) → 불일치 시 AuthenticationError + 시도 횟수 증가
5. 로그인 성공 시 시도 횟수 리셋
6. JWT 토큰 생성:
   - payload: { storeId, adminId, username, role: 'admin' }
   - expiresIn: 16시간
7. 반환: { token, admin }
```

---

## 2. 주문 생성 로직

### createOrder(storeId, tableId, sessionId?, items)
```
1. Store, TableEntity 존재 확인
2. items 검증:
   - 최소 1개 이상
   - 각 item: menuItemId 존재, quantity >= 1
3. MenuItem 조회 (각 menuItemId) → 없으면 NotFoundError
4. 세션 처리:
   a. sessionId가 있으면 → 해당 세션 활성 상태 확인
   b. sessionId가 없거나 활성 세션이 없으면:
      - 새 TableSession 생성 (status='active', startedAt=now)
5. OrderItem 생성:
   - menuName: MenuItem.name (스냅샷)
   - unitPrice: MenuItem.price (스냅샷)
   - subtotal: quantity * unitPrice
6. totalAmount 계산: sum(모든 OrderItem.subtotal)
7. Order 생성:
   - id: UUID (= 주문 번호)
   - status: 'pending'
   - totalAmount: 계산된 총액
8. SSE 이벤트 발행: 'order:created' → 매장 전체 브로드캐스트
9. 반환: { order (with items), session }
```

---

## 3. 주문 상태 전이 로직

### updateOrderStatus(orderId, newStatus)
```
1. Order 조회 → 없으면 NotFoundError
2. 상태 전이 허용 (유연한 방식):
   - 'pending' → 'preparing' | 'completed'
   - 'preparing' → 'pending' | 'completed'
   - 'completed' → 'pending' | 'preparing'
   (모든 방향 허용)
3. Order.status 업데이트
4. SSE 이벤트 발행:
   - 'order:statusChanged' → 해당 테이블 고객 + 매장 전체
5. 반환: { order (updated) }
```

---

## 4. 테이블 이용 완료 로직

### deleteOrder(orderId)
```
1. Order 조회 (OrderItems 포함) → 없으면 NotFoundError
2. Order의 storeId, tableId, sessionId 확인
3. Order + OrderItem CASCADE 삭제
4. 해당 세션의 남은 주문 총액 재계산:
   - remainingOrders = 해당 sessionId의 모든 Order 조회
   - newTotal = sum(remainingOrders.totalAmount)
5. SSE 이벤트 발행: 'order:deleted' → 해당 테이블 고객 + 매장 전체
   - payload에 삭제된 orderId, 재계산된 테이블 총 주문액 포함
6. 반환: { success, deletedOrderId, updatedTableTotal }
```

### setupTable(storeId, tableNumber, password)
```
1. Store 존재 확인 → 없으면 NotFoundError
2. 동일 매장 내 동일 테이블 번호 중복 확인 → 있으면 DuplicateError
3. password를 bcrypt 해싱
4. TableEntity 생성 (storeId, tableNumber, hashedPassword)
5. JWT 토큰 생성:
   - payload: { storeId, tableId, tableNumber }
   - expiresIn: 16시간
6. 반환: { table, token }
```

### completeTable(tableId, sessionId)
```
1. TableEntity, TableSession 존재 확인
2. TableSession.status가 'active'인지 확인 → 아니면 InvalidStateError
3. 해당 세션의 모든 Order 조회
4. 각 Order를 OrderHistory로 복사:
   - items: OrderItem 목록을 JSON으로 직렬화
   - orderedAt: Order.createdAt
   - completedAt: now()
5. 해당 세션의 모든 Order + OrderItem 삭제
6. TableSession.status = 'completed', completedAt = now()
7. SSE 이벤트 발행: 'table:completed' → 매장 전체
8. 반환: { success, historyCount }
```

---

## 5. SSE 이벤트 발행 로직

### SSEManager 동작 모델
```
내부 상태:
  clients: Map<clientId, { storeId, tableId?, type, response }>

addClient(clientId, storeId, type, tableId?, response):
  1. clients에 등록
  2. response에 SSE 헤더 설정
  3. 연결 종료 시 자동 removeClient

removeClient(clientId):
  1. clients에서 제거

broadcastToStore(storeId, event):
  1. clients에서 storeId 일치하는 모든 클라이언트 필터
  2. 각 클라이언트에 event 전송 (data: JSON.stringify(event))

sendToTable(storeId, tableId, event):
  1. clients에서 storeId + tableId 일치하는 클라이언트 필터
  2. 해당 클라이언트에 event 전송
```

### SSE 이벤트 포맷
```
event: {eventType}
data: {"type": "{eventType}", "payload": {...}, "timestamp": "ISO8601"}
```
