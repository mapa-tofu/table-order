import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@shared/types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalAmount: 0,

      addItem: (item: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          let newItems: CartItem[];

          if (existing) {
            newItems = state.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            );
          } else {
            newItems = [...state.items, { ...item }];
          }

          return { items: newItems, totalAmount: calculateTotal(newItems) };
        });
      },

      removeItem: (menuItemId: string) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
          return { items: newItems, totalAmount: calculateTotal(newItems) };
        });
      },

      updateQuantity: (menuItemId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
            return { items: newItems, totalAmount: calculateTotal(newItems) };
          }

          const newItems = state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          );
          return { items: newItems, totalAmount: calculateTotal(newItems) };
        });
      },

      clearCart: () => {
        set({ items: [], totalAmount: 0 });
      },
    }),
    {
      name: 'cart-storage',
    },
  ),
);
