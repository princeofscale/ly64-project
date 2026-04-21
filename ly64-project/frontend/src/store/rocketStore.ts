import { create } from 'zustand';

import { useAuthStore } from './authStore';

import type { RocketRoundState } from '@lyceum64/shared';

interface RocketState {
  state: RocketRoundState | null;
  multiplier: number;
  connected: boolean;
  setState: (state: RocketRoundState) => void;
  setMultiplier: (m: number) => void;
  setConnected: (c: boolean) => void;
}

export const useRocketStore = create<RocketState>(set => ({
  state: null,
  multiplier: 1.0,
  connected: false,
  setState: state => set({ state }),
  setMultiplier: multiplier => set({ multiplier }),
  setConnected: connected => set({ connected }),
}));

type WSMessage = {
  type: string;
  data?: unknown;
  timestamp?: number;
};

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;

const getWsUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.startsWith('http')) {
    return apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + '/ws';
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host =
    import.meta.env.VITE_WS_HOST ||
    (window.location.hostname === 'localhost'
      ? 'localhost:3001'
      : window.location.host);
  return `${protocol}//${host}/ws`;
};

export function connectRocketSocket(): void {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const url = getWsUrl();
  ws = new WebSocket(url);

  ws.onopen = () => {
    useRocketStore.getState().setConnected(true);
    const token = useAuthStore.getState().token;
    if (token) {
      ws?.send(JSON.stringify({ type: 'auth', token }));
    }
    ws?.send(JSON.stringify({ type: 'subscribe', channel: 'rocket' }));

    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
  };

  ws.onmessage = event => {
    try {
      const msg = JSON.parse(event.data) as WSMessage;
      const store = useRocketStore.getState();

      if (msg.type === 'rocket' && msg.data) {
        const payload = msg.data as {
          type: 'state' | 'tick';
          state?: RocketRoundState;
          multiplier?: number;
        };
        if (payload.type === 'state' && payload.state) {
          store.setState(payload.state);
          if (payload.state.status === 'RUNNING' && typeof payload.state.multiplier === 'number') {
            store.setMultiplier(payload.state.multiplier);
          } else {
            store.setMultiplier(1.0);
          }
        } else if (payload.type === 'tick' && typeof payload.multiplier === 'number') {
          store.setMultiplier(payload.multiplier);
        }
      } else if (msg.type === 'rocket_balance' && msg.data) {
        const d = msg.data as { balance?: number };
        if (typeof d.balance === 'number') {
          useAuthStore.getState().setRutheniumBalance(d.balance);
        }
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    useRocketStore.getState().setConnected(false);
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connectRocketSocket(), 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function disconnectRocketSocket(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  useRocketStore.getState().setConnected(false);
}
