import DOMPurify from 'dompurify';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../components/Button';
import TestErrorAnalysis from '../components/TestErrorAnalysis';
import CoordinateLine from '../components/sdamgia/CoordinateLine';
import type { MarkedPoint } from '../components/sdamgia/CoordinateLine';
import TwoPartInput from '../components/sdamgia/TwoPartInput';
import { TheoryDrawer } from '../components/theory';
import { analyzeTestErrors } from '../data/topicAdvice';
import { findTheoryForTask } from '../data/theory/theoryLookup';
import type { TheoryTopic } from '../data/theory/types';
import api from '../services/api';
import { sdamgiaService } from '../services/sdamgiaService';

import type { AnalyzedQuestion } from '../data/topicAdvice';
import type { SdamgiaProblem } from '../services/sdamgiaService';

type SdamgiaInputType = 'coordinate_line' | 'two_part' | 'text';

const SDAMGIA_SUBJECT_MAP: Record<string, string> = {
 bio: 'BIOLOGY',
 math: 'MATHEMATICS',
 mathb: 'MATHEMATICS',
 rus: 'RUSSIAN',
 phys: 'PHYSICS',
 inf: 'INFORMATICS',
 chem: 'CHEMISTRY',
 hist: 'HISTORY',
 en: 'ENGLISH',
 geo: 'GEOGRAPHY',
 soc: 'SOCIAL_STUDIES',
 lit: 'LITERATURE',
 BIOLOGY: 'BIOLOGY',
 MATHEMATICS: 'MATHEMATICS',
 RUSSIAN: 'RUSSIAN',
 PHYSICS: 'PHYSICS',
 INFORMATICS: 'INFORMATICS',
 CHEMISTRY: 'CHEMISTRY',
 HISTORY: 'HISTORY',
 ENGLISH: 'ENGLISH',
 SOCIAL: 'SOCIAL_STUDIES',
 SOCIAL_STUDIES: 'SOCIAL_STUDIES',
 GEOGRAPHY: 'GEOGRAPHY',
};

function getSdamgiaInputType(
 problem: SdamgiaProblem,
 examType: string,
 grade?: number
): SdamgiaInputType {
 if (examType?.toUpperCase() !== 'VPR' || grade !== 8) return 'text';

 const answer = problem.answer?.trim() || '';
 if (/^[A-ZА-ЯЁa-zа-яё]$/i.test(answer)) return 'text';

 if (problem.number === 4 || problem.number === 6) return 'coordinate_line';
 if (problem.number === 14) return 'two_part';
 return 'text';
}

function isSelfCheckTask(problem: SdamgiaProblem, subject?: string, examType?: string): boolean {
 const normalizedSubject = (subject && SDAMGIA_SUBJECT_MAP[subject]) || subject?.toUpperCase();
 return normalizedSubject === 'INFORMATICS'
   && examType?.toUpperCase() === 'OGE'
   && problem.number >= 11;
}

function getCoordinateRange(problem: SdamgiaProblem): [number, number] {
 const answer = parseFloat(problem.answer?.replace(',', '.') || '');
 let min = -5;
 let max = 7;
 if (!isNaN(answer)) {
 min = Math.min(min, Math.floor(answer) - 2);
 max = Math.max(max, Math.ceil(answer) + 2);
 }
 const points = parseReferencePoints(problem.question);
 for (const pt of points) {
 min = Math.min(min, Math.floor(pt.value) - 1);
 max = Math.max(max, Math.ceil(pt.value) + 1);
 }
 return [min, max];
}

function decodeHtmlEntities(html: string): string {
 return html
 .replace(/&nbsp;/gi, ' ')
 .replace(/&minus;/gi, '−')
 .replace(/&ndash;/gi, '–')
 .replace(/&mdash;/gi, '—')
 .replace(/&frasl;/gi, '/')
 .replace(/&lt;/gi, '<')
 .replace(/&gt;/gi, '>')
 .replace(/&le;/gi, '≤')
 .replace(/&ge;/gi, '≥')
 .replace(/&times;/gi, '×')
 .replace(/&divide;/gi, '÷')
 .replace(/&radic;/gi, '√')
 .replace(/&pi;/gi, 'π')
 .replace(/&amp;/gi, '&')
 .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
 .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex as string, 16)));
}

