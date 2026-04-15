import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  storeId: string | null;
  tableId: string | null;
  tableNumber: number | null;
  sessionId: string | null;
  adminId: string | null;
  username: string | null;
  role: string | null;
  type: 'table' | 'admin' | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

function decodeJWTPayload(token: string): Record<string, unknown> {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      storeId: null,
      tableId: null,
      tableNumber: null,
      sessionId: null,
      adminId: null,
      username: null,
      role: null,
      type: null,

      login: (token: string) => {
        const payload = decodeJWTPayload(token);
        set({
          token,
          storeId: (payload.storeId as string) || null,
          tableId: (payload.tableId as string) || null,
          tableNumber: (payload.tableNumber as number) || null,
          sessionId: (payload.sessionId as string) || null,
          adminId: (payload.adminId as string) || null,
          username: (payload.username as string) || null,
          role: (payload.role as string) || null,
          type: (payload.type as 'table' | 'admin') || null,
        });
      },

      logout: () => {
        set({
          token: null,
          storeId: null,
          tableId: null,
          tableNumber: null,
          sessionId: null,
          adminId: null,
          username: null,
          role: null,
          type: null,
        });
      },

      isAuthenticated: () => {
        return get().token !== null;
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
