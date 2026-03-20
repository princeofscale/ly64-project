import { LifeBuoy, Send, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

import supportService, {
  type Ticket,
  type TicketWithMessages,
  type TicketStatus,
  type TicketPriority,
} from '../services/supportService';

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  RESOLVED: 'Решён',
  CLOSED: 'Закрыт',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Низкий',
  NORMAL: 'Обычный',
  HIGH: 'Высокий',
  URGENT: 'Срочный',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  NORMAL: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Все', value: undefined },
  { label: 'Открытые', value: 'OPEN' },
  { label: 'В работе', value: 'IN_PROGRESS' },
  { label: 'Решённые', value: 'RESOLVED' },
  { label: 'Закрытые', value: 'CLOSED' },
];

const POLL_INTERVAL = 3000;

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<TicketWithMessages | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCountRef = useRef(0);

  // Load ticket list
  const loadTickets = useCallback(async () => {
    try {
      const data = await supportService.getAllTickets(
        statusFilter ? { status: statusFilter } : undefined
      );
      setTickets(data);
    } catch {
      toast.error('Не удалось загрузить тикеты');
    } finally {
      setLoadingTickets(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoadingTickets(true);
    void loadTickets();
  }, [loadTickets]);

  // Load active ticket chat
  const loadActiveTicket = useCallback(async (silent = false) => {
    if (!activeId) return;
    if (!silent) setLoadingChat(true);
    try {
      const data = await supportService.adminGetTicket(activeId);
      setActiveTicket(data);
      if (!silent) msgCountRef.current = data.messages.length;
    } catch {
      if (!silent) toast.error('Не удалось загрузить тикет');
    } finally {
      if (!silent) setLoadingChat(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) void loadActiveTicket();
  }, [activeId, loadActiveTicket]);

  // Polling active ticket
  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(async () => {
      try {
        const data = await supportService.adminGetTicket(activeId);
        if (data.messages.length !== msgCountRef.current) {
          msgCountRef.current = data.messages.length;
          setActiveTicket(data);
        }
      } catch {
        // silent
      }
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [activeId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeId) return;

    setSending(true);
    try {
      await supportService.adminReply(activeId, reply.trim());
      setReply('');
      await loadActiveTicket(true);
      // Refresh list to show updated time
      void loadTickets();
    } catch {
      toast.error('Не удалось отправить ответ');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!activeId) return;
    try {
      await supportService.adminUpdateStatus(activeId, status);
      await loadActiveTicket(true);
      void loadTickets();
    } catch {
      toast.error('Не удалось обновить статус');
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!activeId) return;
    try {
      await supportService.adminUpdatePriority(activeId, priority);
      await loadActiveTicket(true);
      void loadTickets();
    } catch {
      toast.error('Не удалось обновить приоритет');
    }
  };

  const handleAssign = async () => {
    if (!activeId) return;
    try {
      await supportService.adminAssign(activeId);
      await loadActiveTicket(true);
      toast.success('Тикет взят в работу');
    } catch {
      toast.error('Не удалось назначить тикет');
    }
  };

  const isClosed =
    activeTicket?.status === 'CLOSED' || activeTicket?.status === 'RESOLVED';

  return (
    <div
      className="flex"
      style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--color-bg)' }}
    >
      {/* Left column — list */}
      <div
        className="w-72 shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <LifeBuoy className="w-5 h-5 text-blue-600" />
            <h1 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
              Тикеты поддержки
            </h1>
          </div>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1">
            {FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => setStatusFilter(f.value)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Тикетов нет
            </p>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setActiveId(ticket.id)}
                className={`w-full text-left px-4 py-3 border-b transition-colors ${
                  activeId === ticket.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[ticket.status]}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority]}`}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </span>
                </div>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {ticket.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <User className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {ticket.user.username}
                  </span>
                  <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(ticket.updatedAt).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right column — chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LifeBuoy className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Выберите тикет слева</p>
            </div>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTicket ? (
          <>
            {/* Chat header with controls */}
            <div
              className="px-5 py-3 border-b flex items-center gap-3 flex-wrap shrink-0"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {activeTicket.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  @{activeTicket.user.username}
                </p>
              </div>

              {/* Status select */}
              <select
                value={activeTicket.status}
                onChange={e => void handleStatusChange(e.target.value)}
                className="px-2 py-1 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {(Object.keys(STATUS_LABELS) as TicketStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              {/* Priority select */}
              <select
                value={activeTicket.priority}
                onChange={e => void handlePriorityChange(e.target.value)}
                className="px-2 py-1 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>

              <button
                onClick={() => void handleAssign()}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Взять в работу
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ minHeight: 0 }}>
              {activeTicket.messages.map(msg => {
                const isStaff = msg.isStaff;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                        isStaff ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    >
                      {isStaff ? 'П' : (msg.user.name?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className={`max-w-[70%] flex flex-col gap-1 ${isStaff ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {isStaff ? 'Поддержка' : msg.user.name}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                          isStaff ? 'bg-blue-600 text-white rounded-tr-sm' : 'rounded-tl-sm'
                        }`}
                        style={
                          !isStaff
                            ? {
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                              }
                            : undefined
                        }
                      >
                        {msg.body}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {isClosed ? (
              <div
                className="shrink-0 mx-5 mb-5 flex items-center justify-center py-3 rounded-xl border text-sm"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Тикет закрыт
              </div>
            ) : (
              <form
                onSubmit={e => void handleSend(e)}
                className="shrink-0 flex gap-2 p-4 border-t"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Ответ поддержки..."
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="px-4 rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center"
                  aria-label="Отправить"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
