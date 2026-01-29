import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUBJECT_LABELS, AVAILABLE_GRADES } from '@lyceum64/shared';
import { Button } from '../components/Button';

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

export default function TestSetupPage() {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const subjectLabel = subject ? SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] : 'Неизвестный предмет';
  const subjectIcon = subject ? subjectIcons[subject] || '📝' : '📝';
  const subjectDescription = subject ? subjectDescriptions[subject] || 'Тест по предмету' : 'Тест по предмету';

  const handleStartTest = () => {
    if (!selectedGrade || !subject) return;

    // Для ЕГЭ по математике (11 класс) - выбор профильный/базовый
    if (selectedGrade === 11 && subject === 'MATHEMATICS') {
      navigate('/test/ege-type', {
        state: { grade: selectedGrade, subject }
      });
    }
    // Для ВПР по физике (8 класс) - выбор базовый/профильный
    else if (selectedGrade === 8 && subject === 'PHYSICS') {
      navigate('/test/vpr-physics8-level', {
        state: { grade: selectedGrade, subject }
      });
    }
    // Все остальные тесты направляем на ExamTestPage
    // VPR (8/10 класс), OGE (9 класс), EGE (11 класс) для всех предметов
    else {
      navigate('/test/oge-ege', {
        state: { grade: selectedGrade, subject }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-sans"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад к панели управления
        </button>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4 animate-bounce">{subjectIcon}</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              {subjectLabel}
            </h1>
            <p className="text-gray-400 text-lg font-sans">
              {subjectDescription}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
              Выберите ваш класс
            </h2>
            <p className="text-gray-400 font-sans mb-6">
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
                    ${selectedGrade === grade
                      ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-105'
                      : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-gray-800/70'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center">
                    <div className={`text-3xl font-display font-bold mb-2 transition-all duration-300 ${
                      selectedGrade === grade
                        ? 'text-cyan-400 scale-110'
                        : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {grade}
                    </div>
                    <div className={`text-sm font-sans transition-colors ${
                      selectedGrade === grade
                        ? 'text-cyan-300'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      класс
                    </div>
                  </div>

                  {selectedGrade === grade && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-1.5 animate-scale-in">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedGrade && (
            <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl mb-6 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-white mb-2">
                    {selectedGrade === 9 ? 'Вариант ОГЭ' : selectedGrade === 11 ? 'Вариант ЕГЭ' : selectedGrade === 8 || selectedGrade === 10 ? 'Вариант ВПР' : `Тест для ${selectedGrade} класса`}
                  </h3>
                  <ul className="text-sm text-gray-300 font-sans space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      10 вопросов
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-400">•</span>
                      Время на прохождение: 30 минут
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleStartTest}
              disabled={!selectedGrade}
              className="flex-1"
            >
              {selectedGrade ? 'Начать тест' : 'Выберите класс'}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-sans">
                <span className="text-cyan-400 font-semibold">Совет:</span> Выбирайте класс честно - это поможет нам точнее оценить ваш уровень и подготовить персональный план обучения
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
