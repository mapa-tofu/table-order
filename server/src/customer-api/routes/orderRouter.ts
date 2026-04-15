import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { tableAuthMiddleware } from '../middleware/tableAuth';
import OrderService from '../../shared/services/OrderService';
import { AppError } from '../../shared/utils/errors';

const router = Router();

/**
 * @swagger
 * /api/customer/orders:
 *   post:
 *     summary: 주문 생성
 *     tags: [Customer - Order]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId: { type: string, format: uuid }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: 주문 생성 성공 }
 */
router.post(
  '/',
  tableAuthMiddleware,
  [
    body('items').isArray({ min: 1 }).withMessage('주문 항목은 최소 1개 이상이어야 합니다.'),
    body('items.*.menuItemId').isUUID().withMessage('유효한 메뉴 ID가 필요합니다.'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('수량은 1 이상이어야 합니다.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { storeId, tableId, sessionId } = req.tableAuth!;
      const { items } = req.body;
      const result = await OrderService.createOrder(storeId, tableId, sessionId, items);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          requestId: req.requestId,
        });
      } else {
        next(error);
      }
    }
  },
);

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: 현재 세션 주문 조회
 *     tags: [Customer - Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: 주문 목록 }
 */
router.get(
  '/',
  tableAuthMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.tableAuth!;
      if (!sessionId) {
        res.json({ orders: [], total: 0, page: 1, totalPages: 0 });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await OrderService.getOrdersBySession(sessionId, page, limit);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: { code: error.code, message: error.message },
          requestId: req.requestId,
        });
      } else {
        next(error);
      }
    }
  },
);

export default router;
