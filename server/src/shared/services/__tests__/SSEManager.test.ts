import fc from 'fast-check';
import SSEManager from '../SSEManager';
import type { SSEEvent } from '@shared/types';

// SSEManager 인스턴스를 직접 생성하여 테스트 격리
// (싱글톤 대신 클래스를 직접 인스턴스화)
function createSSEManager() {
  // 모듈의 default export는 싱글톤이므로, 테스트용 새 인스턴스 생성
  const SSEManagerClass = SSEManager.constructor as new () => typeof SSEManager;
  return new SSEManagerClass();
}

// mock Response 생성
function createMockResponse() {
  const chunks: string[] = [];
  return {
    writeHead: jest.fn(),
    write: jest.fn((data: string) => {
      chunks.push(data);
      return true;
    }),
    on: jest.fn(),
    end: jest.fn(),
    chunks,
  } as unknown as import('express').Response;
}

describe('SSEManager — PBT', () => {
  // PBT: addClient/removeClient Stateful 테스트
  describe('클라이언트 관리 상태 일관성', () => {
    it('[PBT] add/remove 시퀀스 후 클라이언트 수가 일관적', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              action: fc.constantFrom('add', 'remove'),
              clientId: fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e'), {
                minLength: 1,
                maxLength: 1,
              }),
            }),
            { minLength: 1, maxLength: 30 },
          ),
          (operations) => {
            const manager = createSSEManager();
            const activeClients = new Set<string>();

            for (const op of operations) {
              if (op.action === 'add') {
                const mockRes = createMockResponse();
                manager.addClient(op.clientId, 'store-1', 'customer', undefined, mockRes);
                activeClients.add(op.clientId);
              } else {
                manager.removeClient(op.clientId);
                activeClients.delete(op.clientId);
              }
            }

            // 상태 일관성: 추적한 활성 클라이언트 수와 실제 수가 동일
            expect(manager.getClientCount()).toBe(activeClients.size);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('[PBT] 동일 clientId로 add 시 덮어쓰기 (중복 없음)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (addCount) => {
            const manager = createSSEManager();

            for (let i = 0; i < addCount; i++) {
              const mockRes = createMockResponse();
              manager.addClient('same-client', 'store-1', 'customer', undefined, mockRes);
            }

            // 동일 ID로 여러 번 add해도 클라이언트 수는 1
            expect(manager.getClientCount()).toBe(1);
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe('이벤트 브로드캐스트', () => {
    it('매장의 모든 클라이언트에 이벤트를 전송해야 한다', () => {
      const manager = createSSEManager();
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const res3 = createMockResponse();

      manager.addClient('c1', 'store-1', 'customer', 'table-1', res1);
      manager.addClient('c2', 'store-1', 'admin', undefined, res2);
      manager.addClient('c3', 'store-2', 'customer', 'table-1', res3);

      const event: SSEEvent = {
        type: 'order:created',
        payload: { orderId: 'test' },
        timestamp: new Date().toISOString(),
      };

      manager.broadcastToStore('store-1', event);

      // store-1 클라이언트만 수신
      expect(res1.write).toHaveBeenCalled();
      expect(res2.write).toHaveBeenCalled();
      // store-2 클라이언트는 수신하지 않음
      expect(res3.write).not.toHaveBeenCalled();
    });
  });
});
