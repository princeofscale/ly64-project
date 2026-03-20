import { LifeBuoy, Plus, X, MessageSquare, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import supportService, { type Ticket, type TicketStatus, type TicketCategory } from '../services/supportService';

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

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  TECHNICAL: 'Техническая',
  ACCOUNT: 'Аккаунт',
  CONTENT: 'Контент',
  OTHER: 'Другое',
};

export default function SupportPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('TECHNICAL');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch {
      toast.error('Не удалось загрузить тикеты');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const ticket = await supportService.createTicket(title.trim(), category, message.trim());
      setTickets(prev => [ticket, ...prev]);
      setShowForm(false);
      setTitle('');
      setCategory('TECHNICAL');
      setMessage('');
      toast.success('Тикет создан');
    } catch {
      toast.error('Не удалось создать тикет');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-wide py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Поддержка</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ваши обращения в службу поддержки
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Отмена' : 'Создать тикет'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={e => void handleSubmit(e)}
          className="mb-6 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Новый тикет
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Тема
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Кратко опишите проблему"
                required
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Категория
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map(key => (
                  <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Сообщение
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Подробно опишите проблему..."
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <LifeBuoy className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            Обращений пока нет
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Создайте тикет, если у вас есть вопросы или проблемы
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Создать тикет
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => navigate(`/support/${ticket.id}`)}
              className="w-full text-left p-4 rounded-xl border transition-colors hover:border-blue-400"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[ticket.status]}`}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {CATEGORY_LABELS[ticket.category]}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <MessageSquare className="w-3 h-3" />
                      {ticket._count.messages}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(ticket.updatedAt).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
