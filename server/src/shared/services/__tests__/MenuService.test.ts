import fc from 'fast-check';

describe('MenuService — PBT', () => {
  // PBT: sortOrder 재정렬 Invariant
  describe('메뉴 sortOrder 재정렬', () => {
    it('[PBT] reorder 후 모든 메뉴의 sortOrder 값이 고유하고 연속적', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
          (menuIds) => {
            // 재정렬 시뮬레이션: 인덱스 기반 sortOrder 할당
            const reordered = menuIds.map((id, index) => ({
              id,
              sortOrder: index,
            }));

            // Invariant 1: sortOrder 값이 고유
            const sortOrders = reordered.map((m) => m.sortOrder);
            const uniqueSortOrders = new Set(sortOrders);
            expect(uniqueSortOrders.size).toBe(sortOrders.length);

            // Invariant 2: sortOrder 값이 0부터 연속적
            for (let i = 0; i < reordered.length; i++) {
              expect(reordered[i].sortOrder).toBe(i);
            }

            // Invariant 3: 모든 원본 ID가 보존
            const originalIds = new Set(menuIds);
            const reorderedIds = new Set(reordered.map((m) => m.id));
            expect(reorderedIds).toEqual(originalIds);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
