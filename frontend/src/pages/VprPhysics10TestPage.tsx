import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { vprPhysics10Variants, VprPhysics10Variant, VprPhysics10Task } from '../data/vpr-physics10-variants';
import { getActiveTestService } from '../core/services';
import { ConfettiService } from '../core/services/ConfettiService';
import toast from 'react-hot-toast';

type TestPhase = 'select' | 'test' | 'results';

export default function VprPhysics10TestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade } = location.state || {};

  const [phase, setPhase] = useState<TestPhase>('select');
  const [selectedVariant, setSelectedVariant] = useState<VprPhysics10Variant | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentTask = selectedVariant?.tasks[currentTaskIndex];
  const progress = selectedVariant ? ((currentTaskIndex + 1) / selectedVariant.tasks.length) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  useEffect(() => {
    if (phase === 'test' && selectedVariant) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, selectedVariant]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectVariant = (variant: VprPhysics10Variant) => {
    setSelectedVariant(variant);
    setAnswers({});
    setCurrentTaskIndex(0);
    setTimeLeft(variant.duration * 60);
    setPhase('test');

    const activeTestService = getActiveTestService();
    activeTestService.startTest({
      examType: 'VPR',
      subject: 'PHYSICS',
      grade: 10,
      title: `ВПР Физика 10 класс - ${variant.title}`,
      startedAt: new Date().toISOString(),
      currentTaskIndex: 0,
      answeredCount: 0,
      totalTasks: variant.tasks.length,
      timeLeftSeconds: variant.duration * 60,
      route: '/test/vpr-physics10',
    });

    toast.success(`Начинаем ${variant.title}`);
  };

  const handleAnswer = (answer: string) => {
    if (!currentTask) return;
    setAnswers((prev) => ({
      ...prev,
      [currentTask.number]: answer,
    }));
  };

  const handleNext = () => {
    if (selectedVariant && currentTaskIndex < selectedVariant.tasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const calculateScore = useCallback(() => {
    if (!selectedVariant) return 0;
    let totalPoints = 0;
    let maxPoints = 0;

    selectedVariant.tasks.forEach((task) => {
      maxPoints += task.points;
      if (task.type !== 'detailed' && task.type !== 'experimental' && answers[task.number]) {
        const userAnswer = answers[task.number].toLowerCase().replace(/\s+/g, '');
        const correctAnswer = task.correctAnswer.toLowerCase().replace(/\s+/g, '');
        if (userAnswer === correctAnswer) {
          totalPoints += task.points;
        }
      }
    });

    return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  }, [answers, selectedVariant]);

  const handleFinish = useCallback(() => {
    const activeTestService = getActiveTestService();
    activeTestService.completeTest();
    setPhase('results');

    const score = calculateScore();
    setTimeout(() => {
      ConfettiService.scoreBasedCelebration(score);
    }, 300);

    toast.success('Тест завершён!');
  }, [calculateScore]);

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    const activeTestService = getActiveTestService();
    activeTestService.abandonTest();
    toast('Тест прерван', { icon: '⚠️' });
    navigate('/dashboard');
  };

  const getTimeColor = () => {
    if (!selectedVariant) return 'text-green-400';
    const totalTime = selectedVariant.duration * 60;
    if (timeLeft > totalTime * 0.5) return 'text-green-400';
    if (timeLeft > totalTime * 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!grade) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Ошибка загрузки теста</p>
          <Button onClick={() => navigate('/dashboard')}>Вернуться</Button>
        </div>
      </div>
    );
  }

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>

          <div className="text-center mb-10">
            <div className="text-6xl mb-4">⚛️</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              ВПР по физике — 10 класс
            </h1>
            <p className="text-gray-400 text-lg">
              Выберите вариант
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vprPhysics10Variants.map((variant, index) => (
              <button
                key={variant.id}
                onClick={() => handleSelectVariant(variant)}
                className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-green-500/50 hover:border-green-400 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-green-400">#{variant.id}</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Вариант {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                  {variant.title}
                </h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {variant.tasks.length} заданий
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {variant.duration} минут
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span>ℹ️</span> Особенности ВПР по физике для 10 класса
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• <strong>13 заданий:</strong> разнообразные типы задач</li>
              <li>• <strong>Темы:</strong> механика, молекулярная физика, термодинамика, электродинамика</li>
              <li>• <strong>Время:</strong> 45 минут</li>
              <li>• <strong>Форматы:</strong> расчёты, графики, эксперименты, объяснения</li>
              <li>• <strong>Проверка:</strong> автоматическая для коротких ответов, ручная для развёрнутых</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && selectedVariant) {
    const score = calculateScore();
    const getScoreEmoji = () => {
      if (score >= 90) return '🏆';
      if (score >= 80) return '🎉';
      if (score >= 70) return '👏';
      if (score >= 60) return '👍';
      return '💪';
    };

    const getScoreMessage = () => {
      if (score >= 90) return 'Превосходно!';
      if (score >= 80) return 'Отлично!';
      if (score >= 70) return 'Хорошо!';
      if (score >= 60) return 'Неплохо!';
      return 'Есть над чем поработать';
    };

    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {getScoreMessage()}
            </h1>
            <p className="text-gray-400 mb-2">{selectedVariant.title} завершён</p>
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm border border-green-500/30 inline-block">
              ВПР Физика 10 класс
            </span>

            <div className="mt-6 mb-8 p-6 bg-gray-800/50 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {score}%
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{answeredCount}/{selectedVariant.tasks.length}</div>
                  <div className="text-sm text-gray-400">отвечено</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedVariant.tasks.reduce((sum, t) => sum + t.points, 0)}
                  </div>
                  <div className="text-sm text-gray-400">макс. баллов</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                К панели управления
              </Button>
              <Button variant="outline" onClick={() => setPhase('select')}>
                Выбрать другой вариант
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedVariant || !currentTask) return null;

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                ВПР Физика 10
              </div>
              <div className="text-sm text-gray-400">{selectedVariant.title}</div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg className={`w-5 h-5 ${getTimeColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="text-sm text-gray-400">
                <span className="text-green-400 font-semibold">{answeredCount}</span> / {selectedVariant.tasks.length}
              </div>

              <button
                onClick={handleExit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl text-green-400 font-semibold">
                  Задание {currentTask.number}
                </span>
                <span className="text-sm text-gray-400">
                  {currentTask.points} {currentTask.points === 1 ? 'балл' : currentTask.points < 5 ? 'балла' : 'баллов'}
                </span>
              </div>
              <div className="text-sm text-gray-500">{currentTask.topic}</div>
            </div>
          </div>

          {/* Изображение */}
          {currentTask.imageUrl && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <img
                src={currentTask.imageUrl}
                alt={`Задание ${currentTask.number}`}
                className="max-w-full h-auto rounded-xl mx-auto"
              />
            </div>
          )}

          {currentTask.imageUrls && currentTask.imageUrls.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              {currentTask.imageUrls.map((url, idx) => (
                <div key={idx} className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <img
                    src={url}
                    alt={`Изображение ${idx + 1}`}
                    className="max-w-full h-auto rounded-xl mx-auto"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-lg text-gray-200 whitespace-pre-line leading-relaxed">
              {currentTask.text}
            </p>
            {currentTask.hint && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-400">
                  💡 <strong>Подсказка:</strong> {currentTask.hint}
                </p>
              </div>
            )}
            {currentTask.tableData && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-400">
                  📊 <strong>Данные:</strong> {currentTask.tableData}
                </p>
              </div>
            )}
          </div>

          <div className="mb-8">
            {currentTask.type === 'choice' && currentTask.options && (
              <div className="space-y-3">
                {currentTask.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      answers[currentTask.number] === option
                        ? 'border-green-500 bg-green-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-green-500/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentTask.type === 'multiple_choice' && currentTask.options && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">Выберите все правильные ответы</p>
                {currentTask.options.map((option, index) => {
                  const currentAnswers = answers[currentTask.number]?.split(',') || [];
                  const isSelected = currentAnswers.includes(option);

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        let newAnswers: string[];
                        if (isSelected) {
                          newAnswers = currentAnswers.filter(a => a !== option);
                        } else {
                          newAnswers = [...currentAnswers, option].sort();
                        }
                        handleAnswer(newAnswers.filter(a => a).join(','));
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'border-green-500 bg-green-500/10 text-white'
                          : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-green-500/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-green-500 bg-green-500' : 'border-gray-600'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {(currentTask.type === 'short' || currentTask.type === 'calculation' || currentTask.type === 'table') && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Введите ответ:
                </label>
                <input
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Ваш ответ"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            )}

            {(currentTask.type === 'detailed' || currentTask.type === 'experimental') && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Развёрнутый ответ {currentTask.type === 'experimental' && '(экспериментальная работа)'}:
                </label>
                <textarea
                  value={answers[currentTask.number] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Напишите ваш ответ с объяснением..."
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-vertical"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {currentTask.type === 'experimental'
                    ? '📝 Опишите установку и порядок проведения эксперимента'
                    : '💭 Обоснуйте свой ответ'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentTaskIndex === 0}
            >
              ← Предыдущее
            </Button>

            <div className="flex gap-3">
              {currentTaskIndex === selectedVariant.tasks.length - 1 ? (
                <Button onClick={handleFinish}>
                  Завершить тест
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Следующее →
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-sm text-gray-400 mb-3">Навигация:</h3>
          <div className="grid grid-cols-6 sm:grid-cols-13 gap-2">
            {selectedVariant.tasks.map((task, index) => (
              <button
                key={task.number}
                onClick={() => setCurrentTaskIndex(index)}
                className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                  currentTaskIndex === index
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white scale-110'
                    : answers[task.number]
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-green-500/50'
                }`}
              >
                {task.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 animate-scale-in">
            <h4 className="text-xl font-semibold text-white mb-3">
              Выйти из теста?
            </h4>
            <p className="text-gray-400 mb-2">
              Вы ответили на <span className="text-green-400 font-semibold">{answeredCount}</span> из <span className="text-white">{selectedVariant.tasks.length}</span> вопросов.
            </p>
            <p className="text-gray-400 mb-6">
              Вы можете вернуться и продолжить позже или завершить тест сейчас.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full px-4 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all"
              >
                Продолжить тест
              </button>
              <button
                onClick={handleFinish}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all"
              >
                Завершить и сохранить
              </button>
              <button
                onClick={handleConfirmExit}
                className="w-full px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all"
              >
                Выйти без сохранения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
