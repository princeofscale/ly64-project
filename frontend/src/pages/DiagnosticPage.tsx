import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { SUBJECT_LABELS } from '@lyceum64/shared';

interface DiagnosticStatus {
  completed: boolean;
  results: { subject: string; score: number; level: string }[];
  subjects: string[];
}

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [status, setStatus] = useState<DiagnosticStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch(
        `/api/diagnostic/status?direction=${user?.desiredDirection || ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
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

  const generatePlan = async () => {
    try {
      const response = await fetch('/api/diagnostic/plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ direction: user?.desiredDirection }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('План обучения создан!');
        navigate('/learning-plan');
      }
    } catch (error) {
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

          {!status?.completed && (
            <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-scale-in">
              <p className="text-amber-400 font-sans">
                Пройдите все тесты, чтобы получить персональный план обучения.
                Осталось:{' '}
                <span className="font-semibold">
                  {(status?.subjects.length || 0) - (status?.results.length || 0)}
                </span>{' '}
                предметов
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
