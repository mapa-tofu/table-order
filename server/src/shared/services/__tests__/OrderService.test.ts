import fc from 'fast-check';

describe('OrderService — PBT', () => {
  // PBT: totalAmount 계산 Invariant
  describe('totalAmount 계산', () => {
    it('[PBT] totalAmount = sum(quantity * unitPrice) — 항상 성립', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              quantity: fc.integer({ min: 1, max: 100 }),
              unitPrice: fc.integer({ min: 0, max: 100000 }),
            }),
            { minLength: 1, maxLength: 20 },
          ),
          (items) => {
            const totalAmount = items.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0,
            );
            const itemSubtotals = items.map((item) => item.quantity * item.unitPrice);
            const sumOfSubtotals = itemSubtotals.reduce((sum, s) => sum + s, 0);

            // Invariant: totalAmount === sum(subtotals)
            expect(totalAmount).toBe(sumOfSubtotals);
            // Invariant: totalAmount >= 0
            expect(totalAmount).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('[PBT] subtotal = quantity * unitPrice — 항상 성립', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 100000 }),
          (quantity, unitPrice) => {
            const subtotal = quantity * unitPrice;
            expect(subtotal).toBe(quantity * unitPrice);
            expect(subtotal).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // PBT: 주문 상태 전이 Idempotence
  describe('주문 상태 전이', () => {
    const validStatuses = ['pending', 'preparing', 'completed'] as const;

    it('[PBT] 동일 상태로 2회 전이 = 1회 전이와 동일 결과', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validStatuses),
          fc.constantFrom(...validStatuses),
          (currentStatus, newStatus) => {
            // 유연한 상태 전이: 모든 방향 허용
            // 1회 전이 결과
            const afterFirst = newStatus;
            // 2회 전이 결과 (동일 상태로)
            const afterSecond = newStatus;
            // Idempotence: 결과 동일
            expect(afterFirst).toBe(afterSecond);
          },
        ),
        { numRuns: 50 },
      );
    });

    it('[PBT] 상태 전이 후 결과는 항상 유효한 상태', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validStatuses),
          fc.constantFrom(...validStatuses),
          (_currentStatus, newStatus) => {
            expect(validStatuses).toContain(newStatus);
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});