function parseCoordinateValue(raw: string): number | null {
 const s = raw.replace(/[−–—‐‑]/g, '-').replace(/\s+/g, '').replace(',', '.');
 if (!s) return null;

 const simple = parseFloat(s);
 if (!isNaN(simple) && isFinite(simple)) return simple;

 const fracMatch = s.match(/^(-?\d+(?:\.\d+)?)\s*[\/⁄]\s*(-?\d+(?:\.\d+)?)$/);
 if (fracMatch) {
 const num = parseFloat(fracMatch[1]!);
 const den = parseFloat(fracMatch[2]!);
 if (!isNaN(num) && !isNaN(den) && den !== 0) {
 return Math.round((num / den) * 100) / 100;
 }
 }

 const sqrtMatch = s.match(/^(-?)√\(?(\d+(?:\.\d+)?)\)?$/);
 if (sqrtMatch) {
 const sign = sqrtMatch[1] === '-' ? -1 : 1;
 const val = parseFloat(sqrtMatch[2]!);
 if (!isNaN(val)) return Math.round(sign * Math.sqrt(val) * 100) / 100;
 }

 const piMatch = s.match(/^(-?\d*(?:\.\d+)?)?π(?:\s*[\/⁄]\s*(\d+(?:\.\d+)?))?$/);
 if (piMatch) {
 const coeff = piMatch[1] ? parseFloat(piMatch[1]) : (s.startsWith('-') ? -1 : 1);
 const denom = piMatch[2] ? parseFloat(piMatch[2]) : 1;
 if (!isNaN(coeff) && denom !== 0) return Math.round((coeff * Math.PI / denom) * 100) / 100;
 }

 return null;
}

function parseReferencePoints(html: string): { value: number; label: string }[] {
 const decoded = decodeHtmlEntities(html);
 const text = decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
 const points: { value: number; label: string }[] = [];
 const seen = new Set<string>();

 const addPoint = (label: string, rawValue: string) => {
 const key = label.toUpperCase();
 if (seen.has(key)) return;
 const val = parseCoordinateValue(rawValue);
 if (val !== null) {
 points.push({ value: val, label: key });
 seen.add(key);
 }
 };

 const V = '([−–\\-]?\\s*(?:\\d+(?:[,.]\\d+)?(?:\\s*[/⁄]\\s*\\d+)?|√\\(?\\d+(?:\\.\\d+)?\\)?|\\d*π(?:\\s*[/⁄]\\s*\\d+)?))';
 const L = '([A-ZА-ЯЁa-zа-яё])';

 let match: RegExpExecArray | null;

 const p1 = new RegExp(L + '\\s*\\(\\s*' + V + '\\s*\\)', 'gi');
 while ((match = p1.exec(text)) !== null) {
 addPoint(match[1]!, match[2]!);
 }

 const p2 = new RegExp('(?:точк[аеи]\\s+)?' + L + '\\s*=\\s*' + V, 'gi');
 while ((match = p2.exec(text)) !== null) {
 addPoint(match[1]!, match[2]!);
 }

 const p3 = new RegExp('точк[аеи]\\s+' + L + '\\s+соответствует\\s+числ[уао]\\s+' + V, 'gi');
 while ((match = p3.exec(text)) !== null) {
 addPoint(match[1]!, match[2]!);
 }

 const p4 = new RegExp('числ[уао]\\s+' + V + '\\s+соответствует\\s+точк[аеи]\\s+' + L, 'gi');
 while ((match = p4.exec(text)) !== null) {
 addPoint(match[2]!, match[1]!);
 }

 const p5 = new RegExp(L + '\\s+равн[оа]\\s+' + V, 'gi');
 while ((match = p5.exec(text)) !== null) {
 addPoint(match[1]!, match[2]!);
 }

 const p6 = new RegExp('точк[аеи]\\s+' + L + '\\s*[,.]?\\s*(?:с\\s+координат(?:ой|ами)|имеющ[аяие]+\\s+координат[уыа])\\s+' + V, 'gi');
 while ((match = p6.exec(text)) !== null) {
 addPoint(match[1]!, match[2]!);
 }

 const p7 = new RegExp(L + '\\s*[:\\—–]\\s*' + V, 'gi');
 while ((match = p7.exec(text)) !== null) {
 const idx = match.index;
 const before = idx > 0 ? text[idx - 1] : ' ';
 if (before === ' ' || before === '(' || before === ',') {
 addPoint(match[1]!, match[2]!);
 }
 }

 return points;
}

function unicodeNormalize(s: string): string {
 return s
 .replace(/[−–—‐‑⁻₋﹣－]/g, '-')
 .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
 .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
}

function tryParseNumber(s: string): number | null {
 const cleaned = unicodeNormalize(s).trim().replace(/,/g, '.').replace(/\s+/g, '');
 if (!cleaned) return null;

 const fractionMatch = cleaned.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
 if (fractionMatch) {
 const num = parseFloat(fractionMatch[1]!);
 const den = parseFloat(fractionMatch[2]!);
 if (!isNaN(num) && !isNaN(den) && den !== 0) {
 return num / den;
 }
 }

 const num = parseFloat(cleaned);
 if (!isNaN(num) && isFinite(num)) {
 return num;
 }

 return null;
}

