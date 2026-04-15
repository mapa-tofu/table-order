# 컴포넌트 의존성 (Component Dependencies)

---

## 의존성 매트릭스

| 컴포넌트 (행 → 열 의존) | AuthService | MenuService | OrderService | TableService | SSEManager | FileService | ORM Models |
|---|---|---|---|---|---|---|---|
| **Customer API** | ✅ | ✅ | ✅ | - | ✅ | - | - |
| **Admin API** | ✅ | ✅ | ✅ | ✅ | ✅ | - | - |
| **AuthService** | - | - | - | - | - | - | ✅ |
| **MenuService** | - | - | - | - | - | ✅ | ✅ |
| **OrderService** | - | - | - | ✅ | ✅ | - | ✅ |
| **TableService** | - | - | ✅* | - | ✅ | - | ✅ |
| **SSEManager** | - | - | - | - | - | - | - |
| **FileService** | - | - | - | - | - | - | - |

> *TableService → OrderService: 이용 완료 시 주문 이력 이동 (순환 의존 주의 — 이벤트 기반 또는 직접 ORM 접근으로 해결)

---

## 데이터 흐름

### 고객 주문 흐름
```
고객 태블릿
    |
    v
[Client App - Customer Module]
    |
    | HTTP POST /api/customer/orders
    v
[Customer API Server]
    |
    v
[OrderService.createOrder()]
    |
    +---> [TableService.startSession()] (첫 주문 시)
    |
    +---> [ORM: Order, OrderItem 저장]
    |
    +---> [SSEManager.broadcastToStore()] ---> [Admin Dashboard 실시간 업데이트]
    |
    v
응답: { orderId, orderNumber }
```

### 관리자 주문 상태 변경 흐름
```
관리자 PC/태블릿
    |
    v
[Client App - Admin Module]
    |
    | HTTP PATCH /api/admin/orders/:id/status
    v
[Admin API Server]
    |
    v
[OrderService.updateOrderStatus()]
    |
    +---> [ORM: Order 상태 업데이트]
    |
    +---> [SSEManager.sendToTable()] ---> [고객 주문 내역 실시간 업데이트]
    |
    +---> [SSEManager.broadcastToStore()] ---> [Admin Dashboard 업데이트]
    |
    v
응답: { order (updated) }
```

### 테이블 이용 완료 흐름
```
관리자
    |
    | HTTP POST /api/admin/tables/:id/complete
    v
[Admin API Server]
    |
    v
[TableService.completeTable()]
    |
    +---> [ORM: 현재 세션 주문 → OrderHistory 이동]
    |
    +---> [ORM: TableSession 종료, 주문/총액 리셋]
    |
    +---> [SSEManager.broadcastToStore()] ---> [Admin Dashboard 업데이트]
    |
    v
응답: { success }
```

---

## 통신 패턴

| 패턴 | 사용처 | 설명 |
|---|---|---|
| REST API (HTTP) | Client ↔ Server | 모든 CRUD 작업 |
| SSE (Server → Client) | Server → Client | 실시간 주문 상태 업데이트 |
| 직접 호출 | Service → Service | 서비스 간 동기 호출 |
| 로컬 저장소 | Client 내부 | 장바구니 데이터 (localStorage) |
