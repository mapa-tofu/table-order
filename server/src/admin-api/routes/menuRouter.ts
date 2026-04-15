import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { uploadMiddleware } from '../middleware/fileUpload';
import MenuService from '../../shared/services/MenuService';
import FileService from '../../shared/services/FileService';
import { AppError } from '../../shared/utils/errors';

const router = Router();

/**
 * @swagger
 * /api/admin/menus:
 *   get:
 *     summary: 매장 메뉴 조회
 *     tags: [Admin - Menu]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId } = req.adminAuth!;
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

/**
 * @swagger
 * /api/admin/menus:
 *   post:
 *     summary: 메뉴 등록
 *     tags: [Admin - Menu]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/',
  adminAuthMiddleware,
  uploadMiddleware.single('image'),
  [
    body('name').notEmpty().isLength({ max: 100 }).withMessage('메뉴명은 1~100자여야 합니다.'),
    body('price').isInt({ min: 0 }).withMessage('가격은 0 이상 정수여야 합니다.'),
    body('categoryId').isUUID().withMessage('유효한 카테고리 ID가 필요합니다.'),
    body('sortOrder').optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { storeId } = req.adminAuth!;
      let imageUrl: string | undefined;

      // 이미지 업로드 (비동기)
      if (req.file) {
        imageUrl = await FileService.uploadImage(req.file, storeId);
      }

      const result = await MenuService.createMenu(storeId, {
        ...req.body,
        price: parseInt(req.body.price, 10),
        sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder, 10) : undefined,
        imageUrl,
      });

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
 * /api/admin/menus/{id}:
 *   put:
 *     summary: 메뉴 수정
 *     tags: [Admin - Menu]
 *     security: [{ bearerAuth: [] }]
 */
router.put(
  '/:id',
  adminAuthMiddleware,
  uploadMiddleware.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storeId } = req.adminAuth!;
      const { id: menuId } = req.params;
      let imageUrl: string | undefined;

      if (req.file) {
        imageUrl = await FileService.uploadImage(req.file, storeId, menuId);
      }

      const updateData = {
        ...req.body,
        ...(req.body.price !== undefined && { price: parseInt(req.body.price, 10) }),
        ...(req.body.sortOrder !== undefined && { sortOrder: parseInt(req.body.sortOrder, 10) }),
        ...(imageUrl && { imageUrl }),
      };

      const result = await MenuService.updateMenu(menuId, updateData);
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
 * /api/admin/menus/{id}:
 *   delete:
 *     summary: 메뉴 삭제
 *     tags: [Admin - Menu]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', adminAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: menuId } = req.params;
    const { imageUrl } = await MenuService.deleteMenu(menuId);

    // 이미지가 있으면 S3에서도 삭제
    if (imageUrl) {
      await FileService.deleteImage(imageUrl);
    }

    res.status(204).send();
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
 * /api/admin/menus/reorder:
 *   put:
 *     summary: 메뉴 순서 재정렬
 *     tags: [Admin - Menu]
 *     security: [{ bearerAuth: [] }]
 */
router.put(
  '/reorder',
  adminAuthMiddleware,
  [
    body('categoryId').isUUID().withMessage('유효한 카테고리 ID가 필요합니다.'),
    body('menuIds').isArray({ min: 1 }).withMessage('메뉴 ID 목록이 필요합니다.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { storeId } = req.adminAuth!;
      const { categoryId, menuIds } = req.body;
      await MenuService.reorderMenus(storeId, categoryId, menuIds);
      res.json({ success: true });
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
