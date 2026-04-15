import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Express Request에 requestId 추가
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

// 요청 ID 미들웨어 — 각 요청에 UUID 부여
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = uuidv4();
  next();
}
