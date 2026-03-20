import { SUBJECT_LABELS } from '@lyceum64/shared';
import { Bookmark, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { BookmarkButton } from '../components/BookmarkButton';
import api from '../services/api';

interface BookmarkItem {
  id: string;
  questionId: string;
  note: string | null;
  createdAt: string;
  question: {
    id: string;
    question: string;
    subject: string;
    topic: string | null;
    difficulty: string;
    type: string;
  } | null;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = filter ? { subject: filter } : {};
        const res = await api.get('/bookmarks', { params });
        if (res.data.success) {
          setBookmarks(res.data.data);
        }
      } catch {
        toast.error('Ошибка загрузки закладок');
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, [filter]);

  const handleRemove = async (questionId: string) => {
    try {
      await api.delete(`/bookmarks/${questionId}`);
      setBookmarks(prev => prev.filter(b => b.questionId !== questionId));
      toast.success('Закладка удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  // Group by subject
  const grouped = bookmarks.reduce<Record<string, BookmarkItem[]>>((acc, b) => {
    const subj = b.question?.subject || 'OTHER';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(b);
    return acc;
  }, {});

  const subjects = Object.keys(grouped);

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Закладки</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {bookmarks.length} сохранённых вопросов
            </p>
          </div>
        </div>

        {/* Subject filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !filter ? 'bg-blue-600 text-white' : ''
            }`}
            style={!filter ? {} : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          >
            Все
          </button>
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setFilter(subj)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === subj ? 'bg-blue-600 text-white' : ''
              }`}
              style={filter === subj ? {} : { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
            >
              {SUBJECT_LABELS[subj as keyof typeof SUBJECT_LABELS] || subj}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Нет закладок
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Добавляйте вопросы в закладки во время прохождения тестов
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([subj, items]) => (
              <div key={subj}>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  {SUBJECT_LABELS[subj as keyof typeof SUBJECT_LABELS] || subj}
                </h2>
                <div className="space-y-2">
                  {items.map(b => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {b.question?.question
                              ? b.question.question.replace(/<[^>]*>/g, '').slice(0, 200)
                              : 'Вопрос не найден'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {b.question?.topic && (
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                                {b.question.topic}
                              </span>
                            )}
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(b.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <BookmarkButton questionId={b.questionId} size={16} />
                          <button
                            onClick={() => void handleRemove(b.questionId)}
                            className="p-1.5 rounded-lg transition-colors text-red-400 hover:text-red-500 hover:bg-red-50"
                            aria-label="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
