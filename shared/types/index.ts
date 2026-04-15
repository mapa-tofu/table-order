// ===== 도메인 엔티티 타입 =====

export interface IStore {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreAdmin {
  id: string;
  storeId: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITableEntity {
  id: string;
  storeId: string;
  tableNumber: number;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = 'active' | 'completed';

export interface ITableSession {
  id: string;
  tableId: string;
  storeId: string;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface IOrder {
  id: string;
  storeId: string;
  tableId: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
}

export interface IOrderHistory {
  id: string;
  orderId: string;
  storeId: string;
  tableId: string;
  sessionId: string;
  orderNumber: string;
  totalAmount: number;
  items: OrderHistoryItem[];
  orderedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

export interface OrderHistoryItem {
  menuItemId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ===== API 요청/응답 타입 =====

// 고객 인증
export interface TableLoginRequest {
  storeId: string;
  tableNumber: number;
  password: string;
}

export interface TableLoginResponse {
  token: string;
  table: { id: string; storeId: string; tableNumber: number };
  activeSession?: { id: string; startedAt: Date };
}

// 관리자 인증
export interface AdminLoginRequest {
  storeId: string;
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: { id: string; storeId: string; username: string };
}

// 주문 생성
export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderResponse {
  order: IOrder & { items: IOrderItem[] };
  session: { id: string; startedAt: Date };
}

// 주문 상태 변경
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// 테이블 설정
export interface SetupTableRequest {
  tableNumber: number;
  password: string;
}

// 메뉴 생성/수정
export interface CreateMenuRequest {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  sortOrder?: number;
}

export interface UpdateMenuRequest {
  name?: string;
  price?: number;
  description?: string;
  categoryId?: string;
  sortOrder?: number;
}

export interface ReorderMenusRequest {
  categoryId: string;
  menuIds: string[];
}

// 카테고리 + 메뉴 조회 응답
export interface CategoryWithMenus {
  id: string;
  name: string;
  sortOrder: number;
  menus: IMenuItem[];
}

// 테이블 요약
export interface TableSummary {
  id: string;
  tableNumber: number;
  activeSession?: { id: string; startedAt: Date };
  totalAmount: number;
  orderCount: number;
}

// ===== SSE 이벤트 타입 =====

export type SSEEventType =
  | 'order:created'
  | 'order:statusChanged'
  | 'order:deleted'
  | 'table:completed';

export interface SSEEvent {
  type: SSEEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ===== JWT 페이로드 타입 =====

export interface TableJwtPayload {
  storeId: string;
  tableId: string;
  tableNumber: number;
  sessionId?: string;
}

export interface AdminJwtPayload {
  storeId: string;
  adminId: string;
  username: string;
  role: 'admin';
}

// ===== 에러 응답 타입 =====

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}
