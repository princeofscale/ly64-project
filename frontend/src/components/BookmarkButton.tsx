import { Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';

import api from '../services/api';

interface BookmarkButtonProps {
  questionId: string;
  size?: number;
}

export function BookmarkButton({ questionId, size = 20 }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get(`/bookmarks/check/${questionId}`);
        if (res.data.success) {
          setBookmarked(res.data.data.bookmarked);
        }
      } catch {
        // Ignore
      }
    };
    void check();
  }, [questionId]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/bookmarks/${questionId}`);
      if (res.data.success) {
        setBookmarked(res.data.data.bookmarked);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => void handleToggle()}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors ${
        bookmarked
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'hover:text-yellow-500'
      }`}
      style={{ color: bookmarked ? undefined : 'var(--color-text-muted)' }}
      aria-label={bookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
      title={bookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
    >
      <Bookmark
        size={size}
        fill={bookmarked ? 'currentColor' : 'none'}
      />
    </button>
  );
}
