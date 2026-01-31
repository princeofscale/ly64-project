/**
 * WebSocket Service
 * Real-time updates for leaderboard, achievements, notifications
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// ==========================================
// Types
// ==========================================

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

// ==========================================
// WebSocket Service
// ==========================================

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

  /**
   * Initialize WebSocket server
   */
  public initialize(server: Server): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: (info, callback) => {
        // Allow connection, authentication happens after
        callback(true);
      },
    });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
      ws.isAlive = true;
      ws.subscriptions = new Set();

      logger.info('[WebSocket] New connection', { ip: req.socket.remoteAddress });

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        logger.error('[WebSocket] Error', { error: error.message });
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Lyceum64 WebSocket',
        timestamp: Date.now(),
      }));
    });

    // Ping/pong for connection health
    this.pingInterval = setInterval(() => {
      this.wss?.clients.forEach((ws) => {
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

  /**
   * Handle incoming messages
   */
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

  /**
   * Authenticate WebSocket connection
   */
  private handleAuth(ws: AuthenticatedWebSocket, token?: string): void {
    if (!token) {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Token required' }));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      ws.userId = decoded.id;

      // Add to clients map
      if (!this.clients.has(decoded.id)) {
        this.clients.set(decoded.id, new Set());
      }
      this.clients.get(decoded.id)!.add(ws);

      ws.send(JSON.stringify({
        type: 'auth_success',
        userId: decoded.id,
        timestamp: Date.now(),
      }));

      logger.info('[WebSocket] User authenticated', { userId: decoded.id });
    } catch (error) {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
    }
  }

  /**
   * Subscribe to a channel
   */
  private subscribe(ws: AuthenticatedWebSocket, channel: string): void {
    // Validate channel name
    const validChannels = ['leaderboard', 'achievements', 'notifications', 'tests'];
    if (!validChannels.includes(channel)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid channel' }));
      return;
    }

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(ws);
    ws.subscriptions.add(channel);

    ws.send(JSON.stringify({
      type: 'subscribed',
      channel,
      timestamp: Date.now(),
    }));

    logger.info('[WebSocket] Subscribed to channel', { channel, userId: ws.userId });
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(ws: AuthenticatedWebSocket, channel: string): void {
    this.channels.get(channel)?.delete(ws);
    ws.subscriptions.delete(channel);

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
      timestamp: Date.now(),
    }));
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(ws: AuthenticatedWebSocket): void {
    // Remove from user clients
    if (ws.userId) {
      this.clients.get(ws.userId)?.delete(ws);
      if (this.clients.get(ws.userId)?.size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    // Remove from channels
    ws.subscriptions.forEach((channel) => {
      this.channels.get(channel)?.delete(ws);
    });

    logger.info('[WebSocket] Disconnected', { userId: ws.userId });
  }

  // ==========================================
  // Public Broadcasting Methods
  // ==========================================

  /**
   * Broadcast to all clients in a channel
   */
  public broadcast(channel: string, data: unknown): void {
    const message: BroadcastMessage = {
      type: channel,
      data,
      timestamp: Date.now(),
    };

    const subscribers = this.channels.get(channel);
    if (!subscribers) return;

    const payload = JSON.stringify(message);
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    logger.info('[WebSocket] Broadcast', { channel, recipients: subscribers.size });
  }

  /**
   * Send to specific user
   */
  public sendToUser(userId: string, type: string, data: unknown): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
    });

    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Broadcast leaderboard update
   */
  public broadcastLeaderboardUpdate(leaderboard: unknown): void {
    this.broadcast('leaderboard', leaderboard);
  }

  /**
   * Broadcast new achievement
   */
  public broadcastAchievement(userId: string, achievement: unknown): void {
    // Send to specific user
    this.sendToUser(userId, 'achievement_unlocked', achievement);

    // Broadcast to achievements channel (for public feed)
    this.broadcast('achievements', {
      userId,
      achievement,
    });
  }

  /**
   * Broadcast test completion
   */
  public broadcastTestCompletion(userId: string, result: unknown): void {
    this.broadcast('tests', {
      type: 'test_completed',
      userId,
      result,
    });
  }

  /**
   * Get connection stats
   */
  public getStats(): { totalConnections: number; authenticatedUsers: number; channels: Record<string, number> } {
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

  /**
   * Shutdown WebSocket server
   */
  public shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.wss?.clients.forEach((client) => {
      client.close(1001, 'Server shutting down');
    });

    this.wss?.close();
    logger.info('[WebSocket] Server shutdown');
  }
}

export const wsService = WebSocketService.getInstance();
export default wsService;
