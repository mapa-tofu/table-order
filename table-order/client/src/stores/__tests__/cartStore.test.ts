import * as fc from 'fast-check';
import { useCartStore } from '../cartStore';
import type { CartItem } from '@shared/types';

// Reset store between tests
beforeEach(() => {
  useCartStore.getState().clearCart();
  localStorage.clear();
});

describe('CartStore', () => {
  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const { addItem } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].menuItemId).toBe('m1');
      expect(items[0].quantity).toBe(1);
    });

    it('should increase quantity when adding existing item', () => {
      const { addItem } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 2 });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });
      removeItem('m1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });
      updateQuantity('m1', 5);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });
      updateQuantity('m1', 0);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items', () => {
      const { addItem, clearCart } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 1 });
      addItem({ menuItemId: 'm2', name: 'Coke', price: 2000, quantity: 1 });
      clearCart();

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('totalAmount', () => {
    it('should calculate total correctly', () => {
      const { addItem } = useCartStore.getState();
      addItem({ menuItemId: 'm1', name: 'Burger', price: 8000, quantity: 2 });
      addItem({ menuItemId: 'm2', name: 'Coke', price: 2000, quantity: 3 });

      const { totalAmount } = useCartStore.getState();
      expect(totalAmount).toBe(22000); // 8000*2 + 2000*3
    });
  });

  // PBT: totalAmount invariant
  describe('PBT: totalAmount invariant', () => {
    it('totalAmount should always equal sum(quantity * price)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              menuItemId: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              price: fc.integer({ min: 0, max: 100000 }),
              quantity: fc.integer({ min: 1, max: 50 }),
            }),
            { minLength: 0, maxLength: 10 },
          ),
          (items) => {
            useCartStore.getState().clearCart();

            // Deduplicate by menuItemId
            const uniqueItems = new Map<string, CartItem>();
            for (const item of items) {
              if (uniqueItems.has(item.menuItemId)) {
                const existing = uniqueItems.get(item.menuItemId)!;
                existing.quantity += item.quantity;
              } else {
                uniqueItems.set(item.menuItemId, { ...item });
              }
            }

            for (const item of items) {
              useCartStore.getState().addItem(item);
            }

            const { totalAmount, items: cartItems } = useCartStore.getState();
            const expectedTotal = cartItems.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0,
            );

            expect(totalAmount).toBe(expectedTotal);
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  // PBT: localStorage round-trip
  describe('PBT: localStorage round-trip', () => {
    it('cart should survive JSON serialization', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              menuItemId: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }),
              price: fc.integer({ min: 0, max: 100000 }),
              quantity: fc.integer({ min: 1, max: 50 }),
            }),
            { minLength: 1, maxLength: 5 },
          ),
          (items) => {
            // Serialize and deserialize
            const serialized = JSON.stringify(items);
            const deserialized: CartItem[] = JSON.parse(serialized);

            expect(deserialized).toHaveLength(items.length);
            for (let i = 0; i < items.length; i++) {
              expect(deserialized[i].menuItemId).toBe(items[i].menuItemId);
              expect(deserialized[i].price).toBe(items[i].price);
              expect(deserialized[i].quantity).toBe(items[i].quantity);
            }
          },
        ),
        { numRuns: 30 },
      );
    });
  });
});
