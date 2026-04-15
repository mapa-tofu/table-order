import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import AuthService from '../../shared/services/AuthService';
import { AppError } from '../../shared/utils/errors';

const router = Router();

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: 관리자 로그인
 *     tags: [Admin - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeId, username, password]
 *             properties:
 *               storeId: { type: string, format: uuid }
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: 로그인 성공 }
 *       401: { description: 인증 실패 }
 *       429: { description: 시도 횟수 초과 }
 */
router.post(
  '/login',
  [
    body('storeId').isUUID().withMessage('유효한 매장 ID가 필요합니다.'),
    body('username').notEmpty().withMessage('사용자명은 필수입니다.'),
    body('password').notEmpty().withMessage('비밀번호는 필수입니다.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', details: errors.array() } });
        return;
      }

      const { storeId, username, password } = req.body;
      const result = await AuthService.adminLogin(storeId, username, password);
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
