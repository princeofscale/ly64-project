/**
 * TestSetupPage - Modern test setup interface
 * Grade and level selection with glassmorphic design
 */

import { SUBJECT_LABELS, AVAILABLE_GRADES } from '@lyceum64/shared';
import { motion } from 'framer-motion';
import { Clock, Trophy, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
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

const subjectColors: Record<string, string> = {
  RUSSIAN: 'from-red-500 to-pink-500',
  MATHEMATICS: 'from-blue-500 to-cyan-500',
  PHYSICS: 'from-purple-500 to-indigo-500',
  INFORMATICS: 'from-green-500 to-emerald-500',
  BIOLOGY: 'from-emerald-500 to-teal-500',
  HISTORY: 'from-amber-500 to-orange-500',
  ENGLISH: 'from-cyan-500 to-blue-500',
};

type ExamLevel = 'base' | 'profile' | null;

const needsLevelSelection = (grade: number, subject: string): boolean => {
  if (grade === 11 && subject === 'MATHEMATICS') return true;
  if (grade === 8 && subject === 'PHYSICS') return true;
  return false;
};

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

const getExamDuration = (grade: number, subject: string): string => {
  if (grade === 9 || grade === 11) return '3 часа 55 минут';
  if (grade === 10 && subject === 'PHYSICS') return '45 минут';
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
  const subjectDescription = subject ? subjectDescriptions[subject] || '' : '';
  const gradientColor = subject
    ? subjectColors[subject] || 'from-indigo-500 to-purple-500'
    : 'from-indigo-500 to-purple-500';

  const handleStart = () => {
    if (!selectedGrade || !subject) return;

    const needsLevel = needsLevelSelection(selectedGrade, subject);

    if (needsLevel && !selectedLevel) {
      return;
    }

    navigate('/test/exam', {
      state: {
        grade: selectedGrade,
        subject,
        egeType: selectedLevel,
      },
    });
  };

  const isReadyToStart = () => {
    if (!selectedGrade) return false;
    if (!subject) return false;

    const needsLevel = needsLevelSelection(selectedGrade, subject);
    if (needsLevel && !selectedLevel) return false;

    return true;
  };

  return (
    <PageLayout
      title={`Настройка теста: ${subjectLabel}`}
      subtitle={subjectDescription}
      background="gradient"
      action={
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Назад
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Subject Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="glass" padding="lg" className="mb-8">
            <div className="flex items-center gap-6">
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-5xl shadow-xl`}
              >
                {subjectIcon}
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {subjectLabel}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{subjectDescription}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" size="md">
                    <BookOpen className="w-4 h-4" />
                    Экзамен
                  </Badge>
                  <Badge variant="secondary" size="md">
                    <Trophy className="w-4 h-4" />
                    Сертификат
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Grade Selection */}
        <ContentSection
          title="Шаг 1: Выберите класс"
          description="Выберите класс для прохождения теста"
        >
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <GridLayout cols={4} gap="md">
              {AVAILABLE_GRADES.map(grade => (
                <motion.div key={grade} variants={cardVariants}>
                  <Card
                    variant={selectedGrade === grade ? 'elevated' : 'glass'}
                    padding="md"
                    hover
                    onClick={() => {
                      setSelectedGrade(grade);
                      setSelectedLevel(null);
                    }}
                    className={`cursor-pointer ${
                      selectedGrade === grade
                        ? 'ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/20'
                        : ''
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold mb-2 ${
                          selectedGrade === grade
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {grade}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {getExamType(grade)}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {subject && getExamDuration(grade, subject)}
                      </div>
                    </div>

                    {selectedGrade === grade && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </GridLayout>
          </motion.div>
        </ContentSection>

        {/* Level Selection (if needed) */}
        {selectedGrade && subject && needsLevelSelection(selectedGrade, subject) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ContentSection
              title="Шаг 2: Выберите уровень"
              description="Выберите уровень сложности экзамена"
            >
              <GridLayout cols={2} gap="lg">
                {getLevelOptions(selectedGrade, subject).map(option => (
                  <Card
                    key={option.value}
                    variant={selectedLevel === option.value ? 'elevated' : 'glass'}
                    padding="lg"
                    hover
                    onClick={() => setSelectedLevel(option.value)}
                    className={`cursor-pointer ${
                      selectedLevel === option.value
                        ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3
                        className={`text-xl font-bold ${
                          selectedLevel === option.value
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {option.label}
                      </h3>

                      {selectedLevel === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400">{option.description}</p>
                  </Card>
                ))}
              </GridLayout>
            </ContentSection>
          </motion.div>
        )}

        {/* Summary and Start Button */}
        {selectedGrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card variant="gradient" padding="lg">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Готовы начать?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {subjectLabel} • {getExamType(selectedGrade, selectedLevel || undefined)} •{' '}
                    {subject && getExamDuration(selectedGrade, subject)}
                  </p>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleStart}
                  disabled={!isReadyToStart()}
                  rightIcon={<ChevronRight className="w-5 h-5" />}
                >
                  Начать тест
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <GridLayout cols={3} gap="md">
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Реальные задания</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Задания соответствуют формату экзамена
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
