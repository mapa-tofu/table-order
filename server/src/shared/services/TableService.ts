import { Op } from 'sequelize';
import { Store, TableEntity, TableSession, Order, OrderItem, OrderHistory } from '../models';
import {
  NotFoundError,
  DuplicateError,
  InvalidStateError,
} from '../utils/errors';
import AuthService from './AuthService';
import sseManager from './SSEManager';
import { logger } from '../utils/logger';
import type { TableSummary, OrderHistoryItem } from '@shared/types';

class TableService {
  // 테이블 초기 설정
  async setupTable(storeId: string, tableNumber: number, password: string) {
    // 매장 존재 확인
    const store = await Store.findByPk(storeId);
    if (!store) throw new NotFoundError('매장');

    // 중복 확인
    const existing = await TableEntity.findOne({
      where: { storeId, tableNumber },
    });
    if (existing) throw new DuplicateError('테이블 번호');

    // 비밀번호 해싱
    const hashedPassword = await AuthService.hashPassword(password);

    // 테이블 생성
    const table = await TableEntity.create({
      storeId,
      tableNumber,
      password: hashedPassword,
    });

    // JWT 토큰 생성
    const token = AuthService.generateToken({
      storeId,
      tableId: table.id,
      tableNumber,
    });

    logger.info('테이블 설정 완료', { storeId, tableNumber });

    return { table: table.toJSON(), token };
  }

  // 테이블 이용 완료
  async completeTable(tableId: string, sessionId: string) {
    // 테이블, 세션 존재 확인
    const table = await TableEntity.findByPk(tableId);
    if (!table) throw new NotFoundError('테이블');

    const session = await TableSession.findByPk(sessionId);
    if (!session) throw new NotFoundError('세션');

    if (session.status !== 'active') {
      throw new InvalidStateError('이미 완료된 세션입니다.');
    }

    // 해당 세션의 모든 주문 조회
    const orders = await Order.findAll({
      where: { sessionId },
      include: [{ model: OrderItem, as: 'items' }],
    });

    // Order → OrderHistory 복사
    const now = new Date();
    for (const order of orders) {
      const items: OrderHistoryItem[] = (order.items || []).map((oi) => ({
        menuItemId: oi.menuItemId,
        menuName: oi.menuName,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        subtotal: oi.subtotal,
      }));

      await OrderHistory.create({
        orderId: order.id,
        storeId: order.storeId,
        tableId: order.tableId,
        sessionId: order.sessionId,
        orderNumber: order.id,
        totalAmount: order.totalAmount,
        items,
        orderedAt: order.createdAt,
        completedAt: now,
      });
    }

    // 주문 + 주문 항목 삭제
    for (const order of orders) {
      await order.destroy(); // CASCADE로 OrderItem도 삭제
    }

    // 세션 완료 처리
    session.status = 'completed';
    session.completedAt = now;
    await session.save();

    // SSE 이벤트 발행
    sseManager.broadcastToStore(table.storeId, {
      type: 'table:completed',
      payload: {
        tableId,
        tableNumber: table.tableNumber,
        sessionId,
        historyCount: orders.length,
      },
      timestamp: now.toISOString(),
    });

    logger.info('테이블 이용 완료', { tableId, sessionId, historyCount: orders.length });

    return { success: true, historyCount: orders.length };
  }

  // 과거 주문 내역 조회
  async getOrderHistory(tableId: string, dateFilter?: { startDate?: Date; endDate?: Date }) {
    const where: Record<string, unknown> = { tableId };

    if (dateFilter?.startDate || dateFilter?.endDate) {
      const createdAtFilter: Record<string, Date> = {};
      if (dateFilter.startDate) createdAtFilter[Op.gte as unknown as string] = dateFilter.startDate;
      if (dateFilter.endDate) createdAtFilter[Op.lte as unknown as string] = dateFilter.endDate;
      where.createdAt = createdAtFilter;
    }

    const histories = await OrderHistory.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return histories.map((h) => h.toJSON());
  }

  // 테이블 요약 (관리자용)
  async getTableSummary(storeId: string): Promise<TableSummary[]> {
    const tables = await TableEntity.findAll({
      where: { storeId },
      order: [['tableNumber', 'ASC']],
    });

    const summaries: TableSummary[] = [];

    for (const table of tables) {
      // 활성 세션 조회
      const activeSession = await TableSession.findOne({
        where: { tableId: table.id, status: 'active' },
      });

      let totalAmount = 0;
      let orderCount = 0;

      if (activeSession) {
        const orders = await Order.findAll({
          where: { sessionId: activeSession.id },
        });
        totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        orderCount = orders.length;
      }

      summaries.push({
        id: table.id,
        tableNumber: table.tableNumber,
        ...(activeSession && {
          activeSession: { id: activeSession.id, startedAt: activeSession.startedAt },
        }),
        totalAmount,
        orderCount,
      });
    }

    return summaries;
  }
}

export default new TableService();
