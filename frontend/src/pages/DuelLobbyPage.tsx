import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

type LobbyView = 'main' | 'create' | 'join' | 'searching';

const SUBJECTS = Object.entries(SUBJECT_LABELS) as [string, string][];

export default function DuelLobbyPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<LobbyView>('main');
  const [selectedSubject, setSelectedSubject] = useState<string>('MATHEMATICS');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duelId, setDuelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/duels/create', {
        subject: selectedSubject,
        questionsCount,
      });
      const data = response.data.data;
      setRoomCode(data.code);
      setDuelId(data.duel.id);
      setView('create');
    } catch {
      toast.error('Ошибка создания комнаты');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, questionsCount]);

  const joinRoom = useCallback(async () => {
    if (!joinCode || joinCode.length < 6) {
      toast.error('Введите 6-значный код');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post(`/duels/join/${joinCode.toUpperCase()}`);
      const duel = response.data.data.duel;
      toast.success('Вы присоединились к дуэли!');
      void navigate(`/duel/${duel.id}`);
    } catch {
      toast.error('Дуэль не найдена или уже началась');
    } finally {
      setIsLoading(false);
    }
  }, [joinCode, navigate]);

  const findMatch = useCallback(async () => {
    setView('searching');
    setIsLoading(true);
    try {
      const response = await api.post('/duels/find-match', { subject: selectedSubject });
      const data = response.data.data;
      if (data.queued) {
        setDuelId(data.duel.id);
        setRoomCode(data.duel.code);
        toast('Ожидаем соперника...', { icon: '🔍' });
      } else {
        toast.success('Соперник найден!');
        void navigate(`/duel/${data.duel.id}`);
      }
    } catch {
      toast.error('Ошибка поиска');
      setView('main');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, navigate]);

  const startDuel = useCallback(async () => {
    if (!duelId) return;
    setIsLoading(true);
    try {
      await api.post(`/duels/${duelId}/start`);
      void navigate(`/duel/${duelId}`);
    } catch {
      toast.error('Ожидание оппонента');
    } finally {
      setIsLoading(false);
    }
  }, [duelId, navigate]);

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => view === 'main' ? void navigate('/dashboard') : setView('main')}
            className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Дуэли</h1>
          <div className="w-16" />
        </div>

        {/* Main View */}
        {view === 'main' && (
          <div className="space-y-4">
            <div className="border rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="text-6xl mb-4">⚔️</div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Дуэли 1 на 1</h2>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Соревнуйтесь с друзьями или случайными соперниками в решении задач на скорость!
              </p>

              {/* Subject Selection */}
              <div className="mb-6 text-left">
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Предмет</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedSubject(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSubject === key
                          ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'border hover:opacity-80'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions Count */}
              <div className="mb-8 text-left">
                <label className="text-sm font-medium text-slate-700 block mb-2">Количество вопросов</label>
                <div className="flex gap-3">
                  {[5, 10, 15].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionsCount(n)}
                      className={`flex-1 py-3 rounded-xl text-lg font-semibold transition-all ${
                        questionsCount === n
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => void createRoom()}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                >
                  Создать комнату
                </button>
                <button
                  onClick={() => setView('join')}
                  className="w-full py-4 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all"
                >
                  Ввести код
                </button>
                <button
                  onClick={() => void findMatch()}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
                >
                  Найти соперника
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Room - Show Code */}
        {view === 'create' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Комната создана!</h2>
            <p className="text-slate-600 mb-6">Отправьте этот код сопернику:</p>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-mono font-bold text-purple-700 tracking-widest">
                {roomCode}
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Когда соперник присоединится, нажмите «Начать дуэль»
            </p>

            <div className="space-y-3">
              <button
                onClick={() => void startDuel()}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-500/25"
              >
                {isLoading ? 'Проверка...' : 'Начать дуэль'}
              </button>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(roomCode);
                  toast.success('Код скопирован!');
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Скопировать код
              </button>
            </div>
          </div>
        )}

        {/* Join View */}
        {view === 'join' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Ввести код</h2>
            <p className="text-slate-600 mb-6">Введите 6-значный код комнаты:</p>

            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABCDEF"
              maxLength={6}
              className="w-full text-center text-3xl font-mono font-bold p-4 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none tracking-widest mb-6"
            />

            <button
              onClick={() => void joinRoom()}
              disabled={isLoading || joinCode.length < 6}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? 'Подключение...' : 'Присоединиться'}
            </button>
          </div>
        )}

        {/* Searching View */}
        {view === 'searching' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Поиск соперника...</h2>
            <p className="text-slate-600 mb-4">
              {SUBJECT_LABELS[selectedSubject as keyof typeof SUBJECT_LABELS]}
            </p>
            {roomCode && (
              <p className="text-sm text-slate-500 mb-4">
                Код комнаты: <span className="font-mono font-bold text-purple-700">{roomCode}</span>
              </p>
            )}
            <button
              onClick={() => {
                if (duelId) {
                  void navigate(`/duel/${duelId}`);
                }
              }}
              className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors mb-2"
            >
              Перейти к дуэли
            </button>
            <button
              onClick={() => setView('main')}
              className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Отменить поиск
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
