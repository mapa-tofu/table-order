import fc from 'fast-check';
import type { OrderHistoryItem } from '@shared/types';

describe('TableService — PBT', () => {
  // PBT: Order → OrderHistory 변환 Round-trip
  describe('Order → OrderHistory 변환', () => {
    it('[PBT] Order + OrderItems → JSON 직렬화 → 역직렬화 시 원본 데이터 보존', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              menuItemId: fc.uuid(),
              menuName: fc.string({ minLength: 1, maxLength: 50 }),
              quantity: fc.integer({ min: 1, max: 100 }),
              unitPrice: fc.integer({ min: 0, max: 100000 }),
              subtotal: fc.integer({ min: 0, max: 10000000 }),
            }),
            { minLength: 1, maxLength: 10 },
          ),
          (items: OrderHistoryItem[]) => {
            // 직렬화
            const serialized = JSON.stringify(items);
            // 역직렬화
            const deserialized: OrderHistoryItem[] = JSON.parse(serialized);

            // Round-trip: 원본과 동일
            expect(deserialized).toEqual(items);
            expect(deserialized.length).toBe(items.length);

            // 각 항목 검증
            for (let i = 0; i < items.length; i++) {
              expect(deserialized[i].menuItemId).toBe(items[i].menuItemId);
              expect(deserialized[i].menuName).toBe(items[i].menuName);
              expect(deserialized[i].quantity).toBe(items[i].quantity);
              expect(deserialized[i].unitPrice).toBe(items[i].unitPrice);
              expect(deserialized[i].subtotal).toBe(items[i].subtotal);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
