import { useNavigate, useParams } from 'react-router-dom';

import { DifficultyBadge } from '../components/theory/DifficultyBadge';
import { SectionContent } from '../components/theory/SectionContent';
import { ALL_SUBJECTS, getSubjectByKey, getSubjectTopics } from '../data/theory';
import { useTheoryProgress } from '../hooks/useTheoryProgress';

import type { SubjectKey } from '../data/theory/types';

export default function TheoryTopicPage() {
  const { subject, topicId } = useParams<{ subject: string; topicId: string }>();
  const navigate = useNavigate();
  const { isStudied, toggleTopic } = useTheoryProgress();

  const subjectKey = subject as SubjectKey;
  const isValidSubject = ALL_SUBJECTS.some(s => s.subject === subjectKey);

  if (!isValidSubject) {
    void navigate('/theory');
    return null;
  }

  const topics = getSubjectTopics(subjectKey);
  const topicIndex = topics.findIndex(t => t.id === topicId);
  const topic = topicIndex !== -1 ? topics[topicIndex] : null;

  if (!topic) {
    void navigate('/theory');
    return null;
  }

  const prevTopic = topicIndex > 0 ? topics[topicIndex - 1] : null;
  const nextTopic = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null;
  const subjectInfo = getSubjectByKey(subjectKey);
  const studied = isStudied(topic.id);

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container-wide">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => void navigate('/theory')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Назад к теории
          </button>
          {subjectInfo && (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              <span>{subjectInfo.icon}</span>
              <span>{subjectInfo.label}</span>
            </div>
          )}
        </div>

        {/* Topic header */}
        <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{topic.icon}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                {topic.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <DifficultyBadge difficulty={topic.difficulty} />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  ⏱ {topic.estimatedTime} мин
                </span>
              </div>
              {topic.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {topic.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleTopic(topic.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              studied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {studied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Изучено
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                Отметить как изученное
              </>
            )}
          </button>
        </div>

        {/* Sections */}
        <div className="mb-8">
          {topic.sections.map(section => (
            <SectionContent key={section.id} section={section} />
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex-1">
            {prevTopic && (
              <button
                onClick={() => void navigate(`/theory/${subjectKey}/${prevTopic.id}`)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="truncate max-w-[200px]">{prevTopic.title}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => void navigate(`/practice/topic/${subjectKey.toLowerCase()}/${topic.id}`)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0"
          >
            Практика →
          </button>

          <div className="flex-1 flex justify-end">
            {nextTopic && (
              <button
                onClick={() => void navigate(`/theory/${subjectKey}/${nextTopic.id}`)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
              >
                <span className="truncate max-w-[200px]">{nextTopic.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
