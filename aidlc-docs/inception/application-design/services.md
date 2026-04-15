# 서비스 레이어 설계 (Services)

---

## 서비스 아키텍처 개요

```
+------------------+     +------------------+
|  Customer API    |     |  Admin API       |
|  (Express)       |     |  (Express)       |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------------------------------------+
|           Shared Service Layer                  |
|  AuthService | MenuService | OrderService      |
|  TableService | SSEManager | FileService       |
+------------------------+-----------------------+
                         |
                         v
+------------------------------------------------+
|           Data Layer (ORM)                      |
|  Store | StoreAdmin | TableEntity | Category   |
|  MenuItem | Order | OrderItem | OrderHistory   |
|  TableSession                                  |
+------------------------+-----------------------+
                         |
                         v
+------------------------------------------------+
|           PostgreSQL Database                   |
+------------------------------------------------+
```

---

## 서비스 정의

### 1. AuthService
- **책임**: 인증/인가 처리 (테이블 + 관리자)
- **소비자**: Customer API (테이블 로그인), Admin API (관리자 로그인)
- **의존성**: ORM Models (StoreAdmin, TableEntity), JWT 라이브러리, bcrypt
- **오케스트레이션**: 독립적 — 다른 서비스를 호출하지 않음

### 2. MenuService
- **책임**: 메뉴 CRUD 및 조회
- **소비자**: Customer API (조회), Admin API (CRUD)
- **의존성**: ORM Models (MenuItem, Category), FileService (이미지 업로드)
- **오케스트레이션**: 메뉴 등록/수정 시 FileService 호출하여 이미지 처리

### 3. OrderService
- **책임**: 주문 생성, 조회, 상태 변경, 삭제
- **소비자**: Customer API (생성/조회), Admin API (상태변경/삭제/조회)
- **의존성**: ORM Models (Order, OrderItem, OrderHistory), TableService, SSEManager
- **오케스트레이션**:
  - 주문 생성 시: TableService.startSession() (첫 주문이면) → Order 저장 → SSEManager.broadcastToStore()
  - 상태 변경 시: Order 업데이트 → SSEManager.sendToTable() + broadcastToStore()
  - 삭제 시: Order 삭제 → SSEManager.broadcastToStore()

### 4. TableService
- **책임**: 테이블 설정, 세션 관리, 이용 완료 처리
- **소비자**: Admin API (설정/이용완료/과거내역), OrderService (세션 시작)
- **의존성**: ORM Models (TableEntity, TableSession, OrderHistory), OrderService (이용 완료 시)
- **오케스트레이션**:
  - 이용 완료 시: 현재 세션 주문 → OrderHistory로 이동 → 세션 종료 → SSEManager.broadcastToStore()

### 5. SSEManager
- **책임**: SSE 연결 관리 및 실시간 이벤트 전파
- **소비자**: Customer API (고객 SSE), Admin API (관리자 SSE), OrderService, TableService
- **의존성**: 없음 (인메모리 연결 풀)
- **오케스트레이션**: 독립적 — 이벤트를 수신하여 연결된 클라이언트에 전파

### 6. FileService
- **책임**: 이미지 파일 업로드/삭제 (S3)
- **소비자**: MenuService (메뉴 이미지)
- **의존성**: AWS S3 SDK
- **오케스트레이션**: 독립적

---

## SSE 이벤트 타입

| 이벤트 | 발생 시점 | 대상 |
|---|---|---|
| `order:created` | 새 주문 생성 | 관리자 (매장 전체) |
| `order:statusChanged` | 주문 상태 변경 | 관리자 + 해당 테이블 고객 |
| `order:deleted` | 주문 삭제 | 관리자 + 해당 테이블 고객 |
| `table:completed` | 테이블 이용 완료 | 관리자 (매장 전체) |
