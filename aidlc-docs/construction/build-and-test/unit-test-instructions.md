# 단위 테스트 실행 지침

## 테스트 실행

### 전체 테스트
```bash
cd table-order
npm test
# 또는: cd server && npx jest --forceExit --detectOpenHandles
```

### 커버리지 포함
```bash
cd table-order/server
npx jest --coverage --forceExit --detectOpenHandles
```

## 테스트 스위트 목록

| 스위트 | 파일 | 테스트 수 | PBT 포함 |
|---|---|---|---|
| AuthService | `shared/services/__tests__/AuthService.test.ts` | 7 | ✅ (bcrypt, JWT Round-trip) |
| OrderService | `shared/services/__tests__/OrderService.test.ts` | 4 | ✅ (totalAmount Invariant, 상태 전이 Idempotence) |
| TableService | `shared/services/__tests__/TableService.test.ts` | 1 | ✅ (OrderHistory Round-trip) |
| MenuService | `shared/services/__tests__/MenuService.test.ts` | 1 | ✅ (sortOrder Invariant) |
| SSEManager | `shared/services/__tests__/SSEManager.test.ts` | 3 | ✅ (Stateful add/remove) |

## 기대 결과
- **테스트 스위트**: 5개 전체 통과
- **테스트 케이스**: 16개 전체 통과
- **실행 시간**: ~4초
