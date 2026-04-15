# 도메인 엔티티 설계 — Unit 2-A

## ER 다이어그램

```
+----------+       +-------------+       +---------+       +----------+
|  Store   |1----N | StoreAdmin  |       | Category|1----N | MenuItem |
+----------+       +-------------+       +---------+       +----------+
| id (PK)  |       | id (PK)     |       | id (PK) |       | id (PK)  |
| name     |       | storeId(FK) |       | storeId |       | categoryId|
| address  |       | username    |       | name    |       | name     |
| phone    |       | password    |       | sortOrder|      | price    |
| createdAt|       | createdAt   |       | createdAt|      | description|
| updatedAt|       | updatedAt   |       | updatedAt|      | imageUrl |
+----------+       +-------------+       +---------+       | sortOrder|
     |1                                                     | createdAt|
     |                                                      | updatedAt|
     N                                                      +----------+
+-------------+       +---------------+
| TableEntity |1----N | TableSession  |
+-------------+       +---------------+
| id (PK)     |       | id (PK)       |
| storeId(FK) |       | tableId (FK)  |
| tableNumber |       | storeId (FK)  |
| password    |       | status        |
| createdAt   |       | startedAt     |
| updatedAt   |       | completedAt   |
+-------------+       | createdAt     |
                       | updatedAt     |
                       +---------------+
                            |1
                            N
+----------+       +------------+       +--------------+
|  Order   |1----N | OrderItem  |       | OrderHistory |
+----------+       +------------+       +--------------+
| id (PK)  |       | id (PK)    |       | id (PK)      |
| storeId  |       | orderId(FK)|       | orderId      |
| tableId  |       | menuItemId |       | storeId      |
| sessionId|       | menuName   |       | tableId      |
| orderNumber|     | quantity   |       | sessionId    |
| status   |       | unitPrice  |       | orderNumber  |
| totalAmount|     | subtotal   |       | totalAmount  |
| createdAt|       | createdAt  |       | items (JSON) |
| updatedAt|       +------------+       | orderedAt    |
+----------+                            | completedAt  |
                                        | createdAt    |
                                        +--------------+
```

---

## 엔티티 상세 정의

### Store (매장)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 매장 고유 식별자 |
| name | STRING(100) | NOT NULL | 매장명 |
| address | STRING(255) | NULLABLE | 매장 주소 |
| phone | STRING(20) | NULLABLE | 매장 전화번호 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### StoreAdmin (매장 관리자)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 관리자 고유 식별자 |
| storeId | UUID | FK → Store.id, NOT NULL | 소속 매장 |
| username | STRING(50) | NOT NULL, UNIQUE(storeId, username) | 사용자명 |
| password | STRING(255) | NOT NULL | bcrypt 해시 비밀번호 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### TableEntity (테이블)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 테이블 고유 식별자 |
| storeId | UUID | FK → Store.id, NOT NULL | 소속 매장 |
| tableNumber | INTEGER | NOT NULL, UNIQUE(storeId, tableNumber) | 테이블 번호 |
| password | STRING(255) | NOT NULL | bcrypt 해시 비밀번호 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### TableSession (테이블 세션)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 세션 고유 식별자 |
| tableId | UUID | FK → TableEntity.id, NOT NULL | 테이블 |
| storeId | UUID | FK → Store.id, NOT NULL | 매장 (조회 편의) |
| status | ENUM('active','completed') | NOT NULL, DEFAULT 'active' | 세션 상태 |
| startedAt | TIMESTAMP | NOT NULL | 세션 시작 시각 |
| completedAt | TIMESTAMP | NULLABLE | 세션 종료 시각 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### Category (메뉴 카테고리)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 카테고리 고유 식별자 |
| storeId | UUID | FK → Store.id, NOT NULL | 소속 매장 |
| name | STRING(50) | NOT NULL | 카테고리명 |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 노출 순서 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### MenuItem (메뉴 항목)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 메뉴 고유 식별자 |
| categoryId | UUID | FK → Category.id, NOT NULL | 소속 카테고리 |
| name | STRING(100) | NOT NULL | 메뉴명 |
| price | INTEGER | NOT NULL, >= 0 | 가격 (원 단위) |
| description | TEXT | NULLABLE | 메뉴 설명 |
| imageUrl | STRING(500) | NULLABLE | 이미지 URL |
| sortOrder | INTEGER | NOT NULL, DEFAULT 0 | 노출 순서 |
| createdAt | TIMESTAMP | auto | 생성 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### Order (주문)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 주문 고유 식별자 (= 주문 번호) |
| storeId | UUID | FK → Store.id, NOT NULL | 매장 |
| tableId | UUID | FK → TableEntity.id, NOT NULL | 테이블 |
| sessionId | UUID | FK → TableSession.id, NOT NULL | 세션 |
| status | ENUM('pending','preparing','completed') | NOT NULL, DEFAULT 'pending' | 주문 상태 |
| totalAmount | INTEGER | NOT NULL, >= 0 | 총 주문 금액 |
| createdAt | TIMESTAMP | auto | 주문 시각 |
| updatedAt | TIMESTAMP | auto | 수정 시각 |

### OrderItem (주문 항목)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 항목 고유 식별자 |
| orderId | UUID | FK → Order.id, NOT NULL, CASCADE | 소속 주문 |
| menuItemId | UUID | FK → MenuItem.id, NOT NULL | 메뉴 항목 |
| menuName | STRING(100) | NOT NULL | 주문 시점 메뉴명 (스냅샷) |
| quantity | INTEGER | NOT NULL, >= 1 | 수량 |
| unitPrice | INTEGER | NOT NULL, >= 0 | 주문 시점 단가 (스냅샷) |
| subtotal | INTEGER | NOT NULL, >= 0 | 소계 (quantity * unitPrice) |
| createdAt | TIMESTAMP | auto | 생성 시각 |

### OrderHistory (과거 주문 이력)
| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, auto-generated | 이력 고유 식별자 |
| orderId | UUID | NOT NULL | 원본 주문 ID |
| storeId | UUID | NOT NULL | 매장 |
| tableId | UUID | NOT NULL | 테이블 |
| sessionId | UUID | NOT NULL | 세션 |
| orderNumber | UUID | NOT NULL | 주문 번호 |
| totalAmount | INTEGER | NOT NULL | 총 금액 |
| items | JSONB | NOT NULL | 주문 항목 스냅샷 |
| orderedAt | TIMESTAMP | NOT NULL | 원본 주문 시각 |
| completedAt | TIMESTAMP | NOT NULL | 이용 완료 시각 |
| createdAt | TIMESTAMP | auto | 이력 생성 시각 |
