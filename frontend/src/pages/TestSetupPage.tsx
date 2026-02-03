import { SUBJECT_LABELS, AVAILABLE_GRADES } from '@lyceum64/shared';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageLayout, ContentSection, GridLayout } from '../components/layout';
import { cardVariants, staggerContainer } from '../utils/animations';

const subjectIcons: Record<string, string> = {
  RUSSIAN: '📖',
  MATHEMATICS: '🔢',
  PHYSICS: '⚛️',
  INFORMATICS: '💻',
  BIOLOGY: '🧬',
  HISTORY: '🏛️',
  ENGLISH: '🇬🇧',
};

const subjectDescriptions: Record<string, string> = {
  RUSSIAN: 'Проверьте свои знания русского языка',
  MATHEMATICS: 'Решите задачи по математике',
  PHYSICS: 'Проверьте понимание физических законов',
  INFORMATICS: 'Продемонстрируйте навыки программирования',
  BIOLOGY: 'Покажите знания в биологии',
  HISTORY: 'Проверьте знание истории',
  ENGLISH: 'Проверьте уровень английского языка',
};

type ExamLevel = 'base' | 'profile' | null;

// Проверка нужен ли выбор уровня
const needsLevelSelection = (grade: number, subject: string): boolean => {
  // Математика 11 класс (ЕГЭ) - профильный или базовый
  if (grade === 11 && subject === 'MATHEMATICS') return true;
  // Физика 8 класс (ВПР) - профильный или базовый
  if (grade === 8 && subject === 'PHYSICS') return true;
  return false;
};

// Получить варианты уровней для предмета
const getLevelOptions = (
  grade: number,
  subject: string
): { value: ExamLevel; label: string; description: string }[] => {
  if (grade === 11 && subject === 'MATHEMATICS') {
    return [
      { value: 'base', label: 'Базовый', description: 'Для непрофильных специальностей' },
      {
        value: 'profile',
        label: 'Профильный',
        description: 'Для технических и экономических специальностей',
      },
    ];
  }
  if (grade === 8 && subject === 'PHYSICS') {
    return [
      { value: 'base', label: 'Базовый', description: 'Стандартный уровень ВПР' },
      { value: 'profile', label: 'Профильный', description: 'Углублённый уровень ВПР' },
    ];
  }
  return [];
};

// Функция для получения типа экзамена
const getExamType = (grade: number, level?: ExamLevel): string => {
  if (grade === 9) return 'ОГЭ';
  if (grade === 11) {
    if (level === 'base') return 'ЕГЭ (базовый)';
    if (level === 'profile') return 'ЕГЭ (профильный)';
    return 'ЕГЭ';
  }
  if (grade === 8) {
    if (level === 'base') return 'ВПР (базовый)';
    if (level === 'profile') return 'ВПР (профильный)';
  }
  return 'ВПР';
};

// Функция для получения времени выполнения
const getExamDuration = (grade: number, subject: string): string => {
  // ОГЭ и ЕГЭ - 3 часа 55 минут
  if (grade === 9 || grade === 11) {
    return '3 часа 55 минут';
  }
  // Исключение: физика 10 класс - 45 минут
  if (grade === 10 && subject === 'PHYSICS') {
    return '45 минут';
  }
  // ВПР - 1 час 30 минут
  return '1 час 30 минут';
};

