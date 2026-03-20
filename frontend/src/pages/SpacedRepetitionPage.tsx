import { SUBJECT_LABELS } from '@lyceum64/shared';
import { Brain, RotateCcw, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../components/Button';
import api from '../services/api';

interface SRSCard {
  id: string;
  front: string;
  back: string;
  subject: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

interface SRSStats {
  dueToday: number;
  totalCards: number;
  bySubject: Array<{ subject: string; total: number; due: number }>;
}

type Tab = 'dashboard' | 'review';

export default function SpacedRepetitionPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<SRSStats | null>(null);
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [reviewing, setReviewing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/srs/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch {
      // Ignore
    }
  }, []);

  const fetchDueCards = useCallback(async (subject?: string) => {
    try {
      const params: Record<string, string> = { limit: '50' };
      if (subject) params.subject = subject;
      const res = await api.get('/srs/due', { params });
      if (res.data.success) {
        setCards(res.data.data);
        setCurrentIndex(0);
        setFlipped(false);
      }
    } catch {
      toast.error('Ошибка загрузки карточек');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchDueCards()]);
      setLoading(false);
    };
    void init();
  }, [fetchStats, fetchDueCards]);

  const startReview = async (subject?: string) => {
    setSubjectFilter(subject || '');
    await fetchDueCards(subject);
    setTab('review');
    setFlipped(false);
  };

  const handleRate = async (quality: number) => {
    const card = cards[currentIndex];
    if (!card || reviewing) return;

    setReviewing(true);
    try {
      await api.post(`/srs/review/${card.id}`, { quality });

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
      } else {
        toast.success('Все карточки на сегодня пройдены!');
        setTab('dashboard');
        void fetchStats();
      }
    } catch {
      toast.error('Ошибка');
    } finally {
      setReviewing(false);
    }
  };

  const currentCard = cards[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Интервальное повторение</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Алгоритм SM-2 для эффективного запоминания
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab('dashboard'); void fetchStats(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'dashboard' ? 'bg-blue-600 text-white' : ''
            }`}
            style={tab !== 'dashboard' ? { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' } : {}}
          >
            Обзор
          </button>
          <button
            onClick={() => void startReview()}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'review' ? 'bg-blue-600 text-white' : ''
            }`}
            style={tab !== 'review' ? { backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' } : {}}
          >
            Повторение
          </button>
        </div>

        {tab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="text-3xl font-bold text-blue-600">{stats.dueToday}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>На сегодня</div>
              </div>
              <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="text-3xl font-bold text-purple-600">{stats.totalCards}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Всего карточек</div>
              </div>
            </div>

            {/* Start review button */}
            {stats.dueToday > 0 && (
              <Button onClick={() => void startReview()} className="w-full">
                <RotateCcw className="w-4 h-4" />
                Начать повторение ({stats.dueToday} карточек)
              </Button>
            )}

            {/* By subject */}
            {stats.bySubject.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>По предметам</h2>
                <div className="space-y-2">
                  {stats.bySubject.map(s => (
                    <button
                      key={s.subject}
                      onClick={() => void startReview(s.subject)}
                      className="w-full p-4 rounded-xl border flex items-center justify-between transition-colors hover:opacity-80"
                      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {SUBJECT_LABELS[s.subject as keyof typeof SUBJECT_LABELS] || s.subject}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          {s.total} карточек, {s.due} к повторению
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.due > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">
                            {s.due}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Нет карточек
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Добавьте ошибки из тестов для интервального повторения
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'review' && (
          <div>
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Нет карточек для повторения
                  {subjectFilter && (
                    <span> по этому предмету</span>
                  )}
                </p>
                <Button onClick={() => setTab('dashboard')} className="mt-4" variant="outline">
                  Назад к обзору
                </Button>
              </div>
            ) : currentCard ? (
              <div className="space-y-4">
                {/* Progress */}
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{currentIndex + 1} / {cards.length}</span>
                  <span>{SUBJECT_LABELS[currentCard.subject as keyof typeof SUBJECT_LABELS] || currentCard.subject}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  />
                </div>

                {/* Card */}
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="p-8 rounded-2xl border cursor-pointer min-h-[250px] flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="text-center max-w-lg">
                    {!flipped ? (
                      <>
                        <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                          Вопрос
                        </p>
                        <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                          {currentCard.front.replace(/<[^>]*>/g, '')}
                        </p>
                        <p className="text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
                          Нажмите, чтобы увидеть ответ
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs uppercase tracking-wider mb-4 text-green-600">
                          Ответ
                        </p>
                        <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                          {currentCard.back}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating buttons (only when flipped) */}
                {flipped && (
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => void handleRate(0)}
                      disabled={reviewing}
                      className="px-3 py-3 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Забыл
                    </button>
                    <button
                      onClick={() => void handleRate(2)}
                      disabled={reviewing}
                      className="px-3 py-3 rounded-xl text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      Трудно
                    </button>
                    <button
                      onClick={() => void handleRate(4)}
                      disabled={reviewing}
                      className="px-3 py-3 rounded-xl text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      Хорошо
                    </button>
                    <button
                      onClick={() => void handleRate(5)}
                      disabled={reviewing}
                      className="px-3 py-3 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      Легко
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