function smartCompareAnswers(userAnswer: string, correctAnswer: string, tolerance: number = 0.01): boolean {
 const userTrimmed = userAnswer.trim();
 const correctTrimmed = correctAnswer.trim();
 if (!userTrimmed || !correctTrimmed) return false;

 // Decode HTML entities in correct answer (sdamgia may return them)
 const decodedCorrect = decodeHtmlEntities(correctTrimmed);

 const normUser = unicodeNormalize(userTrimmed).toLowerCase().replace(/\s+/g, '');
 const normCorrect = unicodeNormalize(decodedCorrect).toLowerCase().replace(/\s+/g, '');

 // Direct match
 if (normUser === normCorrect) return true;

 // Replace commas with dots (decimal separator)
 const dotUser = normUser.replace(/,/g, '.');
 const dotCorrect = normCorrect.replace(/,/g, '.');
 if (dotUser === dotCorrect) return true;

 // Remove commas entirely (thousands separator or list separator)
 const noCommaUser = normUser.replace(/,/g, '');
 const noCommaCorrect = normCorrect.replace(/,/g, '');
 if (noCommaUser === noCommaCorrect) return true;

 // Strip HTML tags from answer (in case sdamgia returns tags)
 const stripTags = (s: string) => s.replace(/<[^>]*>/g, '').trim();
 const strippedCorrect = stripTags(normCorrect);
 if (normUser === strippedCorrect) return true;

 // Numeric comparison with tolerance
 const userNum = tryParseNumber(userTrimmed);
 const correctNum = tryParseNumber(decodedCorrect);
 if (userNum !== null && correctNum !== null) {
 return Math.abs(userNum - correctNum) <= tolerance;
 }

 // Set-selection comparison: for 2-digit answers like "24"/"42" (выберите два ответа)
 // Only for 2 digits — for 3+ digits order matters (matching/ordering tasks)
 if (/^\d+$/.test(normUser) && /^\d+$/.test(normCorrect) && normUser.length === 2 && normCorrect.length === 2) {
 const sortedUser = normUser.split('').sort().join('');
 const sortedCorrect = normCorrect.split('').sort().join('');
 if (sortedUser === sortedCorrect) return true;
 }

 // Handle answers separated by semicolons, pipes, or spaces (multi-part)
 const splitAnswer = (s: string) => s.split(/[;|]/).map(p => p.trim()).filter(Boolean);
 const userParts = splitAnswer(normUser);
 const correctParts = splitAnswer(normCorrect);
 if (userParts.length > 1 && correctParts.length > 1 && userParts.length === correctParts.length) {
 const allMatch = correctParts.every((cp, i) =>
 smartCompareAnswers(userParts[i] || '', cp, tolerance)
 );
 if (allMatch) return true;
 }

 return false;
}

function pluralize(n: number, one: string, few: string, many: string): string {
 const abs = Math.abs(n) % 100;
 const lastDigit = abs % 10;
 if (abs >= 11 && abs <= 19) return many;
 if (lastDigit === 1) return one;
 if (lastDigit >= 2 && lastDigit <= 4) return few;
 return many;
}

const SDAMGIA_STYLES = `
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
 color: #2563eb;
 }
 .sdamgia-content .pbody {
 background: rgba(241,245,249,0.5);
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
`;

