import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getSubjectTopics } from '../data/theory';
import { practiceQuestions } from '../data/practiceQuestions';
import { ConfettiService } from '../core/services/ConfettiService';
import api from '../services/api';

import type { SubjectKey } from '../data/theory/types';
import type { PracticeQuestion } from '../data/practiceQuestions';

export default function TopicPracticePage() {
  const { subject, topicId } = useParams<{ subject: string; topicId: string }>();
  const navigate = useNavigate();

  const subjectKey = subject?.toUpperCase() as SubjectKey;
  const topics = useMemo(() => getSubjectTopics(subjectKey), [subjectKey]);
  const topic = useMemo(() => topics.find(t => t.id === topicId), [topics, topicId]);

  const allQuestions: PracticeQuestion[] = useMemo(() => {
    if (!subjectKey || !topicId) return [];
    return practiceQuestions[subjectKey]?.[topicId] ?? [];
  }, [subjectKey, topicId]);

  // retryMode: when retrying only wrong questions
  const [retryMode, setRetryMode] = useState(false);
  const [wrongIndices, setWrongIndices] = useState<Set<number>>(new Set());

  // Active question pool (all or only wrong)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

  useEffect(() => {
    setQuestions(allQuestions);
  }, [allQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongInRound, setWrongInRound] = useState<number[]>([]); // indices within current questions pool
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const progress = questions.length > 0 ? ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100 : 0;

  const handleSelect = useCallback((optionIndex: number) => {
    if (answered) return;
    setSelectedOption(optionIndex);
  }, [answered]);

  const handleConfirm = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    const correct = selectedOption === currentQuestion.correctIndex;
    setAnswered(true);
    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongInRound(prev => [...prev, currentIndex]);
      // Track original question index for retry
      const origIdx = allQuestions.findIndex(q => q.id === currentQuestion.id);
      if (origIdx !== -1) {
        setWrongIndices(prev => new Set([...prev, origIdx]));
      }
    }
  }, [selectedOption, currentQuestion, currentIndex, allQuestions]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setFinished(true);
      setSaving(true);
      const totalCorrect = retryMode
        ? allQuestions.length - wrongIndices.size + correctCount
        : correctCount;
      api.post('/users/practice-result', {
        subject: subjectKey,
        topicId,
        correct: retryMode ? totalCorrect : correctCount,
        total: allQuestions.length,
      }).catch(() => {}).finally(() => setSaving(false));
    }
  }, [currentIndex, questions.length, correctCount, subjectKey, topicId, retryMode, wrongIndices, allQuestions.length]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setCorrectCount(0);
    setWrongInRound([]);
    setWrongIndices(new Set());
    setFinished(false);
    setRetryMode(false);
    setQuestions(allQuestions);
  }, [allQuestions]);

  const handleRetryWrong = useCallback(() => {
    const wrongQuestions = allQuestions.filter((_, i) => wrongIndices.has(i));
    setQuestions(wrongQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setCorrectCount(0);
    setWrongInRound([]);
    setFinished(false);
    setRetryMode(true);
  }, [allQuestions, wrongIndices]);

  const handleBack = useCallback(() => {
    void navigate('/knowledge-map');
  }, [navigate]);

  // Trigger confetti when finished with good result
  useEffect(() => {
    if (!finished) return;
    const percentage = Math.round((correctCount / questions.length) * 100);
    if (percentage >= 80) {
      ConfettiService.preset('achievement');
    }
  }, [finished, correctCount, questions.length]);

  // No topic or no questions
  if (!topic || allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg, #f8fafc)' }}>
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)' }}>
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text, #1e293b)' }}>
            {!topic ? 'Тема не найдена' : 'Вопросы пока не добавлены'}
          </h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #64748b)' }}>
            {!topic ? 'Проверьте ссылку или вернитесь к карте знаний' : 'Скоро здесь появятся практические задания'}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Назад к карте знаний
          </button>
        </div>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 50;
    const emoji = isExcellent ? '🎉' : isGood ? '👍' : '💪';
    const message = isExcellent ? 'Отличный результат!' : isGood ? 'Хорошая работа!' : 'Продолжайте практиковаться!';
    const scoreColor = isExcellent ? '#22c55e' : isGood ? '#eab308' : '#ef4444';
    const wrongCount = questions.length - correctCount;
    const canRetryWrong = !retryMode && wrongCount > 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg, #f8fafc)' }}>
        <div className="w-full max-w-md p-8 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div className="text-5xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text, #1e293b)' }}>{message}</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary, #64748b)' }}>
            {topic.icon} {topic.title}
            {retryMode && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Режим повтора</span>}
          </p>

          {/* Score ring */}
          <div className="flex justify-center mb-5">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Correct / Wrong breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="text-xl font-bold text-green-600">✓ {correctCount}</div>
              <div className="text-xs text-green-700">Правильно</div>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: wrongCount > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${wrongCount > 0 ? '#fecaca' : '#e2e8f0'}` }}>
              <div className="text-xl font-bold" style={{ color: wrongCount > 0 ? '#ef4444' : '#94a3b8' }}>✗ {wrongCount}</div>
              <div className="text-xs" style={{ color: wrongCount > 0 ? '#b91c1c' : '#94a3b8' }}>Неправильно</div>
            </div>
          </div>

          {saving && (
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary, #64748b)' }}>Сохранение...</p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {canRetryWrong && (
              <button
                onClick={handleRetryWrong}
                className="w-full py-3 rounded-xl font-medium text-sm transition-colors"
                style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
              >
                Повторить ошибки ({wrongCount})
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg, #f1f5f9)',
                  color: 'var(--color-text, #334155)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                }}
              >
                Заново
              </button>
              <button
                onClick={handleBack}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
              >
                К карте знаний
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  const isCorrect = selectedOption === currentQuestion?.correctIndex;

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg, #f8fafc)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 transition-colors"
            style={{ color: 'var(--color-text-secondary, #64748b)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад
          </button>
          <div className="flex items-center gap-3">
            {retryMode && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Повтор ошибок</span>
            )}
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary, #64748b)' }}>
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Прогресс теста: ${Math.round(progress)}%`}
          className="w-full h-2 rounded-full mb-6"
          style={{ backgroundColor: 'var(--color-border, #e2e8f0)' }}
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Correct/wrong mini counters */}
        <div className="flex gap-3 mb-4 text-sm">
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <span>✓</span> {correctCount}
          </span>
          <span className="flex items-center gap-1 font-medium" style={{ color: '#ef4444' }}>
            <span>✗</span> {wrongInRound.length}
          </span>
        </div>

        {/* Topic label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{topic.icon}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary, #64748b)' }}>{topic.title}</span>
        </div>

        {/* Question card */}
        <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2e8f0)' }}>
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text, #1e293b)' }}>
            {currentQuestion?.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, i) => {
              let borderColor = 'var(--color-border, #e2e8f0)';
              let bgColor = 'transparent';
              let textColor = 'var(--color-text, #334155)';

              if (answered) {
                if (i === currentQuestion.correctIndex) {
                  borderColor = '#22c55e';
                  bgColor = '#f0fdf4';
                  textColor = '#166534';
                } else if (i === selectedOption && !isCorrect) {
                  borderColor = '#ef4444';
                  bgColor = '#fef2f2';
                  textColor = '#991b1b';
                }
              } else if (i === selectedOption) {
                borderColor = '#6366f1';
                bgColor = '#eef2ff';
                textColor = '#3730a3';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className="w-full text-left p-4 rounded-xl transition-all font-medium text-sm"
                  style={{
                    border: `2px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    cursor: answered ? 'default' : 'pointer',
                  }}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3" style={{
                    border: `2px solid ${borderColor}`,
                    backgroundColor: bgColor,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {answered && currentQuestion && (
          <div
            className="rounded-2xl p-5 mb-4 animate-fade-in"
            style={{
              backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
              <span className="font-semibold" style={{ color: isCorrect ? '#166534' : '#991b1b' }}>
                {isCorrect ? 'Правильно!' : 'Неправильно'}
              </span>
            </div>
            <p className="text-sm" style={{ color: isCorrect ? '#15803d' : '#b91c1c' }}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end">
          {!answered ? (
            <button
              onClick={handleConfirm}
              disabled={selectedOption === null}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Проверить
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              {currentIndex < questions.length - 1 ? 'Далее →' : 'Завершить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
