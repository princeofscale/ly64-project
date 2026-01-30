import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { SUBJECT_LABELS } from '@lyceum64/shared';
import api from '../services/api';

interface DiagnosticStatus {
  completed: boolean;
  results: { subject: string; score: number; level: string }[];
  subjects: string[];
}

interface Recommendation {
  subject: string;
  level: string;
  score: number;
  generalAdvice: string;
  weakTopics: { topic: string; advice: string }[];
  priority: 'high' | 'medium' | 'low';
}

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [status, setStatus] = useState<DiagnosticStatus | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  // Автоматическая генерация плана при завершении
  useEffect(() => {
    if (status?.completed && !user?.diagnosticCompleted) {
      generatePlanAndRedirect();
    }
  }, [status?.completed]);

  // Предупреждение о закрытии браузера
  useEffect(() => {
    if (status && !status.completed) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [status]);

  const loadStatus = async () => {
    try {
      const response = await api.get(
        `/diagnostic/status?direction=${user?.desiredDirection || ''}`
      );
      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (error) {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (subject: string) => {
    navigate(`/diagnostic/test/${subject}`);
  };

  const loadRecommendations = async () => {
    try {
      const response = await api.get('/diagnostic/recommendations');
      if (response.data.success) {
        setRecommendations(response.data.data);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generatePlan = async () => {
    try {
      const response = await api.post('/diagnostic/plan/generate', {
        direction: user?.desiredDirection,
      });
      if (response.data.success) {
        toast.success('План обучения создан!');
        navigate('/learning-plan');
      }
    } catch (error) {
      toast.error('Ошибка генерации плана');
    }
  };

  const generatePlanAndRedirect = async () => {
    try {
      // 1. Генерируем план
      const response = await api.post('/diagnostic/plan/generate', {
        direction: user?.desiredDirection,
      });

      // 2. Обновляем user в store
      if (user) {
        useAuthStore.getState().setUser({ ...user, diagnosticCompleted: true });
      }

      // 3. Показываем поздравление
      toast.success('Диагностика завершена! План создан!', { duration: 5000 });

      // 4. Редирект через 2 секунды
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Ошибка генерации плана');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'INTERMEDIATE':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'ADVANCED':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Начальный';
      case 'INTERMEDIATE':
        return 'Средний';
      case 'ADVANCED':
        return 'Продвинутый';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  // Если пользователь уже завершил диагностику, показываем сообщение
  if (user?.diagnosticCompleted && status?.completed) {
    return (
      <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">
                Диагностика уже завершена
              </h1>
              <p className="text-gray-400 font-sans">
                Вы уже прошли входную диагностику и получили доступ к платформе
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              Перейти на главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Входная диагностика
          </h1>
          <p className="text-gray-400 text-lg font-sans mb-8">
            Пройдите тесты по предметам, чтобы определить ваш уровень и получить
            персональный план обучения
          </p>

          {/* Баннер обязательности */}
          {!status?.completed && !user?.diagnosticCompleted && (
            <div className="mb-6 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-scale-in">
              <h4 className="font-semibold text-amber-300 mb-2 font-display">
                Входная диагностика обязательна
              </h4>
              <p className="text-sm text-amber-400 font-sans mb-2">
                Пройдите все тесты для получения доступа к платформе.
              </p>
              <p className="text-xs text-amber-500 font-sans">
                Осталось:{' '}
                <span className="font-semibold">
                  {(status?.subjects.length || 0) - (status?.results.length || 0)}
                </span>{' '}
                {((status?.subjects.length || 0) - (status?.results.length || 0)) === 1
                  ? 'тест'
                  : ((status?.subjects.length || 0) - (status?.results.length || 0)) >= 5
                  ? 'тестов'
                  : 'теста'}
              </p>
            </div>
          )}

          {/* Прогресс-бар */}
          {status && (
            <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl animate-scale-in">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-white font-display">Прогресс</h3>
                <span className="text-cyan-400 font-sans">
                  {status.results.length}/{status.subjects.length}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      status.subjects.length > 0
                        ? (status.results.length / status.subjects.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {status?.subjects.map((subject, index) => {
              const result = status.results.find((r) => r.subject === subject);
              const subjectLabel =
                SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] || subject;

              return (
                <div
                  key={subject}
                  className="group relative bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-semibold text-xl text-white">{subjectLabel}</h3>
                    {result && (
                      <span
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium border font-sans ${getLevelColor(
                          result.level
                        )}`}
                      >
                        {getLevelLabel(result.level)}
                      </span>
                    )}
                  </div>

                  {result ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-sans">
                        <span className="text-gray-400">Результат:</span>
                        <span className="font-medium text-white">{result.score}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-1000 ${
                            result.score >= 70
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : result.score >= 40
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => startTest(subject)}
                        className="w-full mt-4"
                      >
                        Пройти заново
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => startTest(subject)} className="w-full">
                      Начать тест
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {status?.completed && (
            <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl animate-scale-in">
              <h3 className="font-display font-semibold text-xl mb-2 text-white">
                Диагностика завершена!
              </h3>
              <p className="text-gray-400 font-sans mb-4">
                Теперь вы можете получить персональный план обучения
              </p>
              <Button onClick={generatePlan}>Создать план обучения</Button>
            </div>
          )}

          {/* Кнопка получения рекомендаций */}
          {status && status.results.length > 0 && !showRecommendations && (
            <div className="mt-6 text-center">
              <button
                onClick={loadRecommendations}
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-sans"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Получить рекомендации от ИИ-помощника
              </button>
            </div>
          )}

          {/* Секция рекомендаций */}
          {showRecommendations && recommendations.length > 0 && (
            <div className="mt-8 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    Рекомендации от ИИ-помощника
                  </h2>
                  <p className="text-gray-400 text-sm font-sans">
                    На основе анализа ваших ответов
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const subjectLabel = SUBJECT_LABELS[rec.subject as keyof typeof SUBJECT_LABELS] || rec.subject;
                  const priorityColors = {
                    high: 'border-red-500/30 bg-red-500/5',
                    medium: 'border-yellow-500/30 bg-yellow-500/5',
                    low: 'border-green-500/30 bg-green-500/5',
                  };
                  const priorityLabels = {
                    high: { text: 'Требует внимания', color: 'text-red-400 bg-red-500/20' },
                    medium: { text: 'Можно улучшить', color: 'text-yellow-400 bg-yellow-500/20' },
                    low: { text: 'Хороший уровень', color: 'text-green-400 bg-green-500/20' },
                  };

                  return (
                    <div
                      key={rec.subject}
                      className={`p-5 rounded-2xl border ${priorityColors[rec.priority]} animate-scale-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-white mb-1">
                            {subjectLabel}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 font-sans">
                              Результат: <span className="text-white font-medium">{rec.score}%</span>
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-lg font-sans ${priorityLabels[rec.priority].color}`}>
                              {priorityLabels[rec.priority].text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Общий совет */}
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-xl">
                        <p className="text-gray-300 text-sm font-sans leading-relaxed">
                          <span className="text-purple-400 font-medium">💡 Совет: </span>
                          {rec.generalAdvice}
                        </p>
                      </div>

                      {/* Слабые темы */}
                      {rec.weakTopics.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-400 font-sans mb-2">
                            📚 Темы для повторения:
                          </h4>
                          {rec.weakTopics.map((topic, topicIndex) => (
                            <div
                              key={topicIndex}
                              className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50"
                            >
                              <p className="text-cyan-400 font-medium text-sm mb-1 font-sans">
                                {topic.topic}
                              </p>
                              <p className="text-gray-400 text-sm font-sans leading-relaxed">
                                {topic.advice}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Кнопка скрытия */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-500 hover:text-gray-400 transition-colors text-sm font-sans"
                >
                  Скрыть рекомендации
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
