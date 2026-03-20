import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Header } from '../components/Header';
import { DifficultyBadge, SectionContent, TopicCard, SubjectTabs } from '../components/theory';
import { ALL_SUBJECTS, getSubjectByKey } from '../data/theory';
import { useTheoryProgress } from '../hooks/useTheoryProgress';
import type { TheoryTopic, SubjectKey } from '../data/theory/types';

interface SearchResult {
 topic: TheoryTopic;
 subject: SubjectKey;
 subjectLabel: string;
 subjectIcon: string;
 matchedIn: 'title' | 'description' | 'section';
}

const TheoryPage: React.FC = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const initialSubject = (searchParams.get('subject') as SubjectKey) || 'MATHEMATICS';

 const [activeSubject, setActiveSubject] = useState<SubjectKey>(
 ALL_SUBJECTS.some(s => s.subject === initialSubject) ? initialSubject : 'MATHEMATICS',
 );
 const [selectedTopic, setSelectedTopic] = useState<TheoryTopic | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const { toggleTopic, isStudied, getProgress } = useTheoryProgress();

 const subjectData = getSubjectByKey(activeSubject);
 const topics = subjectData?.topics ?? [];
 const progress = getProgress(topics.map(t => t.id));

 // Global search across all subjects (title, description, section titles + content)
 const globalResults = useMemo<SearchResult[] | null>(() => {
 const q = searchQuery.trim().toLowerCase();
 if (!q) return null;
 const results: SearchResult[] = [];
 for (const subj of ALL_SUBJECTS) {
 for (const topic of subj.topics) {
 if (topic.title.toLowerCase().includes(q)) {
 results.push({ topic, subject: subj.subject, subjectLabel: subj.label, subjectIcon: subj.icon, matchedIn: 'title' });
 continue;
 }
 if (topic.description.toLowerCase().includes(q)) {
 results.push({ topic, subject: subj.subject, subjectLabel: subj.label, subjectIcon: subj.icon, matchedIn: 'description' });
 continue;
 }
 const sectionMatch = topic.sections.some(
 s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) ||
 s.formulas?.some(f => f.toLowerCase().includes(q)) ||
 s.tips?.some(t => t.toLowerCase().includes(q))
 );
 if (sectionMatch) {
 results.push({ topic, subject: subj.subject, subjectLabel: subj.label, subjectIcon: subj.icon, matchedIn: 'section' });
 }
 }
 }
 return results;
 }, [searchQuery]);

 // Per-subject filtered topics (used when no global search)
 const filteredTopics = useMemo(
 () =>
 topics.filter(
 topic =>
 topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 topic.description.toLowerCase().includes(searchQuery.toLowerCase()),
 ),
 [topics, searchQuery],
 );

 const handleSubjectChange = (subject: SubjectKey) => {
 setActiveSubject(subject);
 setSelectedTopic(null);
 setSearchQuery('');
 setSearchParams({ subject });
 };

 const handleSelectResult = (result: SearchResult) => {
 setActiveSubject(result.subject);
 setSelectedTopic(result.topic);
 setSearchQuery('');
 setSearchParams({ subject: result.subject });
 };

 const isSearching = searchQuery.trim().length > 0;

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />

 <main className="max-w-6xl mx-auto px-4 py-8">
 {}
 <div className="mb-8">
 <Link
 to="/dashboard"
 className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block"
 >
 &larr; Назад к дашборду
 </Link>
 <h1 className="text-3xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>
 Справочник теории
 </h1>
 <p className="text-slate-500">
 Изучайте теорию по предметам и темам перед решением задач
 </p>
 </div>

 {}
 <div className="relative mb-6">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
 <input
 type="text"
 placeholder="Поиск по всем предметам — темы, формулы, содержание..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
 />
 {isSearching && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
 aria-label="Очистить поиск"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {}
 {isSearching && globalResults !== null ? (
 <div>
 <p className="text-sm text-slate-500 mb-4">
 {globalResults.length > 0
 ? `Найдено ${globalResults.length} ${globalResults.length === 1 ? 'тема' : globalResults.length < 5 ? 'темы' : 'тем'} по всем предметам`
 : 'Ничего не найдено'}
 </p>

 {globalResults.length === 0 ? (
 <div className="text-center py-16">
 <p className="text-4xl mb-3">🔍</p>
 <p className="text-lg font-medium text-slate-700">Ничего не найдено</p>
 <p className="text-sm text-slate-400 mt-1">Попробуйте другой запрос</p>
 </div>
 ) : (
 <div className="grid md:grid-cols-2 gap-4">
 {globalResults.map(result => (
 <motion.div
 key={`${result.subject}-${result.topic.id}`}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => handleSelectResult(result)}
 className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md p-5 cursor-pointer hover:border-blue-500/50 transition-all"
 >
 <div className="flex items-start gap-4">
 <div className="text-4xl">{result.topic.icon}</div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-1">
 <h3 className="text-base font-semibold " style={{ color: 'var(--color-text)' }}>{result.topic.title}</h3>
 <DifficultyBadge difficulty={result.topic.difficulty} />
 </div>
 <p className="text-slate-500 text-sm mb-2 line-clamp-2">{result.topic.description}</p>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
 {result.subjectIcon} {result.subjectLabel}
 </span>
 {result.matchedIn === 'section' && (
 <span className="text-xs text-slate-400">найдено в содержании</span>
 )}
 <span className="text-xs text-slate-400 ml-auto">⏱ {result.topic.estimatedTime} мин</span>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 ) : (
 <>
 {}
 <SubjectTabs activeSubject={activeSubject} onChange={handleSubjectChange} />

 {/* Progress bar */}
 {progress.total > 0 && (
 <div className="mb-4 flex items-center gap-3">
 <div
 role="progressbar"
 aria-valuenow={Math.round((progress.studied / progress.total) * 100)}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Изучено ${progress.studied} из ${progress.total} тем`}
 className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"
 >
 <div
 className="h-full bg-emerald-500 rounded-full transition-all duration-500"
 style={{ width: `${Math.round((progress.studied / progress.total) * 100)}%` }}
 />
 </div>
 <span className="text-xs text-slate-500 shrink-0 w-28 text-right">
 {progress.studied} / {progress.total} изучено
 </span>
 </div>
 )}

 <AnimatePresence mode="wait">
 {selectedTopic ? (
 <motion.div
 key="detail"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 >
 <button
 onClick={() => setSelectedTopic(null)}
 className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1"
 >
 &larr; Назад к списку тем
 </button>

 <div className=" border border-slate-200 rounded-2xl shadow-lg p-6 mb-6" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center gap-4 mb-4">
 <span className="text-5xl">{selectedTopic.icon}</span>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>
 {selectedTopic.title}
 </h2>
 <DifficultyBadge difficulty={selectedTopic.difficulty} />
 </div>
 <p className="text-slate-500">{selectedTopic.description}</p>
 </div>
 </div>

 <div className="flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-6 text-sm text-slate-500">
 <span>Время изучения: ~{selectedTopic.estimatedTime} мин</span>
 <span>Задания: {selectedTopic.tasks.join(', ')}</span>
 <span>Разделов: {selectedTopic.sections.length}</span>
 </div>
 <button
 onClick={() => toggleTopic(selectedTopic.id)}
 className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
 isStudied(selectedTopic.id)
 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
 : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
 }`}
 >
 {isStudied(selectedTopic.id) ? (
 <>
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
 </svg>
 Изучено
 </>
 ) : (
 <>
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 Отметить как изученное
 </>
 )}
 </button>
 </div>
 </div>

 {}
 <div className="space-y-4">
 {selectedTopic.sections.map(section => (
 <SectionContent key={section.id} section={section} />
 ))}
 </div>

 {}
 <div className="mt-8 text-center">
 <Link
 to={`/test/setup/${activeSubject}`}
 className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-colors"
 >
 Перейти к практике &rarr;
 </Link>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key={`list-${activeSubject}`}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="grid md:grid-cols-2 gap-4"
 >
 {filteredTopics.map(topic => (
 <TopicCard
 key={topic.id}
 topic={topic}
 onClick={() => setSelectedTopic(topic)}
 isStudied={isStudied(topic.id)}
 />
 ))}
 </motion.div>
 )}
 </AnimatePresence>

 {filteredTopics.length === 0 && !selectedTopic && (
 <div className="text-center text-slate-400 py-12">Темы не найдены</div>
 )}
 </>
 )}
 </main>
 </div>
 );
};

export default TheoryPage;
