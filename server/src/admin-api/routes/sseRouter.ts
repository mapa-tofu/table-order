import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import sseManager from '../../shared/services/SSEManager';

const router = Router();

/**
 * @swagger
 * /api/admin/sse:
 *   get:
 *     summary: 관리자용 SSE 연결
 *     tags: [Admin - SSE]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: SSE 스트림 }
 */
router.get('/', adminAuthMiddleware, (req: Request, res: Response) => {
  const { storeId } = req.adminAuth!;
  const clientId = uuidv4();
  const lastEventId = req.headers['last-event-id']
    ? parseInt(req.headers['last-event-id'] as string, 10)
    : undefined;

  sseManager.addClient(clientId, storeId, 'admin', undefined, res, lastEventId);
});

export default router;
