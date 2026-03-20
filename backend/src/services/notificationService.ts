import prisma from '../config/database';
import { wsService } from './websocketService';

interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata: string | null;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async create(
    userId: string,
    type: string,
    title: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<NotificationData> {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Push via WebSocket
    wsService.sendToUser(userId, 'notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  public async getAll(userId: string, limit = 20, offset = 0): Promise<NotificationData[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  public async markAsRead(userId: string, id: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  public async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export default NotificationService.getInstance();
