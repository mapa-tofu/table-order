import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Store, StoreAdmin, TableEntity, TableSession } from '../models';
import {
  AuthenticationError,
  NotFoundError,
  TooManyAttemptsError,
} from '../utils/errors';
import type {
  TableLoginResponse,
  AdminLoginResponse,
  TableJwtPayload,
  AdminJwtPayload,
} from '@shared/types';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;

// 메모리 기반 로그인 시도 카운터 (매장+사용자명 기준)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

class AuthService {
  private get jwtSecret(): string {
    return process.env.JWT_SECRET || 'default-secret';
  }

  private get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '16h';
  }

  // 비밀번호 해싱
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // 비밀번호 검증
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // JWT 토큰 생성
  generateToken(payload: TableJwtPayload | AdminJwtPayload): string {
    return jwt.sign({ ...payload }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as string | number,
    } as jwt.SignOptions);
  }

  // JWT 토큰 검증
  verifyToken(token: string): TableJwtPayload | AdminJwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TableJwtPayload | AdminJwtPayload;
    } catch {
      throw new AuthenticationError('유효하지 않은 토큰입니다.');
    }
  }

  // 테이블 로그인
  async tableLogin(
    storeId: string,
    tableNumber: number,
    password: string,
  ): Promise<TableLoginResponse> {
    // 매장 존재 확인
    const store = await Store.findByPk(storeId);
    if (!store) throw new NotFoundError('매장');

    // 테이블 조회
    const table = await TableEntity.findOne({
      where: { storeId, tableNumber },
    });
    if (!table) throw new NotFoundError('테이블');

    // 비밀번호 검증
    const isValid = await this.comparePassword(password, table.password);
    if (!isValid) throw new AuthenticationError('비밀번호가 일치하지 않습니다.');

    // 활성 세션 조회
    const activeSession = await TableSession.findOne({
      where: { tableId: table.id, status: 'active' },
    });

    // JWT 토큰 생성
    const payload: TableJwtPayload = {
      storeId,
      tableId: table.id,
      tableNumber: table.tableNumber,
      ...(activeSession && { sessionId: activeSession.id }),
    };
    const token = this.generateToken(payload);

    logger.info('테이블 로그인 성공', { storeId, tableNumber });

    return {
      token,
      table: { id: table.id, storeId, tableNumber: table.tableNumber },
      ...(activeSession && {
        activeSession: { id: activeSession.id, startedAt: activeSession.startedAt },
      }),
    };
  }

  // 관리자 로그인
  async adminLogin(
    storeId: string,
    username: string,
    password: string,
  ): Promise<AdminLoginResponse> {
    // 매장 존재 확인
    const store = await Store.findByPk(storeId);
    if (!store) throw new NotFoundError('매장');

    // 로그인 시도 횟수 확인
    const attemptKey = `${storeId}:${username}`;
    const attempts = loginAttempts.get(attemptKey);
    if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
      // 30분 후 리셋
      const elapsed = Date.now() - attempts.lastAttempt.getTime();
      if (elapsed < 30 * 60 * 1000) {
        throw new TooManyAttemptsError();
      }
      loginAttempts.delete(attemptKey);
    }

    // 관리자 조회
    const admin = await StoreAdmin.findOne({
      where: { storeId, username },
    });
    if (!admin) {
      this.incrementLoginAttempts(attemptKey);
      throw new AuthenticationError('사용자명 또는 비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 검증
    const isValid = await this.comparePassword(password, admin.password);
    if (!isValid) {
      this.incrementLoginAttempts(attemptKey);
      throw new AuthenticationError('사용자명 또는 비밀번호가 일치하지 않습니다.');
    }

    // 로그인 성공 — 시도 횟수 리셋
    loginAttempts.delete(attemptKey);

    // JWT 토큰 생성
    const payload: AdminJwtPayload = {
      storeId,
      adminId: admin.id,
      username: admin.username,
      role: 'admin',
    };
    const token = this.generateToken(payload);

    logger.info('관리자 로그인 성공', { storeId, username });

    return {
      token,
      admin: { id: admin.id, storeId, username: admin.username },
    };
  }

  private incrementLoginAttempts(key: string): void {
    const current = loginAttempts.get(key);
    loginAttempts.set(key, {
      count: (current?.count || 0) + 1,
      lastAttempt: new Date(),
    });
  }
}

export default new AuthService();
