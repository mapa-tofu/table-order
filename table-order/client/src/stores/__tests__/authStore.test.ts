import { useAuthStore } from '../authStore';

beforeEach(() => {
  useAuthStore.getState().logout();
  localStorage.clear();
});

describe('AuthStore', () => {
  describe('login', () => {
    it('should set token and decode payload', () => {
      // Create a mock JWT (header.payload.signature)
      const payload = { storeId: 's1', tableId: 't1', tableNumber: 1, type: 'table' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;

      useAuthStore.getState().login(mockToken);

      const state = useAuthStore.getState();
      expect(state.token).toBe(mockToken);
      expect(state.storeId).toBe('s1');
      expect(state.tableId).toBe('t1');
      expect(state.tableNumber).toBe(1);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      const payload = { storeId: 's1', tableId: 't1', tableNumber: 1, type: 'table' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;

      useAuthStore.getState().login(mockToken);
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.storeId).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      const payload = { storeId: 's1', type: 'table' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;

      useAuthStore.getState().login(mockToken);
      expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    });
  });
});
