import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedTestSession, TestSessionStorage } from '../../core/services';

interface SessionRecoveryModalProps {
  session: SavedTestSession;
  onRestore: () => void;
  onDiscard: () => void;
}

/**
 * Модальное окно для восстановления сессии теста
 * Показывается когда найдена незавершённая сессия
 */
export const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  session,
  onRestore,
  onDiscard,
}) => {
  const savedAt = new Date(session.savedAt);
  const timeSince = getTimeSince(savedAt);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700"
        >
          {/* Иконка */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Заголовок */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Найден незавершённый тест
          </h2>

          {/* Описание */}
          <p className="text-slate-400 text-center mb-4">
            У вас есть сохранённая сессия теста. Хотите продолжить с того места, где остановились?
          </p>

          {/* Информация о сессии */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Предмет:</span>
              <span className="text-white font-medium">
                {getSubjectName(session.subject)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Тип:</span>
              <span className="text-white font-medium">
                {getExamTypeName(session.examType)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Сохранено:</span>
              <span className="text-white font-medium">{timeSince}</span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Начать заново
            </button>
            <button
              onClick={onRestore}
              className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors"
            >
              Продолжить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Хук для проверки наличия сохранённой сессии
 */
export function useSessionRecovery() {
  const [savedSession, setSavedSession] = React.useState<SavedTestSession | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const storage = React.useMemo(() => new TestSessionStorage(), []);

  React.useEffect(() => {
    const session = storage.loadSession();
    if (session) {
      setSavedSession(session);
      setShowModal(true);
    }
  }, [storage]);

  const handleRestore = React.useCallback(() => {
    setShowModal(false);
    // Сессия будет восстановлена автоматически в useTestSession
  }, []);

  const handleDiscard = React.useCallback(() => {
    storage.clearSession();
    setSavedSession(null);
    setShowModal(false);
  }, [storage]);

  return {
    savedSession,
    showModal,
    handleRestore,
    handleDiscard,
    hasSession: savedSession !== null,
  };
}

// Вспомогательные функции
function getTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'только что';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч. назад`;
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSubjectName(subject: string): string {
  const names: Record<string, string> = {
    MATHEMATICS: 'Математика',
    PHYSICS: 'Физика',
    CHEMISTRY: 'Химия',
    BIOLOGY: 'Биология',
    RUSSIAN: 'Русский язык',
    INFORMATICS: 'Информатика',
  };
  return names[subject] || subject;
}

function getExamTypeName(examType: string): string {
  const names: Record<string, string> = {
    OGE: 'ОГЭ',
    EGE_BASE: 'ЕГЭ (Базовый)',
    EGE_PROFILE: 'ЕГЭ (Профильный)',
    REGULAR: 'Тренировочный тест',
  };
  return names[examType] || examType;
}

export default SessionRecoveryModal;
