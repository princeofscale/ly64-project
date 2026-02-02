import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import { sdamgiaService } from '../services/sdamgiaService';

import type { SdamgiaProblem } from '../services/sdamgiaService';

export default function SdamgiaTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { variantId, subject, examType, grade } = location.state || {};

  const [problems, setProblems] = useState<SdamgiaProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!variantId || !subject || !examType) {
      toast.error('Неверные параметры теста');
      navigate('/dashboard');
      return;
    }

    loadVariant();
  }, [variantId, subject, examType, grade]);

  const loadVariant = async () => {
    try {
      setLoading(true);
      // Передаем grade для ВПР
      const variant = await sdamgiaService.getVariant(variantId, subject, examType, grade);
      setProblems(variant.problems);
    } catch (error) {
      console.error('Error loading variant:', error);
      toast.error('Ошибка загрузки варианта');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [problems[currentIndex].id]: value,
    });
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < problems.length) {
      if (
        !confirm(`Вы ответили на ${answeredCount} из ${problems.length} вопросов. Завершить тест?`)
      ) {
        return;
      }
    }

    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    problems.forEach(problem => {
      const userAnswer = answers[problem.id]?.trim().toLowerCase();
      const correctAnswer = problem.answer?.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correct++;
      }
    });
    return { correct, total: problems.length };
  };

  const currentProblem = problems[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
      </div>
    );
  }

  if (showResults) {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-6">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Тест завершен!
          </h1>
          <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
          <p className="text-gray-400 text-lg mb-8">
            Правильно: {correct} из {total}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={async () => navigate('/dashboard')}>На главную</Button>
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Посмотреть ответы
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Задание не найдено</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentProblem.part === 1
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}
              >
                Часть {currentProblem.part}
              </span>
              <p className="text-gray-400 text-sm font-sans">
                {currentIndex + 1} из {problems.length}
              </p>
              {currentProblem.score && currentProblem.score > 1 && (
                <span className="text-yellow-400 text-xs">{currentProblem.score} балла</span>
              )}
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Задание №{currentProblem.number}
            </h2>
            {currentProblem.topic && (
              <p className="text-cyan-400 text-sm font-sans mt-1">{currentProblem.topic}</p>
            )}
          </div>
          <button
            onClick={async () => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 mb-6">
          {/* Стили для контента из sdamgia */}
          <style>{`
            .sdamgia-content img {
              max-width: 100%;
              height: auto;
              margin: 1rem auto;
              display: block;
              border-radius: 12px;
              background: white;
              padding: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .sdamgia-content table {
              border-collapse: collapse;
              margin: 1rem auto;
              background: rgba(255,255,255,0.95);
              border-radius: 12px;
              overflow: hidden;
              color: #1f2937;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .sdamgia-content td, .sdamgia-content th {
              border: 1px solid #e5e7eb;
              padding: 10px 16px;
              text-align: center;
            }
            .sdamgia-content th {
              background: #f3f4f6;
              font-weight: 600;
            }
            .sdamgia-content .left {
              text-align: left !important;
            }
            .sdamgia-content p {
              margin: 0.75rem 0;
              line-height: 1.7;
            }
            .sdamgia-content b, .sdamgia-content strong {
              color: #22d3ee;
            }
            .sdamgia-content .pbody {
              background: rgba(255,255,255,0.05);
              padding: 1rem;
              border-radius: 8px;
              margin: 0.5rem 0;
            }
            .sdamgia-content center {
              margin: 1rem 0;
            }
            .sdamgia-content br {
              margin: 0.25rem 0;
            }
            .sdamgia-content span[style*="math"] {
              font-family: 'Times New Roman', serif;
            }
          `}</style>
          <div
            className="sdamgia-content prose prose-invert max-w-none mb-6 text-gray-100"
            dangerouslySetInnerHTML={{ __html: currentProblem.question }}
          />

          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-sans mb-2">Ваш ответ:</label>
            <input
              type="text"
              value={answers[currentProblem.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans"
              placeholder="Введите ответ"
            />
          </div>

          {currentProblem.solution && (
            <details className="mt-6">
              <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-sans">
                Показать решение
              </summary>
              <div
                className="mt-4 sdamgia-content prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentProblem.solution }}
              />
            </details>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button onClick={handlePrev} disabled={currentIndex === 0} variant="outline">
            ← Предыдущий
          </Button>

          <div className="text-gray-400 text-sm font-sans">
            Отвечено: {Object.keys(answers).length} / {problems.length}
          </div>

          {currentIndex < problems.length - 1 ? (
            <Button onClick={handleNext}>Следующий →</Button>
          ) : (
            <Button onClick={handleFinish}>Завершить тест</Button>
          )}
        </div>
      </div>
    </div>
  );
}
