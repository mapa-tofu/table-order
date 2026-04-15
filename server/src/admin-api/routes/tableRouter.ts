import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import TableService from '../../shared/services/TableService';
import { AppError } from '../../shared/utils/errors';
import { TableSession } from '../../shared/models';

const router = Router();

/**
 * @swagger
 * /api/admin/tables/setup:
 *   post:
 *     summary: 테이블 초기 설정
 *     tags: [Admin - Table]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/setup',
  adminAuthMiddleware,
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('테이블 번호는 1 이상이어야 합니다.'),
    body('password').notEmpty().withMessage('비밀번호는 필수입니다.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { storeId } = req.adminAuth!;
      const { tableNumber, password } = req.body;
      const result = await TableService.setupTable(storeId, tableNumber, password);
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
 * /api/admin/tables/{id}/complete:
 *   post:
 *     summary: 테이블 이용 완료
 *     tags: [Admin - Table]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/:id/complete',
  adminAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: tableId } = req.params;

      // 활성 세션 조회
      const activeSession = await TableSession.findOne({
        where: { tableId, status: 'active' },
      });
      if (!activeSession) {
        res.status(404).json({
          error: { code: 'NOT_FOUND_ERROR', message: '활성 세션이 없습니다.' },
        });
        return;
      }

      const result = await TableService.completeTable(tableId, activeSession.id);
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
 * /api/admin/tables/{id}/history:
 *   get:
 *     summary: 테이블 과거 주문 내역 조회
 *     tags: [Admin - Table]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/:id/history',
  adminAuthMiddleware,
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: tableId } = req.params;
      const dateFilter = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const result = await TableService.getOrderHistory(tableId, dateFilter);
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
 * /api/admin/tables/summary:
 *   get:
 *     summary: 테이블 요약 조회
 *     tags: [Admin - Table]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/summary', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId } = req.adminAuth!;
    const result = await TableService.getTableSummary(storeId);
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
