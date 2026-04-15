import { Store, TableEntity, TableSession, Order, OrderItem, MenuItem, OrderHistory } from '../models';
import { NotFoundError, ValidationError, InvalidStateError } from '../utils/errors';
import type { CreateOrderItemRequest, OrderStatus } from '@shared/types';
import { logger } from '../utils/logger';
import sseManager from './SSEManager';

class OrderService {
  // 주문 생성
  async createOrder(
    storeId: string,
    tableId: string,
    sessionId: string | undefined,
    items: CreateOrderItemRequest[],
  ) {
    // 매장, 테이블 존재 확인
    const store = await Store.findByPk(storeId);
    if (!store) throw new NotFoundError('매장');

    const table = await TableEntity.findByPk(tableId);
    if (!table) throw new NotFoundError('테이블');

    // 항목 검증
    if (!items || items.length === 0) {
      throw new ValidationError('주문 항목은 최소 1개 이상이어야 합니다.');
    }

    for (const item of items) {
      if (!item.menuItemId || item.quantity < 1) {
        throw new ValidationError('각 항목의 menuItemId와 quantity(1 이상)는 필수입니다.');
      }
    }

    // 메뉴 아이템 조회
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.findAll({ where: { id: menuItemIds } });
    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundError('메뉴 항목');
    }

    // 세션 처리
    let session: TableSession;
    if (sessionId) {
      const existing = await TableSession.findOne({
        where: { id: sessionId, status: 'active' },
      });
      if (!existing) {
        // 활성 세션이 없으면 새로 생성
        session = await TableSession.create({
          tableId,
          storeId,
          status: 'active',
          startedAt: new Date(),
        });
      } else {
        session = existing;
      }
    } else {
      // 기존 활성 세션 확인
      const activeSession = await TableSession.findOne({
        where: { tableId, status: 'active' },
      });
      if (activeSession) {
        session = activeSession;
      } else {
        session = await TableSession.create({
          tableId,
          storeId,
          status: 'active',
          startedAt: new Date(),
        });
      }
    }

    // OrderItem 생성 데이터 준비 (스냅샷)
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    const orderItemsData = items.map((item) => {
      const menu = menuMap.get(item.menuItemId)!;
      return {
        menuItemId: item.menuItemId,
        menuName: menu.name,
        quantity: item.quantity,
        unitPrice: menu.price,
        subtotal: item.quantity * menu.price,
      };
    });

    // totalAmount 계산
    const totalAmount = orderItemsData.reduce((sum, item) => sum + item.subtotal, 0);

    // Order 생성
    const order = await Order.create({
      storeId,
      tableId,
      sessionId: session.id,
      totalAmount,
    });

    // OrderItem 생성
    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map((item) => ({ ...item, orderId: order.id })),
    );

    // SSE 이벤트 발행
    sseManager.broadcastToStore(storeId, {
      type: 'order:created',
      payload: {
        orderId: order.id,
        tableId,
        tableNumber: table.tableNumber,
        totalAmount,
        status: order.status,
        items: orderItems.map((oi) => ({
          menuName: oi.menuName,
          quantity: oi.quantity,
          subtotal: oi.subtotal,
        })),
      },
      timestamp: new Date().toISOString(),
    });

    logger.info('주문 생성 완료', { orderId: order.id, storeId, tableId });

    return {
      order: { ...order.toJSON(), items: orderItems.map((oi) => oi.toJSON()) },
      session: { id: session.id, startedAt: session.startedAt },
    };
  }

  // 주문 상태 변경
  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) throw new NotFoundError('주문');

    const validStatuses: OrderStatus[] = ['pending', 'preparing', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError(`유효하지 않은 상태입니다: ${newStatus}`);
    }

    order.status = newStatus;
    await order.save();

    // SSE 이벤트 발행 — 매장 전체 + 해당 테이블
    const event = {
      type: 'order:statusChanged' as const,
      payload: {
        orderId: order.id,
        tableId: order.tableId,
        status: newStatus,
        totalAmount: order.totalAmount,
      },
      timestamp: new Date().toISOString(),
    };
    sseManager.broadcastToStore(order.storeId, event);
    sseManager.sendToTable(order.storeId, order.tableId, event);

    logger.info('주문 상태 변경', { orderId, newStatus });

    return { order: order.toJSON() };
  }

  // 주문 삭제
  async deleteOrder(orderId: string) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) throw new NotFoundError('주문');

    const { storeId, tableId, sessionId } = order;

    // Order + OrderItem CASCADE 삭제
    await order.destroy();

    // 남은 주문 총액 재계산
    const remainingOrders = await Order.findAll({ where: { sessionId } });
    const updatedTableTotal = remainingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // SSE 이벤트 발행
    const event = {
      type: 'order:deleted' as const,
      payload: {
        deletedOrderId: orderId,
        tableId,
        updatedTableTotal,
      },
      timestamp: new Date().toISOString(),
    };
    sseManager.broadcastToStore(storeId, event);
    sseManager.sendToTable(storeId, tableId, event);

    logger.info('주문 삭제 완료', { orderId, updatedTableTotal });

    return { success: true, deletedOrderId: orderId, updatedTableTotal };
  }

  // 매장 활성 주문 조회 (관리자용)
  async getActiveOrdersByStore(storeId: string) {
    const orders = await Order.findAll({
      where: { storeId },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });

    // 테이블별 그룹화
    const tableMap = new Map<string, { tableId: string; orders: typeof orders }>();
    for (const order of orders) {
      const existing = tableMap.get(order.tableId);
      if (existing) {
        existing.orders.push(order);
      } else {
        tableMap.set(order.tableId, { tableId: order.tableId, orders: [order] });
      }
    }

    // 테이블 정보 조회
    const tableIds = [...tableMap.keys()];
    const tables = await TableEntity.findAll({ where: { id: tableIds } });
    const tableInfoMap = new Map(tables.map((t) => [t.id, t]));

    return [...tableMap.entries()].map(([tableId, data]) => {
      const tableInfo = tableInfoMap.get(tableId);
      const totalAmount = data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        tableId,
        tableNumber: tableInfo?.tableNumber,
        totalAmount,
        orders: data.orders.map((o) => o.toJSON()),
      };
    });
  }

  // 세션별 주문 조회 (고객용)
  async getOrdersBySession(sessionId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Order.findAndCountAll({
      where: { sessionId },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      orders: rows.map((o) => o.toJSON()),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default new OrderService();