export default function TestSetupPage() {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel>(null);

  const subjectLabel = subject
    ? SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS]
    : 'Неизвестный предмет';
  const subjectIcon = subject ? subjectIcons[subject] || '📝' : '📝';
  const subjectDescription = subject
    ? subjectDescriptions[subject] || 'Тест по предмету'
    : 'Тест по предмету';

  // Проверяем нужен ли выбор уровня
  const showLevelSelection =
    selectedGrade && subject && needsLevelSelection(selectedGrade, subject);
  const levelOptions = selectedGrade && subject ? getLevelOptions(selectedGrade, subject) : [];

  // Сбрасываем уровень при смене класса
  useEffect(() => {
    setSelectedLevel(null);
  }, [selectedGrade]);

  const handleStart = () => {
    if (!selectedGrade || !subject) return;
    // Если нужен выбор уровня, но уровень не выбран - не продолжаем
    if (showLevelSelection && !selectedLevel) return;

    // Переходим на страницу выбора варианта из sdamgia
    navigate('/test/variants', {
      state: { grade: selectedGrade, subject, level: selectedLevel },
    });
  };

  // Проверка можно ли начать тест
  const canStartTest = selectedGrade && (!showLevelSelection || selectedLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden py-12 px-4">
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-violet-100/50 rounded-full blur-[120px] -z-10 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="group mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Назад к панели управления
        </button>

        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4 animate-bounce">{subjectIcon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
              {subjectLabel}
            </h1>
            <p className="text-slate-600 text-lg">{subjectDescription}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" />
              Выберите ваш класс
            </h2>
            <p className="text-slate-600 mb-6">
              Мы подберем тест соответствующий вашему уровню
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {AVAILABLE_GRADES.map((grade, index) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`
                    group relative p-6 rounded-2xl border-2 transition-all duration-300
                    animate-scale-in
                    ${
                      selectedGrade === grade
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/25 scale-105'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold mb-2 transition-all duration-300 ${
                        selectedGrade === grade
                          ? 'text-blue-600 scale-110'
                          : 'text-slate-700 group-hover:text-blue-600'
                      }`}
                    >
                      {grade}
                    </div>
                    <div
                      className={`text-sm transition-colors ${
                        selectedGrade === grade
                          ? 'text-blue-600'
                          : 'text-slate-600 group-hover:text-slate-700'
                      }`}
                    >
                      класс
                    </div>
                  </div>

                  {selectedGrade === grade && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-1.5 animate-scale-in shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор уровня (профильный/базовый) */}
          {showLevelSelection && (
            <div className="mb-8 animate-scale-in">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-violet-600 rounded-full mr-3 animate-pulse" />
                Выберите уровень
              </h2>
              <p className="text-slate-600 mb-6">
                {subject === 'MATHEMATICS' && selectedGrade === 11
                  ? 'Базовый уровень оценивается по 5-балльной шкале, профильный — по 100-балльной'
                  : 'Выберите уровень сложности ВПР'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {levelOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedLevel(option.value)}
                    className={`
                      group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                      animate-scale-in
                      ${
                        selectedLevel === option.value
                          ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/25 scale-105'
                          : 'border-slate-200 bg-white hover:border-violet-300 hover:shadow-md'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          selectedLevel === option.value
                            ? 'bg-gradient-to-r from-violet-500 to-violet-600'
                            : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.value === 'base' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-xl font-bold mb-1 transition-colors ${
                            selectedLevel === option.value
                              ? 'text-violet-600'
                              : 'text-slate-900 group-hover:text-violet-600'
                          }`}
                        >
                          {option.label}
                        </div>
                        <div
                          className={`text-sm transition-colors ${
                            selectedLevel === option.value
                              ? 'text-violet-700'
                              : 'text-slate-600 group-hover:text-slate-700'
                          }`}
                        >
                          {option.description}
                        </div>
                      </div>
                    </div>

                    {selectedLevel === option.value && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full p-1.5 animate-scale-in shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                          className="w-4 h-4 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Информация о тесте */}
          {selectedGrade && (!showLevelSelection || selectedLevel) && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl mb-6 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Решить вариант {getExamType(selectedGrade, selectedLevel)}
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Полный вариант {getExamType(selectedGrade, selectedLevel)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Время на прохождение: {getExamDuration(selectedGrade, subject || '')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleStartTest} disabled={!canStartTest} className="flex-1">
              {!selectedGrade
                ? 'Выберите класс'
                : showLevelSelection && !selectedLevel
                  ? 'Выберите уровень'
                  : 'Начать тест'}
            </Button>
          </div>
        </div>

        <div
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <span className="text-blue-600 font-semibold">Совет:</span> Выбирайте класс честно -
                это поможет нам точнее оценить ваш уровень и подготовить персональный план обучения
              </p>
            </Card>

            <Card variant="glass" padding="md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Таймер</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Контроль времени как на экзамене
              </p>
            </Card>

            <Card variant="glass" padding="md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Результаты</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Детальный анализ после завершения
              </p>
            </Card>
          </GridLayout>
        </motion.div>
      </div>
    </PageLayout>
  );
}
