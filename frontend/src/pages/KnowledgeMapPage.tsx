import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { ALL_SUBJECTS, getSubjectTopics } from '../data/theory';
import { TOPIC_RELATIONS } from '../data/topicRelations';
import { useTheoryProgress } from '../hooks/useTheoryProgress';
import api from '../services/api';

import type { SubjectKey, TheoryTopic } from '../data/theory/types';

interface TopicNodeData {
 id: string;
 title: string;
 accuracy: number;
 total: number;
 status: 'mastered' | 'learning' | 'weak' | 'untouched';
}

interface SelectedNode {
 topic: TheoryTopic;
 data: TopicNodeData;
}

const STATUS_COLORS = {
 mastered: { bg: '#22c55e', border: '#16a34a', text: 'Освоено' },
 learning: { bg: '#eab308', border: '#ca8a04', text: 'Изучается' },
 weak: { bg: '#ef4444', border: '#dc2626', text: 'Слабое' },
 untouched: { bg: '#9ca3af', border: '#6b7280', text: 'Не начато' },
};

export default function KnowledgeMapPage() {
 const navigate = useNavigate();
 const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('MATHEMATICS');
 const [topicData, setTopicData] = useState<Map<string, TopicNodeData>>(new Map());
 const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const { isStudied, toggleTopic } = useTheoryProgress();
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);

 // Node positions computed from topics
 const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
 const [canvasHeight, setCanvasHeight] = useState(500);

 // Pan (drag to scroll) state
 const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
 const isDragging = useRef(false);
 const hasDragged = useRef(false);
 const dragStart = useRef({ x: 0, y: 0 });
 const dragStartPan = useRef({ x: 0, y: 0 });

 const loadKnowledgeData = useCallback(async () => {
 setLoading(true);
 try {
 const response = await api.get('/users/knowledge-map');
 const serverTopics = response.data.data.topics as TopicNodeData[];
 const dataMap = new Map<string, TopicNodeData>();
 for (const t of serverTopics) {
 dataMap.set(t.id, t);
 }
 setTopicData(dataMap);
 } catch {
 // Use empty data if endpoint fails
 setTopicData(new Map());
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 void loadKnowledgeData();
 }, [loadKnowledgeData]);

 // Reset pan when subject changes
 useEffect(() => {
 setPanOffset({ x: 0, y: 0 });
 }, [selectedSubject]);

 // Compute positions for topics
 useEffect(() => {
 const topics = getSubjectTopics(selectedSubject);
 const positions = new Map<string, { x: number; y: number }>();

 const cols = Math.ceil(Math.sqrt(topics.length));
 const spacingX = 180;
 const spacingY = 140;
 const rows = Math.ceil(topics.length / cols);

 topics.forEach((topic, i) => {
 const col = i % cols;
 const row = Math.floor(i / cols);
 positions.set(topic.id, {
 x: 100 + col * spacingX + (row % 2 === 1 ? spacingX / 2 : 0),
 y: 80 + row * spacingY,
 });
 });

 // Dynamic height: top padding + rows * spacing + bottom padding for labels
 const neededHeight = 80 + (rows - 1) * spacingY + 80;
 setCanvasHeight(Math.max(neededHeight, 300));
 setNodePositions(positions);
 }, [selectedSubject]);

 // Pan handlers (mouse)
 const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
 isDragging.current = true;
 hasDragged.current = false;
 dragStart.current = { x: e.clientX, y: e.clientY };
 dragStartPan.current = { ...panOffset };
 (e.target as HTMLElement).setPointerCapture(e.pointerId);
 }, [panOffset]);

 const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
 if (!isDragging.current) return;
 const dx = e.clientX - dragStart.current.x;
 const dy = e.clientY - dragStart.current.y;
 if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
 hasDragged.current = true;
 }
 setPanOffset({
 x: dragStartPan.current.x + dx,
 y: dragStartPan.current.y + dy,
 });
 }, []);

 const handlePointerUp = useCallback(() => {
 isDragging.current = false;
 }, []);

 // Compute which topics match the search query
 const matchedTopicIds = useMemo<Set<string>>(() => {
 const q = searchQuery.trim().toLowerCase();
 if (!q) return new Set<string>();
 const topics = getSubjectTopics(selectedSubject);
 const matched = new Set<string>();
 for (const topic of topics) {
 const inTitle = topic.title.toLowerCase().includes(q);
 const inDesc = topic.description.toLowerCase().includes(q);
 const inKeywords = topic.keywords?.some(k => k.toLowerCase().includes(q)) ?? false;
 if (inTitle || inDesc || inKeywords) matched.add(topic.id);
 }
 return matched;
 }, [searchQuery, selectedSubject]);

 // Stable key for studied state — used as draw effect dependency
 const studiedKey = useMemo(() => {
   const topics = getSubjectTopics(selectedSubject);
   return topics.filter(t => isStudied(t.id)).map(t => t.id).join(',');
 }, [isStudied, selectedSubject]);

 // Draw the graph on canvas
 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 const container = containerRef.current;
 if (!container) return;

 const dpr = window.devicePixelRatio || 1;
 const rect = container.getBoundingClientRect();
 canvas.width = rect.width * dpr;
 canvas.height = rect.height * dpr;
 canvas.style.width = rect.width + 'px';
 canvas.style.height = rect.height + 'px';
 ctx.scale(dpr, dpr);

 const topics = getSubjectTopics(selectedSubject);
 const relations = TOPIC_RELATIONS[selectedSubject] || [];

 // Clear
 ctx.clearRect(0, 0, rect.width, rect.height);

 // Apply pan offset
 ctx.save();
 ctx.translate(panOffset.x, panOffset.y);

 // Draw edges
 ctx.strokeStyle = '#cbd5e1';
 ctx.lineWidth = 2;
 for (const rel of relations) {
 const fromPos = nodePositions.get(rel.from);
 const toPos = nodePositions.get(rel.to);
 if (fromPos && toPos) {
 ctx.beginPath();
 ctx.moveTo(fromPos.x, fromPos.y);
 ctx.lineTo(toPos.x, toPos.y);
 ctx.stroke();

 // Arrow head
 const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
 const headLen = 10;
 const nodeRadius = 30;
 const arrowX = toPos.x - Math.cos(angle) * nodeRadius;
 const arrowY = toPos.y - Math.sin(angle) * nodeRadius;

 ctx.beginPath();
 ctx.moveTo(arrowX, arrowY);
 ctx.lineTo(
 arrowX - headLen * Math.cos(angle - Math.PI / 6),
 arrowY - headLen * Math.sin(angle - Math.PI / 6)
 );
 ctx.moveTo(arrowX, arrowY);
 ctx.lineTo(
 arrowX - headLen * Math.cos(angle + Math.PI / 6),
 arrowY - headLen * Math.sin(angle + Math.PI / 6)
 );
 ctx.stroke();
 }
 }

 // Draw nodes
 const hasSearch = matchedTopicIds.size > 0 || searchQuery.trim().length > 0;
 for (const topic of topics) {
 const pos = nodePositions.get(topic.id);
 if (!pos) continue;

 const data = topicData.get(topic.id);
 const status = data?.status || 'untouched';
 const colors = STATUS_COLORS[status];
 const radius = 30 + Math.min((data?.total || 0) * 2, 15);
 const isMatch = matchedTopicIds.has(topic.id);

 // Dim non-matching nodes when search is active
 if (hasSearch && !isMatch) {
 ctx.globalAlpha = 0.2;
 } else {
 ctx.globalAlpha = 1;
 }

 // Glow ring for matching nodes
 if (isMatch) {
 ctx.shadowBlur = 20;
 ctx.shadowColor = '#6366f1';
 }

 // Node circle
 ctx.beginPath();
 ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
 ctx.fillStyle = colors.bg + '33';
 ctx.fill();
 ctx.strokeStyle = isMatch ? '#6366f1' : colors.border;
 ctx.lineWidth = isMatch ? 4 : 3;
 ctx.stroke();

 ctx.shadowBlur = 0;
 ctx.shadowColor = 'transparent';

 // Inner circle
 ctx.beginPath();
 ctx.arc(pos.x, pos.y, radius - 8, 0, Math.PI * 2);
 ctx.fillStyle = colors.bg;
 ctx.fill();

 // Accuracy text
 ctx.fillStyle = '#ffffff';
 ctx.font = 'bold 14px sans-serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(
 data ? `${data.accuracy}%` : '—',
 pos.x,
 pos.y
 );

 // Topic title below
 ctx.fillStyle = isMatch ? '#4338ca' : '#334155';
 ctx.font = isMatch ? 'bold 11px sans-serif' : '11px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText(topic.title, pos.x, pos.y + radius + 16, 160);

 // Studied checkmark badge (top-right of node)
 if (isStudied(topic.id)) {
   const cx = pos.x + radius * 0.65;
   const cy = pos.y - radius * 0.65;
   ctx.globalAlpha = 1;
   ctx.fillStyle = '#10b981';
   ctx.beginPath();
   ctx.arc(cx, cy, 8, 0, Math.PI * 2);
   ctx.fill();
   ctx.fillStyle = '#fff';
   ctx.font = 'bold 10px sans-serif';
   ctx.textAlign = 'center';
   ctx.textBaseline = 'middle';
   ctx.fillText('✓', cx, cy);
   ctx.textBaseline = 'alphabetic';
 }
 }

 ctx.globalAlpha = 1;
 ctx.restore();
 }, [selectedSubject, nodePositions, topicData, matchedTopicIds, searchQuery, panOffset, studiedKey, isStudied]);

 // Handle canvas click (ignore if it was a drag)
 const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
 if (hasDragged.current) return;

 const canvas = canvasRef.current;
 if (!canvas) return;

 const rect = canvas.getBoundingClientRect();
 // Account for pan offset
 const x = e.clientX - rect.left - panOffset.x;
 const y = e.clientY - rect.top - panOffset.y;

 const topics = getSubjectTopics(selectedSubject);

 for (const topic of topics) {
 const pos = nodePositions.get(topic.id);
 if (!pos) continue;

 const data = topicData.get(topic.id);
 const radius = 30 + Math.min((data?.total || 0) * 2, 15);
 const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);

 if (dist <= radius) {
 setSelectedNode({
 topic,
 data: data || {
 id: topic.id,
 title: topic.title,
 accuracy: 0,
 total: 0,
 status: 'untouched',
 },
 });
 return;
 }
 }

 setSelectedNode(null);
 }, [selectedSubject, nodePositions, topicData, panOffset]);

 const subjects = ALL_SUBJECTS;

 return (
 <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-6xl mx-auto">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <button
 onClick={() => void navigate('/dashboard')}
 className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 Назад
 </button>
 <h1 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>Карта знаний</h1>
 <div className="w-16" />
 </div>

 {/* Subject Tabs */}
 <div className="flex flex-wrap gap-2 mb-6">
 {subjects.map(s => (
 <button
 key={s.subject}
 onClick={() => { setSelectedSubject(s.subject); setSelectedNode(null); setSearchQuery(''); }}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
 selectedSubject === s.subject
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
 : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
 }`}
 >
 <span>{s.icon}</span>
 {s.label}
 </button>
 ))}
 </div>

 {/* Search */}
 <div className="relative mb-4">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="currentColor"
 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Поиск темы..."
 className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
 aria-label="Очистить поиск"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 {searchQuery.trim() && (
 <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-500">
 {matchedTopicIds.size > 0
 ? `${matchedTopicIds.size} ${matchedTopicIds.size === 1 ? 'тема' : matchedTopicIds.size < 5 ? 'темы' : 'тем'}`
 : 'Не найдено'}
 </div>
 )}
 </div>

 {/* Progress Summary */}
 {!loading && (() => {
 const topics = getSubjectTopics(selectedSubject);
 const counts = { mastered: 0, learning: 0, weak: 0, untouched: 0 };
 for (const t of topics) {
 const status = topicData.get(t.id)?.status ?? 'untouched';
 counts[status]++;
 }
 const total = topics.length;
 const doneCount = counts.mastered + counts.learning + counts.weak;
 const pct = total > 0 ? Math.round((counts.mastered / total) * 100) : 0;
 return (
 <div className="mb-4  border border-slate-200 rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-slate-700">Прогресс по предмету</span>
 <span className="text-sm font-bold text-indigo-600">{pct}% освоено</span>
 </div>
 {/* Stacked progress bar */}
 <div
 role="progressbar"
 aria-valuenow={pct}
 aria-valuemin={0}
 aria-valuemax={100}
 aria-label={`Освоено ${pct}% тем по предмету`}
 className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden mb-3"
 >
 {total > 0 && (
 <>
 <div style={{ width: `${(counts.mastered / total) * 100}%`, backgroundColor: '#22c55e' }} className="h-full" />
 <div style={{ width: `${(counts.learning / total) * 100}%`, backgroundColor: '#eab308' }} className="h-full" />
 <div style={{ width: `${(counts.weak / total) * 100}%`, backgroundColor: '#ef4444' }} className="h-full" />
 </>
 )}
 </div>
 <div className="flex flex-wrap gap-3">
 {Object.entries(STATUS_COLORS).map(([key, val]) => (
 <div key={key} className="flex items-center gap-1.5">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.bg }} />
 <span className="text-xs text-slate-600">{val.text}: <span className="font-semibold text-slate-800">{counts[key as keyof typeof counts]}</span></span>
 </div>
 ))}
 <div className="ml-auto text-xs text-slate-400">{doneCount}/{total} начато</div>
 </div>
 </div>
 );
 })()}

 {/* Graph Area */}
 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative" style={{ maxHeight: '70vh' }}>
 {loading ? (
 <div className="flex items-center justify-center py-20">
 <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
 </div>
 ) : (
 <div
 ref={containerRef}
 className="relative select-none"
 style={{
 height: `${Math.min(canvasHeight, window.innerHeight * 0.65)}px`,
 minHeight: '300px',
 cursor: isDragging.current ? 'grabbing' : 'grab',
 }}
 >
 <canvas
 ref={canvasRef}
 onClick={handleCanvasClick}
 onPointerDown={handlePointerDown}
 onPointerMove={handlePointerMove}
 onPointerUp={handlePointerUp}
 onPointerCancel={handlePointerUp}
 className="w-full h-full touch-none"
 />
 </div>
 )}
 {/* Pan hint */}
 <div className="absolute bottom-3 right-3 bg-slate-800/70 text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none">
 Перетаскивайте для перемещения
 </div>
 </div>

 {/* Selected Node Popup */}
 {selectedNode && (
 <div className="mt-4  border border-slate-200 rounded-2xl p-6 shadow-sm animate-scale-in" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div className="flex items-start justify-between mb-4">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className="text-2xl">{selectedNode.topic.icon}</span>
 <h3 className="text-xl font-bold " style={{ color: 'var(--color-text)' }}>{selectedNode.topic.title}</h3>
 </div>
 <p className="text-slate-600">{selectedNode.topic.description}</p>
 </div>
 <button
 onClick={() => setSelectedNode(null)}
 className="text-slate-400 hover:text-slate-600"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <div className="grid grid-cols-3 gap-4 mb-4">
 <div className="bg-slate-50 rounded-xl p-3 text-center">
 <div className="text-2xl font-bold" style={{ color: STATUS_COLORS[selectedNode.data.status].bg }}>
 {selectedNode.data.accuracy}%
 </div>
 <div className="text-xs text-slate-500">Точность</div>
 </div>
 <div className="bg-slate-50 rounded-xl p-3 text-center">
 <div className="text-2xl font-bold text-slate-700">{selectedNode.data.total}</div>
 <div className="text-xs text-slate-500">Попыток</div>
 </div>
 <div className="bg-slate-50 rounded-xl p-3 text-center">
 <div className="text-sm font-medium px-2 py-1 rounded-full" style={{
 backgroundColor: STATUS_COLORS[selectedNode.data.status].bg + '20',
 color: STATUS_COLORS[selectedNode.data.status].border,
 }}>
 {STATUS_COLORS[selectedNode.data.status].text}
 </div>
 <div className="text-xs text-slate-500 mt-1">Статус</div>
 </div>
 </div>

 {/* Studied toggle */}
 <div className="mb-4">
 <button
 onClick={() => toggleTopic(selectedNode.topic.id)}
 className={`w-full py-2 rounded-xl text-sm font-medium transition-colors border ${
 isStudied(selectedNode.topic.id)
 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
 : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
 }`}
 >
 {isStudied(selectedNode.topic.id) ? '✓ Изучено' : '○ Отметить как изученное'}
 </button>
 </div>

 <div className="flex gap-3">
 <button
 onClick={() => void navigate(`/theory/${selectedSubject}/${selectedNode.topic.id}`)}
 className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors border border-indigo-200"
 >
 Теория
 </button>
 <button
 onClick={() => void navigate(`/practice/topic/${selectedSubject.toLowerCase()}/${selectedNode.topic.id}`)}
 className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
 >
 Практика
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
