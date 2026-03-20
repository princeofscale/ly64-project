import { Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import api from '../services/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        if (res.data.success) {
          setUnreadCount(res.data.data.count);
        }
      } catch {
        // Ignore
      }
    };

    void fetchCount();
    const interval = setInterval(() => void fetchCount(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { limit: 15 } });
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!isOpen) {
      void fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl transition-colors"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        aria-label="Уведомления"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl z-50 animate-scale-in flex flex-col max-h-96 border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Уведомления</span>
            {unreadCount > 0 && (
              <button
                onClick={() => void handleMarkAllRead()}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Загрузка...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Нет уведомлений
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) void handleMarkRead(n.id);
                  }}
                  className="w-full text-left px-4 py-3 border-b transition-colors hover:opacity-80"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {n.body}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
