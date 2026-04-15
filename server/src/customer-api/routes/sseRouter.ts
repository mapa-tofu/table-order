import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { tableAuthMiddleware } from '../middleware/tableAuth';
import sseManager from '../../shared/services/SSEManager';

const router = Router();

/**
 * @swagger
 * /api/customer/sse:
 *   get:
 *     summary: 고객용 SSE 연결
 *     tags: [Customer - SSE]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: SSE 스트림 }
 */
router.get('/', tableAuthMiddleware, (req: Request, res: Response) => {
  const { storeId, tableId } = req.tableAuth!;
  const clientId = uuidv4();
  const lastEventId = req.headers['last-event-id']
    ? parseInt(req.headers['last-event-id'] as string, 10)
    : undefined;

  sseManager.addClient(clientId, storeId, 'customer', tableId, res, lastEventId);
});

export default router;