export default function SdamgiaTestPage() {
 const navigate = useNavigate();
 const location = useLocation();
 const { variantId, subject, examType, grade } = location.state || {};

 const [problems, setProblems] = useState<SdamgiaProblem[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [currentIndex, setCurrentIndex] = useState(0);
 const [answers, setAnswers] = useState<Record<string, string>>({});
 const [showResults, setShowResults] = useState(false);
 const [reviewMode, setReviewMode] = useState(false);
 const [showFinishModal, setShowFinishModal] = useState(false);
 const [showExitModal, setShowExitModal] = useState(false);
 const [aiPoints, setAiPoints] = useState<Record<string, { points: MarkedPoint[]; range: [number, number] }>>({});
 const fetchedAiProblems = useRef<Set<string>>(new Set());
 const [theoryTopic, setTheoryTopic] = useState<TheoryTopic | null>(null);
 const [selfGrades, setSelfGrades] = useState<Record<string, number>>({});
 const [showSelfCheck, setShowSelfCheck] = useState(false);

 const storageKey = variantId ? `sdamgia_answers_${variantId}` : null;

 const loadVariant = useCallback(async (signal?: AbortSignal) => {
 if (!variantId || !subject || !examType) return;
 try {
 setLoading(true);
 setLoadError(null);
 const variant = await sdamgiaService.getVariant(variantId, subject, examType, grade);
 if (signal?.aborted) return;
 setProblems(variant.problems);
 } catch {
 if (signal?.aborted) return;
 setLoadError('Ошибка загрузки варианта. Проверьте подключение к интернету.');
 } finally {
 if (!signal?.aborted) setLoading(false);
 }
 }, [variantId, subject, examType, grade]);

 useEffect(() => {
 if (!variantId || !subject || !examType) {
 toast.error('Неверные параметры теста');
 void navigate('/dashboard');
 return;
 }

 // Skip re-fetch if variant is already loaded
 if (problems.length > 0) return;

 const controller = new AbortController();
 void loadVariant(controller.signal);
 return () => controller.abort();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [variantId, subject, examType, grade, navigate, loadVariant]);

 useEffect(() => {
 if (!storageKey) return;
 try {
 const saved = localStorage.getItem(storageKey);
 if (saved) {
 const parsed = JSON.parse(saved) as Record<string, string>;
 if (parsed && typeof parsed === 'object') {
 setAnswers(parsed);
 }
 }
 } catch {
 }
 }, [storageKey]);

 useEffect(() => {
 if (!storageKey || Object.keys(answers).length === 0) return;
 try {
 localStorage.setItem(storageKey, JSON.stringify(answers));
 } catch {
 }
 }, [answers, storageKey]);

 const fetchAiPoints = useCallback(async (problem: SdamgiaProblem) => {
 if (fetchedAiProblems.current.has(problem.id) || !problem.images || problem.images.length === 0) return;
 fetchedAiProblems.current.add(problem.id);

 try {
 const response = await api.post('/image-analysis/coordinate-points', {
 imageUrl: problem.images[0],
 questionText: problem.question,
 });

 if (response.data?.success && Array.isArray(response.data.points)) {
 setAiPoints(prev => ({
 ...prev,
 [problem.id]: {
 points: response.data.points.map((p: { label: string; value: number }) => ({
 label: p.label,
 value: p.value,
 })),
 range: response.data.range || [-5, 7],
 },
 }));
 }
 } catch {
 }
 }, []);

 useEffect(() => {
 const problem = problems[currentIndex];
 if (!problem) return;
 const type = getSdamgiaInputType(problem, examType as string, grade as number | undefined);
 if (type === 'coordinate_line') {
 void fetchAiPoints(problem);
 }
 }, [currentIndex, problems, examType, grade, fetchAiPoints]);

 const handleAnswer = (value: string) => {
 const currentProblem = problems[currentIndex];
 if (!currentProblem) return;
 setAnswers(prev => ({
 ...prev,
 [currentProblem.id]: value,
 }));
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

 const handleFinishRequest = () => {
 const answeredCount = Object.keys(answers).length;
 const autoProblemsCount = problems.filter(p => !isSelfCheckTask(p, subject as string, examType as string)).length;
 if (answeredCount < autoProblemsCount) {
 setShowFinishModal(true);
 return;
 }
 confirmFinish();
 };

 const hasSelfCheckTasks = problems.some(p => isSelfCheckTask(p, subject as string, examType as string));

 const submitResults = () => {
 const { correct, total, selfCheckEarned } = calculateScore();
 const totalCorrect = correct + selfCheckEarned;
 const score = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

 void api.post('/tests/submit-result', {
 subject: SDAMGIA_SUBJECT_MAP[subject as string] || (subject as string)?.toUpperCase() || 'MATHEMATICS',
 examType: (examType as string)?.toUpperCase() || 'OGE',
 score,
 totalQuestions: total,
 correctCount: totalCorrect,
 title: `СДАМ ГИА - Вариант ${variantId}`,
 }).catch(() => {
 });
 };

 const confirmFinish = () => {
 setShowFinishModal(false);
 submitResults();
 if (storageKey) localStorage.removeItem(storageKey);
 setShowResults(true);
 window.scrollTo(0, 0);
 };

 const handleExitRequest = () => {
 if (Object.keys(answers).length > 0) {
 setShowExitModal(true);
 } else {
 void navigate('/dashboard');
 }
 };

 const confirmExit = () => {
 setShowExitModal(false);
 if (storageKey) localStorage.removeItem(storageKey);
 void navigate('/dashboard');
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 if (currentIndex < problems.length - 1) {
 handleNext();
 }
 }
 };

 const checkProblemAnswer = (problem: SdamgiaProblem, userAnswerRaw: string): boolean => {
 const userAnswer = userAnswerRaw.trim();
 const correctAnswer = problem.answer?.trim() || '';
 if (!userAnswer || !correctAnswer) return false;

 const inputType = getSdamgiaInputType(problem, examType as string, grade as number | undefined);

 switch (inputType) {
 case 'coordinate_line':
 return smartCompareAnswers(userAnswer, correctAnswer, 0.5);
 case 'two_part': {
 const userParts = userAnswer.split(';').map(s => s.trim());
 let correctParts = correctAnswer.split(';').map(s => s.trim());
 if (correctParts.length === 1 && correctAnswer.includes(' ')) {
 correctParts = correctAnswer.split(/\s+/).map(s => s.trim()).filter(Boolean);
 }
 if (correctParts.length === 1) {
 const combined = userParts.join('').trim();
 return smartCompareAnswers(combined, correctParts[0]!, 0.01);
 }
 if (userParts.length < correctParts.length) return false;
 return correctParts.every((cp, i) =>
 smartCompareAnswers(userParts[i] || '', cp, 0.01)
 );
 }
 default:
 return smartCompareAnswers(userAnswer, correctAnswer, 0.01);
 }
 };

 const calculateScore = () => {
 let correct = 0;
 let selfCheckTotal = 0;
 let selfCheckEarned = 0;
 problems.forEach(problem => {
 if (isSelfCheckTask(problem, subject as string, examType as string)) {
 const maxScore = problem.score || 1;
 selfCheckTotal += maxScore;
 selfCheckEarned += selfGrades[problem.id] ?? 0;
 } else {
 if (checkProblemAnswer(problem, answers[problem.id] || '')) {
 correct++;
 }
 }
 });
 const autoTotal = problems.length - problems.filter(p => isSelfCheckTask(p, subject as string, examType as string)).length;
 return { correct, total: autoTotal + selfCheckTotal, selfCheckEarned, selfCheckTotal, autoTotal };
 };

 const currentProblem = problems[currentIndex];
 const inputType = useMemo(
 () => currentProblem ? getSdamgiaInputType(currentProblem, examType as string, grade as number | undefined) : 'text' as SdamgiaInputType,
 [currentProblem, examType, grade]
 );
 const coordinateRange: [number, number] = useMemo(() => {
 if (!currentProblem) return [-5, 7];
 const aiData = aiPoints[currentProblem.id];
 if (aiData && aiData.points.length > 0) {
 const [aiMin, aiMax] = aiData.range;
 const answerVal = parseFloat(currentProblem.answer?.replace(',', '.') || '');
 let rMin = aiMin;
 let rMax = aiMax;
 if (!isNaN(answerVal)) {
 rMin = Math.min(rMin, Math.floor(answerVal) - 1);
 rMax = Math.max(rMax, Math.ceil(answerVal) + 1);
 }
 return [rMin, rMax];
 }
 return getCoordinateRange(currentProblem);
 }, [currentProblem, aiPoints]);

 const markedPoints: MarkedPoint[] = useMemo(() => {
 if (!currentProblem) return [];
 const textPoints = parseReferencePoints(currentProblem.question);
 const aiData = aiPoints[currentProblem.id];
 if (!aiData || aiData.points.length === 0) return textPoints;

 const aiLabels = new Set(aiData.points.map(p => p.label));
 const merged = [...aiData.points];
 for (const tp of textPoints) {
 if (!aiLabels.has(tp.label)) {
 merged.push(tp);
 }
 }
 return merged;
 }, [currentProblem, aiPoints]);

 const answerableCount = useMemo(
 () => problems.filter(p => !isSelfCheckTask(p, subject as string, examType as string)).length,
 [problems, subject, examType]
 );

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="relative">
 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 <div
 className="absolute inset-0 w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"
 style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
 />
 </div>
 </div>
 );
 }

 if (loadError) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="text-center max-w-md mx-auto px-4">
 <div className="text-6xl mb-4">⚠️</div>
 <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Ошибка загрузки</h2>
 <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{loadError}</p>
 <div className="flex gap-3 justify-center">
 <Button onClick={() => void loadVariant()}>Попробовать снова</Button>
 <Button variant="secondary" onClick={() => { void navigate('/dashboard'); }}>На главную</Button>
 </div>
 </div>
 </div>
 );
 }

 if (showResults || reviewMode) {
 const { correct, total, selfCheckEarned, selfCheckTotal } = calculateScore();
 const totalCorrect = correct + selfCheckEarned;
 const percentage = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
 const selfCheckProblems = problems.filter(p => isSelfCheckTask(p, subject as string, examType as string));
 const hasPendingSelfCheck = selfCheckProblems.length > 0 && !showSelfCheck && selfCheckEarned === 0 && Object.keys(selfGrades).length === 0;

 if (reviewMode) {
 return (
 <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <style>{SDAMGIA_STYLES}</style>
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h1 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>
 Просмотр ответов ({totalCorrect}/{total})
 </h1>
 <Button variant="secondary" onClick={() => { setReviewMode(false); setShowResults(true); window.scrollTo(0, 0); }}>
 Назад к результатам
 </Button>
 </div>
 {problems.map((problem, idx) => {
 const isSelf = isSelfCheckTask(problem, subject as string, examType as string);
 const userAns = answers[problem.id]?.trim() || '';
 const isCorrect = isSelf ? (selfGrades[problem.id] ?? 0) > 0 : checkProblemAnswer(problem, userAns);
 const selfScore = selfGrades[problem.id] ?? 0;
 const maxScore = problem.score || 1;
 return (
 <div
 key={problem.id}
 className={`border-2 rounded-2xl p-6 shadow-lg ${
 isSelf
 ? (selfScore > 0 ? 'border-amber-300' : 'border-slate-200')
 : (isCorrect ? 'border-green-300' : userAns ? 'border-red-300' : 'border-slate-200')
 }`}
 style={{ backgroundColor: 'var(--color-surface)' }}
 >
 <div className="flex items-center gap-3 mb-3">
 <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
 isSelf
 ? (selfScore > 0 ? 'bg-amber-500' : 'bg-slate-400')
 : (isCorrect ? 'bg-green-500' : userAns ? 'bg-red-500' : 'bg-slate-400')
 }`}>
 {idx + 1}
 </span>
 <h3 className="font-semibold " style={{ color: 'var(--color-text)' }}>Задание №{problem.number}</h3>
 {isSelf ? (
 <span className="text-amber-600 text-sm font-medium">
 Самопроверка: {selfScore}/{maxScore} {pluralize(maxScore, 'балл', 'балла', 'баллов')}
 </span>
 ) : isCorrect ? (
 <span className="text-green-600 text-sm font-medium">Верно</span>
 ) : userAns ? (
 <span className="text-red-600 text-sm font-medium">Неверно</span>
 ) : (
 <span className="text-slate-400 text-sm">Нет ответа</span>
 )}
 </div>
 <div
 className="sdamgia-content prose max-w-none text-sm text-slate-800 mb-3"
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.question) }}
 />
 <div className="flex flex-wrap gap-4 text-sm">
 {!isSelf && userAns && (
 <div>
 <span className="text-slate-500">Ваш ответ: </span>
 <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
 {userAns}
 </span>
 </div>
 )}
 {!isSelf && !isCorrect && (
 <div>
 <span className="text-slate-500">Правильный: </span>
 <span className="text-green-700 font-semibold">{problem.answer}</span>
 </div>
 )}
 {isSelf && problem.answer && (
 <div>
 <span className="text-slate-500">Правильный ответ: </span>
 <span className="text-green-700 font-semibold">{problem.answer}</span>
 </div>
 )}
 </div>
 {problem.solution && (
 <details className="mt-4">
 <summary className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
 Показать решение
 </summary>
 <div
 className="mt-3 sdamgia-content prose max-w-none text-sm"
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.solution) }}
 />
 </details>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
 }

 if (showSelfCheck) {
 return (
 <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <style>{SDAMGIA_STYLES}</style>
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
 Самопроверка практических заданий
 </h1>
 </div>
 <p className="text-slate-600 text-sm mb-4">
 Сравните свою работу с правильным ответом и критериями. Поставьте себе баллы за каждое задание.
 </p>
 {selfCheckProblems.map((problem) => {
 const maxScore = problem.score || 1;
 const currentGrade = selfGrades[problem.id] ?? 0;
 return (
 <div key={problem.id} className="border-2 border-amber-200 rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="flex items-center gap-3 mb-3">
 <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-amber-500">
 {problem.number}
 </span>
 <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Задание №{problem.number}</h3>
 {problem.topic && <span className="text-blue-600 text-xs">{problem.topic}</span>}
 </div>
 <div
 className="sdamgia-content prose max-w-none text-sm text-slate-800 mb-4"
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.question) }}
 />
 {problem.answer && (
 <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
 <span className="text-green-800 text-sm font-medium">Правильный ответ: </span>
 <span className="text-green-700 text-sm">{problem.answer}</span>
 </div>
 )}
 {problem.solution && (
 <details className="mb-4">
 <summary className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
 Показать решение / критерии
 </summary>
 <div
 className="mt-3 sdamgia-content prose max-w-none text-sm bg-slate-50 rounded-xl p-4"
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.solution) }}
 />
 </details>
 )}
 <div>
 <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
 Ваша оценка (макс. {maxScore} {pluralize(maxScore, 'балл', 'балла', 'баллов')}):
 </p>
 <div className="flex gap-2 flex-wrap">
 {Array.from({ length: maxScore + 1 }, (_, i) => (
 <button
 key={i}
 onClick={() => setSelfGrades(prev => ({ ...prev, [problem.id]: i }))}
 className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
 currentGrade === i
 ? 'bg-amber-500 text-white shadow-md scale-110'
 : 'hover:opacity-80'
 }`}
 style={currentGrade !== i ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' } : undefined}
 >
 {i}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
 })}
 <div className="flex gap-4 justify-center pt-4">
 <Button
 onClick={() => {
 setShowSelfCheck(false);
 submitResults();
 window.scrollTo(0, 0);
 }}
 >
 Сохранить оценки
 </Button>
 <Button variant="secondary" onClick={() => { setShowSelfCheck(false); window.scrollTo(0, 0); }}>
 Назад
 </Button>
 </div>
 </div>
 </div>
 );
 }

 const analyzedQuestions: AnalyzedQuestion[] = problems.map(problem => ({
 number: problem.number,
 topic: problem.topic || '',
 isCorrect: isSelfCheckTask(problem, subject as string, examType as string)
 ? (selfGrades[problem.id] ?? 0) > 0
 : checkProblemAnswer(problem, answers[problem.id] || ''),
 userAnswer: isSelfCheckTask(problem, subject as string, examType as string)
 ? `Самопроверка: ${selfGrades[problem.id] ?? 0} б.`
 : (answers[problem.id]?.trim() || null),
 correctAnswer: problem.answer?.trim() || '',
 points: problem.score || 1,
 }));

 const normalizedSubject = SDAMGIA_SUBJECT_MAP[(subject as string)] || (subject as string)?.toUpperCase() || 'MATHEMATICS';
 const normalizedExamType = (examType as string)?.toUpperCase() || 'OGE';
 const errorAnalysis = analyzeTestErrors(
 normalizedSubject,
 normalizedExamType,
 (grade as number) || 9,
 analyzedQuestions
 );

 return (
 <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-2xl mx-auto space-y-6">
 <div className=" backdrop-blur-xl border border-slate-200 rounded-3xl p-8 text-center shadow-2xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div className="text-6xl mb-6">
 {hasPendingSelfCheck ? '📝' : percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
 </div>
 <h1 className="text-4xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>
 {hasPendingSelfCheck ? 'Тест почти завершен!' : 'Тест завершен!'}
 </h1>
 {hasPendingSelfCheck ? (
 <>
 <div className="text-4xl font-bold text-blue-600 mb-1">
 Теория: {correct}/{total - selfCheckTotal}
 </div>
 <p className="text-slate-600 text-sm mb-2">
 Практика: ещё не оценена ({selfCheckTotal} {pluralize(selfCheckTotal, 'балл', 'балла', 'баллов')})
 </p>
 <p className="text-amber-600 text-sm mb-8">
 Оцените {selfCheckProblems.length} {pluralize(selfCheckProblems.length, 'практическое задание', 'практических задания', 'практических заданий')}, чтобы увидеть итоговый результат
 </p>
 </>
 ) : (
 <>
 <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
 <p className={`text-slate-600 text-lg ${selfCheckTotal > 0 ? 'mb-2' : 'mb-8'}`}>
 Правильно: {totalCorrect} из {total}
 </p>
 {selfCheckTotal > 0 && (
 <p className="text-slate-500 text-sm mb-8">
 Из них самопроверка: {selfCheckEarned}/{selfCheckTotal}
 </p>
 )}
 </>
 )}
 <div className="flex gap-4 justify-center flex-wrap">
 {hasPendingSelfCheck && (
 <Button onClick={() => { setShowSelfCheck(true); window.scrollTo(0, 0); }}>
 Оценить практические задания
 </Button>
 )}
 {selfCheckTotal > 0 && !hasPendingSelfCheck && (
 <Button variant="secondary" onClick={() => { setShowSelfCheck(true); window.scrollTo(0, 0); }}>
 Переоценить практику
 </Button>
 )}
 <Button variant={hasPendingSelfCheck ? 'secondary' : undefined} onClick={() => { void navigate('/dashboard'); }}>На главную</Button>
 <Button variant="secondary" onClick={() => { setShowResults(false); setReviewMode(true); window.scrollTo(0, 0); }}>
 Посмотреть ответы
 </Button>
 </div>
 </div>

 <TestErrorAnalysis analysis={errorAnalysis} />
 </div>
 </div>
 );
 }

 if (!currentProblem) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <p style={{ color: 'var(--color-text)' }}>Задание не найдено</p>
 </div>
 );
 }

 return (
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 <style>{SDAMGIA_STYLES}</style>

 <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
 <div
 className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
 style={{ width: `${answerableCount > 0 ? Math.min((Object.keys(answers).length / answerableCount) * 100, 100) : 0}%` }}
 />
 </div>

 <div className="max-w-4xl mx-auto py-12 px-4">
 <div className="mb-8 flex justify-between items-center">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span
 className={`px-3 py-1 rounded-full text-xs font-semibold ${
 currentProblem.part === 1
 ? 'bg-blue-50 text-blue-600 border border-blue-200'
 : 'bg-violet-50 text-violet-600 border border-violet-200'
 }`}
 >
 Часть {currentProblem.part}
 </span>
 <p className="text-slate-600 text-sm">
 {currentIndex + 1} из {problems.length}
 </p>
 {currentProblem.score && currentProblem.score > 1 && (
 <span className="text-amber-600 text-xs">
 {currentProblem.score} {pluralize(currentProblem.score, 'балл', 'балла', 'баллов')}
 </span>
 )}
 </div>
 <h2 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>
 Задание №{currentProblem.number}
 </h2>
 {currentProblem.topic && (() => {
 const theory = findTheoryForTask(
 SDAMGIA_SUBJECT_MAP[subject as string] || subject,
 examType,
 currentProblem.number,
 currentProblem.topic,
 );
 return (
 <div className="flex items-center gap-2 mt-1">
 <p className="text-blue-600 text-sm">{currentProblem.topic}</p>
 {theory && (
 <button
 onClick={() => setTheoryTopic(theory)}
 className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
 >
 Теория
 </button>
 )}
 </div>
 );
 })()}
 </div>
 <button
 onClick={handleExitRequest}
 className="text-slate-600 hover:text-slate-900 transition-colors"
 aria-label="Выйти из теста"
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

 <div className=" backdrop-blur-xl border border-slate-200 rounded-2xl p-8 mb-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <div
 className="sdamgia-content prose max-w-none mb-6 text-slate-900"
 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentProblem.question) }}
 />

 <div className="mb-6">
 {isSelfCheckTask(currentProblem, subject as string, examType as string) ? (
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
 <div className="flex items-start gap-3">
 <span className="text-amber-500 text-xl mt-0.5">&#128187;</span>
 <div>
 <p className="text-amber-800 font-medium mb-1">Практическое задание</p>
 <p className="text-amber-700 text-sm">
 Выполните это задание на компьютере.
 После завершения теста вы сможете самостоятельно проверить себя и поставить баллы.
 </p>
 </div>
 </div>
 </div>
 ) : inputType === 'coordinate_line' ? (
 <CoordinateLine
 value={answers[currentProblem.id] !== undefined ? parseFloat(answers[currentProblem.id]!) : null}
 onChange={(val) => {
 if (isNaN(val)) {
 const newAnswers = { ...answers };
 delete newAnswers[currentProblem.id];
 setAnswers(newAnswers);
 } else {
 handleAnswer(String(val));
 }
 }}
 range={coordinateRange}
 markedPoints={markedPoints}
 />
 ) : inputType === 'two_part' ? (
 <TwoPartInput
 value={answers[currentProblem.id] || ';'}
 onChange={handleAnswer}
 />
 ) : (
 <>
 <label htmlFor="sdamgia-answer" className="block text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Ваш ответ:</label>
 <input
 id="sdamgia-answer"
 type="text"
 value={answers[currentProblem.id] || ''}
 onChange={e => handleAnswer(e.target.value)}
 onKeyDown={handleKeyDown}
 className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
 style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
 placeholder="Введите ответ (можно дробь: 2/3)"
 />
 </>
 )}
 </div>
 </div>

 <div className="flex justify-between items-center">
 <Button onClick={handlePrev} disabled={currentIndex === 0} variant="secondary">
 ← Предыдущий
 </Button>

 <div className="text-slate-600 text-sm">
 Отвечено: {Object.keys(answers).length} / {answerableCount}
 </div>

 {currentIndex < problems.length - 1 ? (
 <Button onClick={handleNext}>Следующий →</Button>
 ) : (
 <Button onClick={handleFinishRequest}>Завершить тест</Button>
 )}
 </div>
 </div>

 {showFinishModal && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Подтверждение завершения">
 <div className=" rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 className="text-lg font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Завершить тест?</h3>
 <p className="text-slate-600 mb-6">
 Вы ответили на {Object.keys(answers).length} из {problems.filter(p => !isSelfCheckTask(p, subject as string, examType as string)).length} вопросов.
 Неотвеченные задания будут засчитаны как неправильные.
 {hasSelfCheckTasks && (
 <><br />Практические задания вы сможете оценить после завершения теста.</>
 )}
 </p>
 <div className="flex gap-3 justify-end">
 <Button variant="secondary" onClick={() => setShowFinishModal(false)}>Отмена</Button>
 <Button onClick={confirmFinish}>Завершить</Button>
 </div>
 </div>
 </div>
 )}

 {showExitModal && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Подтверждение выхода">
 <div className=" rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: 'var(--color-surface)' }}>
 <h3 className="text-lg font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Выйти из теста?</h3>
 <p className="text-slate-600 mb-6">
 Ваши ответы сохранены и будут восстановлены при возвращении к этому варианту.
 </p>
 <div className="flex gap-3 justify-end">
 <Button variant="secondary" onClick={() => setShowExitModal(false)}>Остаться</Button>
 <Button onClick={confirmExit}>Выйти</Button>
 </div>
 </div>
 </div>
 )}

 <TheoryDrawer
 topic={theoryTopic}
 subject={SDAMGIA_SUBJECT_MAP[subject as string] || subject}
 onClose={() => setTheoryTopic(null)}
 />
 </div>
 );
}
