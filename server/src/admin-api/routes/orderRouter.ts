import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import OrderService from '../../shared/services/OrderService';
import { AppError } from '../../shared/utils/errors';

const router = Router();

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: 매장 활성 주문 조회
 *     tags: [Admin - Order]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 테이블별 주문 목록 }
 */
router.get('/', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId } = req.adminAuth!;
    const result = await OrderService.getActiveOrdersByStore(storeId);
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
});

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: 주문 상태 변경
 *     tags: [Admin - Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, preparing, completed] }
 *     responses:
 *       200: { description: 상태 변경 성공 }
 */
router.patch(
  '/:id/status',
  adminAuthMiddleware,
  [body('status').isIn(['pending', 'preparing', 'completed']).withMessage('유효한 상태가 필요합니다.')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;
      const result = await OrderService.updateOrderStatus(id, status);
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

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     summary: 주문 삭제
 *     tags: [Admin - Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: 삭제 성공 }
 */
router.delete('/:id', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await OrderService.deleteOrder(id);
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
});

export default router;
