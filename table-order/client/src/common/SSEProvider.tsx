import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

type SSEListener = (data: unknown) => void;

interface SSEContextType {
  isConnected: boolean;
  addEventListener: (eventType: string, listener: SSEListener) => void;
  removeEventListener: (eventType: string, listener: SSEListener) => void;
}

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
  addEventListener: () => {},
  removeEventListener: () => {},
});

export function SSEProvider({
  children,
  endpoint,
}: {
  children: React.ReactNode;
  endpoint: string;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<SSEListener>>>(new Map());
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const url = `${endpoint}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);
    es.onerror = () => {
      setIsConnected(false);
      // Auto-reconnect is handled by EventSource
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.type;
        const listeners = listenersRef.current.get(eventType);
        if (listeners) {
          listeners.forEach((listener) => listener(data));
        }
      } catch {
        // Ignore parse errors
      }
    };

    // Listen for specific event types
    const knownEvents = [
      'order:created',
      'order:statusChanged',
      'order:deleted',
      'table:completed',
    ];
    for (const eventType of knownEvents) {
      es.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const listeners = listenersRef.current.get(eventType);
          if (listeners) {
            listeners.forEach((listener) => listener(data));
          }
        } catch {
          // Ignore
        }
      });
    }

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [token, endpoint]);

  const addEventListener = useCallback((eventType: string, listener: SSEListener) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(listener);
  }, []);

  const removeEventListener = useCallback((eventType: string, listener: SSEListener) => {
    listenersRef.current.get(eventType)?.delete(listener);
  }, []);

  return (
    <SSEContext.Provider value={{ isConnected, addEventListener, removeEventListener }}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE(eventType: string, listener: SSEListener) {
  const { addEventListener, removeEventListener } = useContext(SSEContext);

  useEffect(() => {
    addEventListener(eventType, listener);
    return () => removeEventListener(eventType, listener);
  }, [eventType, listener, addEventListener, removeEventListener]);
}

export { SSEContext };
