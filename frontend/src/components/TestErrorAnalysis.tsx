import type { ErrorAnalysisResult } from '../data/topicAdvice';

interface TestErrorAnalysisProps {
  analysis: ErrorAnalysisResult;
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const barColor =
    accuracy < 50
      ? 'bg-gradient-to-r from-red-500 to-red-400'
      : accuracy < 70
        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
        : 'bg-gradient-to-r from-blue-500 to-blue-400';

  return (
    <div
      role="progressbar"
      aria-valuenow={accuracy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Точность: ${accuracy}%`}
      className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${accuracy}%` }}
      />
    </div>
  );
}

export default function TestErrorAnalysis({ analysis }: TestErrorAnalysisProps) {
  const { topicGroups, strongTopics } = analysis;

  if (topicGroups.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Отличный результат!</h3>
        <p className="text-green-700">
          Вы ответили правильно на все вопросы. Так держать!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Анализ ошибок</h2>
          <p className="text-sm text-slate-500">
            {topicGroups.length}{' '}
            {topicGroups.length === 1 ? 'тема требует' : topicGroups.length < 5 ? 'темы требуют' : 'тем требуют'}{' '}
            внимания
          </p>
        </div>
      </div>

      {/* Topic error cards */}
      <div className="space-y-4">
        {topicGroups.map((group) => {
          const wrongCount = group.totalInTopic - group.correctInTopic;

          return (
            <div
              key={group.topicName}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg"
            >
              {/* Topic header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-slate-900">{group.topicName}</h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    group.accuracy < 50
                      ? 'bg-red-100 text-red-700'
                      : group.accuracy < 70
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {group.accuracy}%
                </span>
              </div>

              {/* Accuracy bar */}
              <AccuracyBar accuracy={group.accuracy} />

              {/* Error count */}
              <div className="mt-3 text-sm text-slate-600">
                <span className="text-red-600 font-medium">{wrongCount}</span> из{' '}
                {group.totalInTopic}{' '}
                {wrongCount === 1 ? 'неверный' : wrongCount < 5 ? 'неверных' : 'неверных'}
                <span className="mx-2 text-slate-300">|</span>
                Задания:{' '}
                {group.wrongQuestions.map((q, i) => (
                  <span key={q.number}>
                    {i > 0 && ', '}
                    <span className="text-red-600 font-medium">#{q.number}</span>
                  </span>
                ))}
              </div>

              {/* Advice */}
              <div className="mt-4 bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Рекомендации
                </div>
                <ul className="space-y-1.5">
                  {group.advice.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strong topics */}
      {strongTopics.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💪</span>
            <h3 className="font-semibold text-green-800">Сильные стороны</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {strongTopics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
