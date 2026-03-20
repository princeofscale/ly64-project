import api from './api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'ACCOUNT' | 'CONTENT' | 'OTHER';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface TicketUser {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  user: { id: string; name: string; avatar: string | null };
  body: string;
  isStaff: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  user: TicketUser;
  _count: { messages: number };
}

export interface TicketWithMessages extends Ticket {
  messages: TicketMessage[];
}

export interface AdminStats {
  open: number;
  inProgress: number;
}

const supportService = {
  async getMyTickets(): Promise<Ticket[]> {
    const res = await api.get<{ success: boolean; data: Ticket[] }>('/support/tickets');
    return res.data.data;
  },

  async createTicket(title: string, category: string, message: string): Promise<Ticket> {
    const res = await api.post<{ success: boolean; data: Ticket }>('/support/tickets', {
      title,
      category,
      message,
    });
    return res.data.data;
  },

  async getTicket(id: string): Promise<TicketWithMessages> {
    const res = await api.get<{ success: boolean; data: TicketWithMessages }>(
      `/support/tickets/${id}`
    );
    return res.data.data;
  },

  async sendMessage(ticketId: string, body: string): Promise<TicketMessage> {
    const res = await api.post<{ success: boolean; data: TicketMessage }>(
      `/support/tickets/${ticketId}/messages`,
      { body }
    );
    return res.data.data;
  },

  async closeTicket(ticketId: string): Promise<void> {
    await api.patch(`/support/tickets/${ticketId}/close`);
  },

  // Admin
  async getAllTickets(filters?: {
    status?: string;
    category?: string;
    priority?: string;
  }): Promise<Ticket[]> {
    const res = await api.get<{ success: boolean; data: Ticket[] }>('/support/admin/tickets', {
      params: filters,
    });
    return res.data.data;
  },

  async adminGetTicket(id: string): Promise<TicketWithMessages> {
    const res = await api.get<{ success: boolean; data: TicketWithMessages }>(
      `/support/admin/tickets/${id}`
    );
    return res.data.data;
  },

  async adminReply(ticketId: string, body: string): Promise<TicketMessage> {
    const res = await api.post<{ success: boolean; data: TicketMessage }>(
      `/support/admin/tickets/${ticketId}/messages`,
      { body }
    );
    return res.data.data;
  },

  async adminUpdateStatus(ticketId: string, status: string): Promise<void> {
    await api.patch(`/support/admin/tickets/${ticketId}/status`, { status });
  },

  async adminUpdatePriority(ticketId: string, priority: string): Promise<void> {
    await api.patch(`/support/admin/tickets/${ticketId}/priority`, { priority });
  },

  async adminAssign(ticketId: string): Promise<void> {
    await api.patch(`/support/admin/tickets/${ticketId}/assign`);
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await api.get<{ success: boolean; data: AdminStats }>('/support/admin/stats');
    return res.data.data;
  },
};

export default supportService;
