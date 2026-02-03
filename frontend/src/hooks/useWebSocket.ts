import { useEffect, useRef, useState, useCallback } from 'react';

import { useAuthStore } from '../store/authStore';

// ==========================================
// Types
// ==========================================

type WSStatus = 'connecting' | 'connected' | 'authenticated' | 'disconnected' | 'error';

interface WSMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
  channel?: string;
  message?: string;
}

type MessageHandler = (data: unknown) => void;

interface UseWebSocketOptions {
  autoConnect?: boolean;
  autoAuth?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  status: WSStatus;
  isConnected: boolean;
  isAuthenticated: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  onMessage: (type: string, handler: MessageHandler) => () => void;
  send: (message: object) => void;
}

// ==========================================
// Hook
// ==========================================

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    autoAuth = true,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [status, setStatus] = useState<WSStatus>('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { token } = useAuthStore();

  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}`;
    return `${host}/ws`;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket(getWsUrl());

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setStatus('connected');
      reconnectAttemptsRef.current = 0;

      // Auto authenticate if token available
      if (autoAuth && token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = event => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        // Handle auth response
        if (message.type === 'auth_success') {
          setIsAuthenticated(true);
          setStatus('authenticated');
          console.log('[WebSocket] Authenticated');
        } else if (message.type === 'auth_error') {
          setIsAuthenticated(false);
          console.warn('[WebSocket] Auth failed:', message.message);
        }

        // Call registered handlers
        const handlers = handlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }

        // Also call handlers for the channel if it's a broadcast
        if (message.channel) {
          const channelHandlers = handlersRef.current.get(message.channel);
          if (channelHandlers) {
            channelHandlers.forEach(handler => handler(message.data));
          }
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onclose = event => {
      console.log('[WebSocket] Disconnected', event.code, event.reason);
      setStatus('disconnected');
      setIsAuthenticated(false);
      wsRef.current = null;

      // Attempt reconnect
      if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(
          `[WebSocket] Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current})`
        );
        reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
      }
    };

    ws.onerror = error => {
      console.error('[WebSocket] Error:', error);
      setStatus('error');
    };

    wsRef.current = ws;
  }, [getWsUrl, token, autoAuth, reconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnect
    wsRef.current?.close(1000, 'User disconnect');
  }, [maxReconnectAttempts]);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }, []);

  const onMessage = useCallback((type: string, handler: MessageHandler): (() => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);

    // Return cleanup function
    return () => {
      handlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send - not connected');
    }
  }, []);

  // Auto connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [autoConnect, connect]);

  // Re-authenticate when token changes
  useEffect(() => {
    if (token && wsRef.current?.readyState === WebSocket.OPEN && !isAuthenticated) {
      wsRef.current.send(JSON.stringify({ type: 'auth', token }));
    }
  }, [token, isAuthenticated]);

  return {
    status,
    isConnected: status === 'connected' || status === 'authenticated',
    isAuthenticated,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    send,
  };
}

// ==========================================
// Specialized Hooks
// ==========================================

/**
 * Hook for real-time leaderboard updates
 */
export function useLeaderboardUpdates(onUpdate: (data: unknown) => void): void {
  const { subscribe, unsubscribe, onMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    subscribe('leaderboard');
    const cleanup = onMessage('leaderboard', onUpdate);

    return () => {
      unsubscribe('leaderboard');
      cleanup();
    };
  }, [isConnected, subscribe, unsubscribe, onMessage, onUpdate]);
}

/**
 * Hook for real-time achievement notifications
 */
export function useAchievementNotifications(onAchievement: (data: unknown) => void): void {
  const { onMessage, isAuthenticated } = useWebSocket();

  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = onMessage('achievement_unlocked', onAchievement);
    return cleanup;
  }, [isAuthenticated, onMessage, onAchievement]);
}

export default useWebSocket;
