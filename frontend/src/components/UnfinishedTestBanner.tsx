import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getActiveTestService } from '../core/services';

import type { ActiveTestData } from '../core/services';

interface UnfinishedTestBannerProps {
  onAbandon?: () => void;
}

export function UnfinishedTestBanner({ onAbandon }: UnfinishedTestBannerProps) {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState<ActiveTestData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const service = getActiveTestService();
    setActiveTest(service.getActiveTest());
  }, []);

  if (!activeTest) return null;

  const handleContinue = () => {
    navigate(activeTest.route);
  };

  const handleAbandon = () => {
    const service = getActiveTestService();
    service.abandonTest();
    setActiveTest(null);
    setShowConfirm(false);
    onAbandon?.();
  };

  const progress = Math.round((activeTest.answeredCount / activeTest.totalTasks) * 100);
  const startedAt = new Date(activeTest.startedAt);
  const timeAgo = formatTimeAgo(startedAt);

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-amber-400">У вас есть незавершённый тест</h3>
          </div>

          <div className="text-gray-300 mb-3">
            <p className="font-medium text-white">{activeTest.title}</p>
            <p className="text-sm text-gray-400">Начат {timeAgo}</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Прогресс</span>
                <span className="text-amber-400">
                  {activeTest.answeredCount} из {activeTest.totalTasks}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Продолжить тест
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2.5 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all"
            >
              Завершить без сохранения
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-3">Завершить тест?</h4>
            <p className="text-gray-400 mb-6">
              Весь прогресс будет потерян. Вы уверены, что хотите завершить тест без сохранения
              результата?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleAbandon}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all"
              >
                Да, завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'только что';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч. назад`;
  return `${Math.floor(seconds / 86400)} дн. назад`;
}
