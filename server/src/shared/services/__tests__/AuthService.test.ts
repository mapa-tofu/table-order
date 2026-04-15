import fc from 'fast-check';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AuthService from '../AuthService';

// 환경 변수 설정
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

describe('AuthService', () => {
  describe('hashPassword / comparePassword', () => {
    it('해싱된 비밀번호를 올바르게 검증해야 한다', async () => {
      const password = 'test-password-123';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('잘못된 비밀번호는 검증 실패해야 한다', async () => {
      const hash = await AuthService.hashPassword('correct-password');
      const isValid = await AuthService.comparePassword('wrong-password', hash);
      expect(isValid).toBe(false);
    });

    // PBT: bcrypt 해싱/검증 — Easy verification
    it('[PBT] 임의의 비밀번호에 대해 hash → compare가 항상 true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            const hash = await AuthService.hashPassword(password);
            const result = await AuthService.comparePassword(password, hash);
            expect(result).toBe(true);
          },
        ),
        { numRuns: 10 }, // bcrypt가 느리므로 횟수 제한
      );
    });
  });

  describe('generateToken / verifyToken', () => {
    it('테이블 JWT 토큰을 생성하고 검증해야 한다', () => {
      const payload = {
        storeId: 'store-1',
        tableId: 'table-1',
        tableNumber: 5,
      };
      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);
      expect(decoded).toMatchObject(payload);
    });

    it('관리자 JWT 토큰을 생성하고 검증해야 한다', () => {
      const payload = {
        storeId: 'store-1',
        adminId: 'admin-1',
        username: 'admin',
        role: 'admin' as const,
      };
      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);
      expect(decoded).toMatchObject(payload);
    });

    it('유효하지 않은 토큰은 에러를 발생시켜야 한다', () => {
      expect(() => AuthService.verifyToken('invalid-token')).toThrow('유효하지 않은 토큰');
    });

    // PBT: JWT 토큰 생성/검증 Round-trip
    it('[PBT] 임의의 페이로드에 대해 sign → verify가 원본 데이터를 보존', () => {
      fc.assert(
        fc.property(
          fc.record({
            storeId: fc.uuid(),
            tableId: fc.uuid(),
            tableNumber: fc.integer({ min: 1, max: 999 }),
          }),
          (payload) => {
            const token = AuthService.generateToken(payload);
            const decoded = AuthService.verifyToken(token);
            expect(decoded).toMatchObject(payload);
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});
