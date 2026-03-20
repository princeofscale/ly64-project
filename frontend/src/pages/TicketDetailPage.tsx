import { ArrowLeft, Send, Lock } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';
import supportService, {
  type TicketWithMessages,
  type TicketStatus,
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

const POLL_INTERVAL = 3000;

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<TicketWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCountRef = useRef(0);

  const loadTicket = useCallback(async (silent = false) => {
    if (!id) return;
    try {
      const data = await supportService.getTicket(id);
      setTicket(data);
      if (!silent) msgCountRef.current = data.messages.length;
    } catch {
      if (!silent) toast.error('Не удалось загрузить тикет');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  // Polling
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!id) return;
      try {
        const data = await supportService.getTicket(id);
        if (data.messages.length !== msgCountRef.current) {
          msgCountRef.current = data.messages.length;
          setTicket(data);
        }
      } catch {
        // silent
      }
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !id) return;

    setSending(true);
    try {
      await supportService.sendMessage(id, body.trim());
      setBody('');
      await loadTicket(true);
    } catch {
      toast.error('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!id) return;
    setClosing(true);
    try {
      await supportService.closeTicket(id);
      await loadTicket(true);
      toast.success('Тикет закрыт');
    } catch {
      toast.error('Не удалось закрыть тикет');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container-wide py-8 text-center">
        <p style={{ color: 'var(--color-text-muted)' }}>Тикет не найден</p>
      </div>
    );
  }

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div className="container-wide py-6 max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={() => navigate('/support')}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Все тикеты
        </button>

        <div className="flex-1" />

        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[ticket.status]}`}
        >
          {STATUS_LABELS[ticket.status]}
        </span>

        {!isClosed && (
          <button
            onClick={() => void handleClose()}
            disabled={closing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Lock className="w-4 h-4" />
            Закрыть тикет
          </button>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          {ticket.title}
        </h1>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1"
        style={{ minHeight: 0 }}
      >
        {ticket.messages.map(msg => {
          const isOwn = msg.userId === user?.id && !msg.isStaff;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                  msg.isStaff ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                {msg.isStaff
                  ? 'П'
                  : (msg.user.name?.[0] ?? '?').toUpperCase()}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {msg.isStaff ? 'Поддержка' : msg.user.name}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.isStaff
                      ? 'rounded-tl-sm bg-blue-50 text-blue-900'
                      : isOwn
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                  style={
                    !msg.isStaff
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

      {/* Input */}
      {isClosed ? (
        <div
          className="flex items-center justify-center gap-2 py-3 rounded-xl border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          <Lock className="w-4 h-4" />
          Тикет закрыт
        </div>
      ) : (
        <form onSubmit={e => void handleSend(e)} className="flex gap-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Ваше сообщение..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-xl border text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-surface)',
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
            disabled={sending || !body.trim()}
            className="px-4 rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center"
            aria-label="Отправить"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
