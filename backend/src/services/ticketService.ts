import prisma from '../config/database';
import notificationService from './notificationService';
import { logger } from '../utils/logger';

import type { Prisma } from '@prisma/client';

type TicketWithMessages = Prisma.SupportTicketGetPayload<{
  include: {
    user: { select: { id: true; name: true; username: true; avatar: true } };
    messages: {
      include: {
        user: { select: { id: true; name: true; avatar: true } };
      };
    };
  };
}>;

type TicketSummary = Prisma.SupportTicketGetPayload<{
  include: {
    user: { select: { id: true; name: true; username: true; avatar: true } };
    _count: { select: { messages: true } };
  };
}>;

class TicketService {
  private static instance: TicketService;

  private constructor() {}

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  public async createTicket(
    userId: string,
    title: string,
    category: string,
    firstMessage: string
  ): Promise<TicketSummary> {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        title,
        category,
        messages: {
          create: {
            userId,
            body: firstMessage,
            isStaff: false,
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { messages: true } },
      },
    });

    // Notify all admins about new ticket
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      await Promise.all(
        admins.map(admin =>
          notificationService.create(
            admin.id,
            'system',
            'Новый тикет',
            `Пользователь ${ticket.user.username} создал тикет «${title}»`
          )
        )
      );
    } catch (err) {
      logger.error('Failed to notify admins about new ticket:', err);
    }

    return ticket;
  }

  public async getUserTickets(userId: string): Promise<TicketSummary[]> {
    return prisma.supportTicket.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async getTicketById(id: string, requestingUserId?: string): Promise<TicketWithMessages> {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        messages: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new Error('Тикет не найден');
    }

    // If requestingUserId is provided, check access (owner or admin)
    if (requestingUserId) {
      const requester = await prisma.user.findUnique({
        where: { id: requestingUserId },
        select: { role: true },
      });
      const isAdmin = requester?.role === 'ADMIN';
      if (!isAdmin && ticket.userId !== requestingUserId) {
        throw new Error('Нет доступа');
      }
    }

    return ticket;
  }

  public async addMessage(
    ticketId: string,
    userId: string,
    body: string,
    isStaff: boolean
  ): Promise<Prisma.TicketMessageGetPayload<{
    include: { user: { select: { id: true; name: true; avatar: true } } };
  }>> {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: { select: { id: true, username: true } } },
    });

    if (!ticket) throw new Error('Тикет не найден');

    // Auto-progress status when staff replies
    const newStatus =
      isStaff && ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status;

    const message = await prisma.ticketMessage.create({
      data: { ticketId, userId, body, isStaff },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date(), status: newStatus },
    });

    // Send notifications
    try {
      if (isStaff) {
        // Notify ticket owner
        await notificationService.create(
          ticket.userId,
          'system',
          'Ответ поддержки',
          `Поддержка ответила на ваш тикет «${ticket.title}»`
        );
      } else {
        // Notify all admins about user reply
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        await Promise.all(
          admins.map(admin =>
            notificationService.create(
              admin.id,
              'system',
              'Новое сообщение',
              `Пользователь ${sender?.username ?? userId} написал в тикете «${ticket.title}»`
            )
          )
        );
      }
    } catch (err) {
      logger.error('Failed to send ticket message notification:', err);
    }

    return message;
  }

  public async getAllTickets(filters: {
    status?: string;
    category?: string;
    priority?: string;
  }): Promise<TicketSummary[]> {
    const where: Prisma.SupportTicketWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;

    return prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async updateStatus(ticketId: string, status: string) {
    const data: Prisma.SupportTicketUpdateInput = { status };
    if (status === 'CLOSED' || status === 'RESOLVED') {
      data.closedAt = new Date();
    }
    return prisma.supportTicket.update({ where: { id: ticketId }, data });
  }

  public async updatePriority(ticketId: string, priority: string) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    });
  }

  public async assign(ticketId: string, adminId: string) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo: adminId },
    });
  }

  public async getAdminStats(): Promise<{ open: number; inProgress: number }> {
    const [open, inProgress] = await Promise.all([
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    ]);
    return { open, inProgress };
  }
}

export default TicketService.getInstance();
