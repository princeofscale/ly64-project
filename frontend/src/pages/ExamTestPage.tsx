import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { getActiveTestService } from '../core/services';
import { ConfettiService } from '../core/services/ConfettiService';
import toast from 'react-hot-toast';

interface Task {
  number: number;
  text: string;
  type: 'short' | 'choice' | 'matching' | 'multiple_choice' | 'detailed' | 'proof';
  options?: string[];
  correctAnswer: string;
  points: number;
  topic: string;
  detailedSolution?: boolean;
  requiresProof?: boolean;
}

import { ogeMathVariant } from '../data/oge-math-variant';
import { egeMathProfile } from '../data/ege-math-profile';
import { egeMathBase } from '../data/ege-math-base';

export default function ExamTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade, subject, egeType } = location.state || {};

  const getExamVariant = () => {
    if (grade === 9) return ogeMathVariant;
    if (grade === 11 && egeType === 'profile') return egeMathProfile;
    if (grade === 11 && egeType === 'base') return egeMathBase;
    return ogeMathVariant;
  };

  const examVariant = getExamVariant();
  const tasks = examVariant.tasks as Task[];

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(examVariant.duration * 60);
  const [showResults, setShowResults] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isTestRegistered, setIsTestRegistered] = useState(false);

  const currentTask = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;

  const getExamTitle = () => {
    if (grade === 9) return 'ОГЭ Математика';
    if (grade === 11 && egeType === 'profile') return 'ЕГЭ Математика (Профильный)';
    if (grade === 11 && egeType === 'base') return 'ЕГЭ Математика (Базовый)';
    return 'Экзамен';
  };

  const getExamType = () => {
    if (grade === 9) return 'OGE' as const;
    if (grade === 11 && egeType === 'profile') return 'EGE_PROFILE' as const;
    if (grade === 11 && egeType === 'base') return 'EGE_BASE' as const;
    return 'REGULAR' as const;
  };

  useEffect(() => {
    if (!grade || !subject) return;

    const activeTestService = getActiveTestService();

    if (!isTestRegistered) {
      activeTestService.startTest({
        examType: getExamType(),
        subject: 'MATHEMATICS',
        grade: grade as 9 | 11,
        title: getExamTitle(),
        startedAt: new Date().toISOString(),
        currentTaskIndex: 0,
        answeredCount: 0,
        totalTasks: tasks.length,
        timeLeftSeconds: examVariant.duration * 60,
        route: '/test/oge-ege',
      });
      setIsTestRegistered(true);
    }
  }, [grade, subject, isTestRegistered]);

  useEffect(() => {
    const activeTestService = getActiveTestService();
    activeTestService.updateProgress({
      currentTaskIndex,
      answeredCount,
      timeLeftSeconds: timeLeft,
    });
  }, [currentTaskIndex, answeredCount, timeLeft]);

  useEffect(() => {
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
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentTask.number]: answer,
    }));
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const calculateScore = useCallback(() => {
    const totalPoints = Object.entries(answers).reduce((sum, [num, ans]) => {
      const task = tasks.find((t) => t.number === parseInt(num));
      if (task && task.correctAnswer === ans) {
        return sum + task.points;
      }
      return sum;
    }, 0);
    const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    return Math.round((totalPoints / maxPoints) * 100);
  }, [answers, tasks]);

  const handleFinish = useCallback(() => {
    const activeTestService = getActiveTestService();
    activeTestService.completeTest();
    setShowResults(true);

    const scorePercent = calculateScore();
    setTimeout(() => {
      ConfettiService.scoreBasedCelebration(scorePercent);
    }, 300);

    toast.success('Тест завершен!');
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
    const totalTime = examVariant.duration * 60;
    if (timeLeft > totalTime * 0.5) return 'text-cyan-400';
    if (timeLeft > totalTime * 0.25) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!grade || !subject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 font-sans mb-4">Ошибка загрузки теста</p>
          <Button onClick={() => navigate('/dashboard')}>Вернуться к панели</Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = Object.entries(answers).filter(
      ([num, ans]) => tasks.find((t) => t.number === parseInt(num))?.correctAnswer === ans
    ).length;

    const totalPoints = Object.entries(answers).reduce((sum, [num, ans]) => {
      const task = tasks.find((t) => t.number === parseInt(num));
      if (task && task.correctAnswer === ans) {
        return sum + task.points;
      }
      return sum;
    }, 0);

    const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    const scorePercent = Math.round((totalPoints / maxPoints) * 100);

    const getScoreEmoji = () => {
      if (scorePercent >= 90) return '🏆';
      if (scorePercent >= 80) return '🎉';
      if (scorePercent >= 70) return '👏';
      if (scorePercent >= 60) return '👍';
      return '💪';
    };

    const getScoreMessage = () => {
      if (scorePercent >= 90) return 'Превосходно!';
      if (scorePercent >= 80) return 'Отлично!';
      if (scorePercent >= 70) return 'Хорошо!';
      if (scorePercent >= 60) return 'Неплохо!';
      return 'Есть над чем поработать';
    };

    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {getScoreMessage()}
            </h1>
            <p className="text-gray-400 mb-6">Тест завершен</p>

            <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {scorePercent}%
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    scorePercent >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    scorePercent >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{correctCount}/{tasks.length}</div>
                  <div className="text-sm text-gray-400">правильных ответов</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{totalPoints}/{maxPoints}</div>
                  <div className="text-sm text-gray-400">первичных баллов</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                К панели управления
              </Button>
              <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                🏆 Таблица лидеров
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {getExamTitle()}
              </div>
              <div className="text-sm text-gray-400 font-sans">
                {grade} класс
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${getTimeColor()}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="text-sm font-sans text-gray-400">
                <span className="text-cyan-400 font-semibold">{answeredCount}</span> / {tasks.length} отвечено
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
              className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
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
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-display font-semibold">
                  Задание {currentTask.number}
                </span>
                <span className="text-sm text-gray-400 font-sans">
                  {currentTask.points} {currentTask.points === 1 ? 'балл' : currentTask.points < 5 ? 'балла' : 'баллов'}
                </span>
              </div>
              <div className="text-sm text-gray-500 font-sans">{currentTask.topic}</div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-lg text-gray-200 font-sans whitespace-pre-line leading-relaxed">
              {currentTask.text}
            </p>
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
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="font-sans">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {currentTask.type === 'short' && (
              <div>
                <label className="block text-sm font-sans text-gray-400 mb-2">
                  Введите ответ:
                </label>
                <input
                  type="text"
                  value={answers[currentTask.number] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Ваш ответ"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                />
              </div>
            )}

            {(currentTask.type === 'detailed' || currentTask.type === 'proof') && (
              <div>
                <label className="block text-sm font-sans text-gray-400 mb-2">
                  {currentTask.type === 'proof' ? 'Напишите доказательство:' : 'Подробное решение:'}
                </label>
                <textarea
                  value={answers[currentTask.number] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={currentTask.type === 'proof' ? 'Опишите доказательство...' : 'Опишите решение...'}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-vertical font-sans"
                />
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
              {currentTaskIndex === tasks.length - 1 ? (
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
          <h3 className="text-sm font-sans text-gray-400 mb-3">Быстрая навигация:</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {tasks.map((task, index) => (
              <button
                key={task.number}
                onClick={() => setCurrentTaskIndex(index)}
                className={`aspect-square rounded-lg font-display font-semibold text-sm transition-all ${
                  currentTaskIndex === index
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-110'
                    : answers[task.number]
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
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
              Вы ответили на <span className="text-cyan-400 font-semibold">{answeredCount}</span> из <span className="text-white">{tasks.length}</span> вопросов.
            </p>
            <p className="text-gray-400 mb-6">
              Вы можете вернуться и продолжить позже или завершить тест сейчас.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full px-4 py-3 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 transition-all"
              >
                Продолжить тест
              </button>
              <button
                onClick={handleFinish}
                className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all"
              >
                Завершить и сохранить результат
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
