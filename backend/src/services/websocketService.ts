import { WebSocketServer, WebSocket } from 'ws';

import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
  subscriptions: Set<string>;
}

interface WSMessage {
  type: string;
  channel?: string;
  data?: unknown;
  token?: string;
}

interface BroadcastMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private channels: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public initialize(server: Server): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        const ip = info.req.socket.remoteAddress || '';
        const connectionsFromIp = Array.from(this.wss?.clients ?? []).filter(
          c => (c as AuthenticatedWebSocket & { _ip?: string })._ip === ip
        ).length;
        if (connectionsFromIp >= 10) {
          callback(false, 429, 'Too many connections');
          return;
        }
        callback(true);
      },
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket & { _ip?: string }, req) => {
      ws.isAlive = true;
      ws.subscriptions = new Set();
      ws._ip = req.socket.remoteAddress || '';

      logger.info('[WebSocket] New connection', { ip: req.socket.remoteAddress });

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', data => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', error => {
        logger.error('[WebSocket] Error', { error: error.message });
      });

      ws.send(
        JSON.stringify({
          type: 'connected',
          message: 'Connected to Lyceum64 WebSocket',
          timestamp: Date.now(),
        })
      );
    });

    this.pingInterval = setInterval(() => {
      this.wss?.clients.forEach(ws => {
        const client = ws as AuthenticatedWebSocket;
        if (!client.isAlive) {
          logger.info('[WebSocket] Terminating inactive connection');
          return client.terminate();
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);

    logger.info('[WebSocket] Server initialized on /ws');
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WSMessage): void {
    switch (message.type) {
      case 'auth':
        this.handleAuth(ws, message.token);
        break;

      case 'subscribe':
        if (message.channel) {
          this.subscribe(ws, message.channel);
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          this.unsubscribe(ws, message.channel);
        }
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  private handleAuth(ws: AuthenticatedWebSocket, token?: string): void {
    if (!token) {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Token required' }));
      return;
    }

    try {
      const decoded = verifyToken(token);
      ws.userId = decoded.userId;

      if (!this.clients.has(decoded.userId)) {
        this.clients.set(decoded.userId, new Set());
      }
      this.clients.get(decoded.userId)!.add(ws);

      ws.send(
        JSON.stringify({
          type: 'auth_success',
          userId: decoded.userId,
          timestamp: Date.now(),
        })
      );

      logger.info('[WebSocket] User authenticated', { userId: decoded.userId });
    } catch {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
    }
  }

  private subscribe(ws: AuthenticatedWebSocket, channel: string): void {
    if (!ws.userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
      return;
    }

    const validChannels = ['leaderboard', 'achievements', 'notifications', 'tests', 'duels'];
    if (!validChannels.includes(channel)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid channel' }));
      return;
    }

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(ws);
    ws.subscriptions.add(channel);

    ws.send(
      JSON.stringify({
        type: 'subscribed',
        channel,
        timestamp: Date.now(),
      })
    );

    logger.info('[WebSocket] Subscribed to channel', { channel, userId: ws.userId });
  }

  private unsubscribe(ws: AuthenticatedWebSocket, channel: string): void {
    this.channels.get(channel)?.delete(ws);
    ws.subscriptions.delete(channel);

    ws.send(
      JSON.stringify({
        type: 'unsubscribed',
        channel,
        timestamp: Date.now(),
      })
    );
  }

  private handleDisconnect(ws: AuthenticatedWebSocket): void {
    if (ws.userId) {
      this.clients.get(ws.userId)?.delete(ws);
      if (this.clients.get(ws.userId)?.size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    ws.subscriptions.forEach(channel => {
      this.channels.get(channel)?.delete(ws);
    });

    logger.info('[WebSocket] Disconnected', { userId: ws.userId });
  }

  public broadcast(channel: string, data: unknown): void {
    const message: BroadcastMessage = {
      type: channel,
      data,
      timestamp: Date.now(),
    };

    const subscribers = this.channels.get(channel);
    if (!subscribers) return;

    const payload = JSON.stringify(message);
    subscribers.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    logger.info('[WebSocket] Broadcast', { channel, recipients: subscribers.size });
  }

  public sendToUser(userId: string, type: string, data: unknown): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
    });

    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastLeaderboardUpdate(leaderboard: unknown): void {
    this.broadcast('leaderboard', leaderboard);
  }

  public broadcastAchievement(userId: string, achievement: unknown): void {
    this.sendToUser(userId, 'achievement_unlocked', achievement);

    this.broadcast('achievements', {
      userId,
      achievement,
    });
  }

  public broadcastTestCompletion(userId: string, result: unknown): void {
    this.broadcast('tests', {
      type: 'test_completed',
      userId,
      result,
    });
  }

  public getStats(): {
    totalConnections: number;
    authenticatedUsers: number;
    channels: Record<string, number>;
  } {
    const channelStats: Record<string, number> = {};
    this.channels.forEach((clients, channel) => {
      channelStats[channel] = clients.size;
    });

    return {
      totalConnections: this.wss?.clients.size || 0,
      authenticatedUsers: this.clients.size,
      channels: channelStats,
    };
  }

  public shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.wss?.clients.forEach(client => {
      client.close(1001, 'Server shutting down');
    });

    this.wss?.close();
    logger.info('[WebSocket] Server shutdown');
  }
}

export const wsService = WebSocketService.getInstance();
export default wsService;
