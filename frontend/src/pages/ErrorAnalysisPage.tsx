import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

interface AnalysisData {
  summary: {
    totalAttempts: number;
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    overallAccuracy: number;
    averageTimePerQuestion: number;
  };
  byQuestionType: {
    type: string;
    typeLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    avgTime: number;
    advice: string[];
  }[];
  byDifficulty: {
    difficulty: string;
    difficultyLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    advice: string;
  }[];
  weakTopics: {
    topic: string;
    subject: string;
    subjectLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    trend: 'improving' | 'declining' | 'stable';
    advice: string[];
  }[];
  strongTopics: {
    topic: string;
    subject: string;
    subjectLabel: string;
    accuracy: number;
    total: number;
  }[];
  frequentMistakes: {
    questionId: string;
    questionText: string;
    topic: string;
    subject: string;
    type: string;
    timesWrong: number;
    timesAttempted: number;
    commonWrongAnswer: string | null;
  }[];
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actionItems: string[];
  }[];
  progressOverTime: {
    date: string;
    accuracy: number;
    questionsCount: number;
  }[];
}

const PRIORITY_COLORS = {
  high: 'border-red-500 bg-red-500/10',
  medium: 'border-amber-500 bg-amber-500/10',
  low: 'border-green-500 bg-green-500/10',
};

const PRIORITY_LABELS = {
  high: 'Важно',
  medium: 'Рекомендуется',
  low: 'Совет',
};

const TREND_ICONS = {
  improving: { icon: '↗', color: 'text-green-400', label: 'Улучшается' },
  declining: { icon: '↘', color: 'text-red-400', label: 'Ухудшается' },
  stable: { icon: '→', color: 'text-gray-400', label: 'Стабильно' },
};

export default function ErrorAnalysisPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'topics' | 'mistakes'>(
    'overview'
  );

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const res = await fetch('/api/users/error-analysis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      } else {
        toast.error('Ошибка загрузки анализа');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p>Не удалось загрузить данные</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Анализ ошибок
            </h1>
            <p className="text-gray-400 mt-1">Детальный разбор ваших результатов</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Назад
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="text-3xl font-bold text-cyan-400">{data.summary.totalAttempts}</div>
            <div className="text-sm text-gray-400">Тестов пройдено</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="text-3xl font-bold text-purple-400">{data.summary.totalQuestions}</div>
            <div className="text-sm text-gray-400">Вопросов всего</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className={`text-3xl font-bold ${getAccuracyColor(data.summary.overallAccuracy)}`}>
              {data.summary.overallAccuracy}%
            </div>
            <div className="text-sm text-gray-400">Общая точность</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="text-3xl font-bold text-amber-400">
              {data.summary.averageTimePerQuestion}с
            </div>
            <div className="text-sm text-gray-400">Среднее время</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Обзор' },
            { id: 'types', label: 'По типам заданий' },
            { id: 'topics', label: 'По темам' },
            { id: 'mistakes', label: 'Частые ошибки' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recommendations */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Персональные рекомендации
              </h2>
              <div className="space-y-4">
                {data.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`border-l-4 rounded-r-xl p-4 ${PRIORITY_COLORS[rec.priority]}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              rec.priority === 'high'
                                ? 'bg-red-500/30 text-red-300'
                                : rec.priority === 'medium'
                                  ? 'bg-amber-500/30 text-amber-300'
                                  : 'bg-green-500/30 text-green-300'
                            }`}
                          >
                            {PRIORITY_LABELS[rec.priority]}
                          </span>
                          <span className="text-xs text-gray-500">{rec.category}</span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                        <ul className="space-y-1">
                          {rec.actionItems.map((item, j) => (
                            <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-cyan-400 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> По уровню сложности
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {data.byDifficulty.map(d => (
                  <div key={d.difficulty} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{d.difficultyLabel}</span>
                      <span className={`text-lg font-bold ${getAccuracyColor(d.accuracy)}`}>
                        {d.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${getAccuracyBg(d.accuracy)}`}
                        style={{ width: `${d.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>✓ {d.correct} верно</span>
                      <span>✗ {d.wrong} ошибок</span>
                    </div>
                    {d.advice && <p className="text-xs text-gray-500 mt-2 italic">{d.advice}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Over Time */}
            {data.progressOverTime.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span> Прогресс по дням
                </h2>
                <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                  {data.progressOverTime.map((day, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[24px]">
                      <div
                        className={`w-5 rounded-t ${getAccuracyBg(day.accuracy)} opacity-80 hover:opacity-100 transition-opacity`}
                        style={{ height: `${Math.max(day.accuracy, 5)}%` }}
                        title={`${day.date}: ${day.accuracy}% (${day.questionsCount} вопросов)`}
                      />
                      <span className="text-[10px] text-gray-500 mt-1 rotate-45 origin-left">
                        {new Date(day.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Topics */}
            {data.strongTopics.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💪</span> Ваши сильные стороны
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.strongTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl"
                    >
                      <span className="font-medium text-green-400">{topic.topic}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {topic.subjectLabel} • {topic.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'types' && (
          <div className="space-y-4">
            {data.byQuestionType.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
                Недостаточно данных для анализа по типам заданий
              </div>
            ) : (
              data.byQuestionType.map(type => (
                <div
                  key={type.type}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{type.typeLabel}</h3>
                      <p className="text-sm text-gray-400">
                        {type.total} вопросов • среднее время: {type.avgTime}с
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getAccuracyColor(type.accuracy)}`}>
                        {type.accuracy}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {type.correct} из {type.total}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full ${getAccuracyBg(type.accuracy)} transition-all`}
                      style={{ width: `${type.accuracy}%` }}
                    />
                  </div>

                  {type.accuracy < 70 && type.advice.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <p className="text-sm font-medium text-amber-400 mb-2">
                        Советы по улучшению:
                      </p>
                      <ul className="space-y-1">
                        {type.advice.map((a, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-amber-400">•</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-4">
            {data.weakTopics.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-gray-400">У вас нет слабых тем! Отличная работа!</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-4">
                  Темы с точностью ниже 70% требуют дополнительного внимания
                </p>
                {data.weakTopics.map((topic, i) => (
                  <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{topic.topic}</h3>
                          <span className={`text-sm ${TREND_ICONS[topic.trend].color}`}>
                            {TREND_ICONS[topic.trend].icon} {TREND_ICONS[topic.trend].label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{topic.subjectLabel}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getAccuracyColor(topic.accuracy)}`}>
                          {topic.accuracy}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.wrong} ошибок из {topic.total}
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full ${getAccuracyBg(topic.accuracy)}`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-sm font-medium text-cyan-400 mb-2">Что делать:</p>
                      <ul className="space-y-1">
                        {topic.advice.map((a, j) => (
                          <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-cyan-400">•</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-4">
            {data.frequentMistakes.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                <span className="text-4xl mb-4 block">✨</span>
                <p className="text-gray-400">Нет повторяющихся ошибок. Так держать!</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-4">Вопросы, в которых вы чаще всего ошибаетесь</p>
                {data.frequentMistakes.map((mistake, i) => (
                  <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="text-white flex-1">{mistake.questionText}...</p>
                      <div className="text-right shrink-0">
                        <div className="text-red-400 font-bold">
                          {mistake.timesWrong}/{mistake.timesAttempted} ошибок
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-gray-700 rounded">{mistake.topic}</span>
                      <span className="px-2 py-1 bg-gray-700 rounded">{mistake.subject}</span>
                      {mistake.commonWrongAnswer && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          Частый ответ: "{mistake.commonWrongAnswer}"
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
