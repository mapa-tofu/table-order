import { Request, Response, NextFunction } from 'express';
import AuthService from '../../shared/services/AuthService';
import type { TableJwtPayload } from '@shared/types';

// Express Request에 테이블 인증 정보 추가
declare global {
  namespace Express {
    interface Request {
      tableAuth?: TableJwtPayload;
    }
  }
}

// 테이블 JWT 검증 미들웨어
export function tableAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'AUTHENTICATION_ERROR', message: '인증 토큰이 필요합니다.' },
    });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyToken(token) as TableJwtPayload;

    // 테이블 JWT인지 확인 (role이 없어야 함)
    if ('role' in payload) {
      res.status(403).json({
        error: { code: 'AUTHORIZATION_ERROR', message: '테이블 인증이 필요합니다.' },
      });
      return;
    }

    req.tableAuth = payload;
    next();
  } catch {
    res.status(401).json({
      error: { code: 'AUTHENTICATION_ERROR', message: '유효하지 않은 토큰입니다.' },
    });
  }
}
