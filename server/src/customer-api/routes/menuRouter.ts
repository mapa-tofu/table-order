import { Router, Request, Response, NextFunction } from 'express';
import { tableAuthMiddleware } from '../middleware/tableAuth';
import MenuService from '../../shared/services/MenuService';
import { AppError } from '../../shared/utils/errors';

const router = Router();

/**
 * @swagger
 * /api/customer/menus:
 *   get:
 *     summary: 매장 메뉴 조회 (카테고리별)
 *     tags: [Customer - Menu]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 카테고리별 메뉴 목록 }
 */
router.get('/', tableAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId } = req.tableAuth!;
    const menus = await MenuService.getMenusByStore(storeId);
    res.json(menus);
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
