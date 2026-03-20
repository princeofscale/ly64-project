import { SUBJECT_LABELS } from '@lyceum64/shared';
import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
} from 'recharts';

import api from '../services/api';

interface DailyActivity {
  date: string;
  count: number;
  avgScore: number;
}

interface SubjectStat {
  subject: string;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
}

interface RecentAttempt {
  id: string;
  testId: string;
  subject: string;
  score: number | null;
  completedAt: string | null;
}

interface UserStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  statsBySubject: SubjectStat[];
  recentAttempts: RecentAttempt[];
  dailyActivity: DailyActivity[];
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityHistoryItem {
  date: string;
  points: number;
}

function getSubjectLabel(key: string): string {
  return (SUBJECT_LABELS as Record<string, string>)[key] || key;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/gamification/activity-history?days=90'),
        ]);
        setStats(statsRes.data);
        // activity-history returns { dailyActivity: [{ date, points }] }
        const actData = activityRes.data?.data;
        const dailyAct: ActivityHistoryItem[] = actData?.dailyActivity || [];
        // Map points > 0 to count=1+ for heatmap, merge with stats.dailyActivity
        const statsDaily: ActivityDay[] = statsRes.data?.dailyActivity || [];
        const mergedMap = new Map<string, number>();
        for (const d of statsDaily) {
          mergedMap.set(d.date, d.count);
        }
        for (const d of dailyAct) {
          if (d.points > 0 && !mergedMap.has(d.date)) {
            mergedMap.set(d.date, 1);
          }
        }
        const merged = Array.from(mergedMap.entries()).map(([date, count]) => ({ date, count }));
        setActivityHistory(merged);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Нет данных для отображения</p>
      </div>
    );
  }

  // === 1. 90-day heatmap ===
  const heatmapData = build90DayHeatmap(activityHistory);

  // === 2. Score trend ===
  const filteredAttempts = subjectFilter === 'all'
    ? stats.recentAttempts
    : stats.recentAttempts.filter(a => a.subject === subjectFilter);

  const scoreTrendData = [...filteredAttempts]
    .filter(a => a.completedAt && a.score !== null)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
    .map(a => ({
      date: new Date(a.completedAt!).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      score: a.score,
    }));

  // === 3. Radar chart ===
  const radarData = stats.statsBySubject
    .filter(s => s.totalAttempts > 0)
    .map(s => ({
      subject: getSubjectLabel(s.subject),
      accuracy: Math.round(s.averageScore),
      fullMark: 100,
    }));

  // === 4. Weekly progress ===
  const weeklyData = buildWeeklyProgress(stats.recentAttempts);

  // === 5. Time spent ===
  const totalHours = Math.round((stats.totalTimeSpent || 0) / 60 * 10) / 10;
  const totalSubjectAttempts = stats.statsBySubject.reduce((s, x) => s + x.totalAttempts, 0);
  const timeBreakdown = stats.statsBySubject
    .filter(s => s.totalAttempts > 0)
    .map(s => ({
      subject: getSubjectLabel(s.subject),
      proportion: totalSubjectAttempts > 0 ? Math.round((s.totalAttempts / totalSubjectAttempts) * 100) : 0,
    }));

  // === 6. Streak ===
  const last7Days = getLast7DaysActivity(activityHistory);

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Аналитика</h1>

        {/* 1. 90-day Heatmap */}
        <Section title="Активность за 90 дней">
          <HeatmapGrid data={heatmapData} />
        </Section>

        {/* 2. Score Trend */}
        <Section title="Динамика результатов">
          <div className="mb-3">
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
            >
              <option value="all">Все предметы</option>
              {stats.statsBySubject.map(s => (
                <option key={s.subject} value={s.subject}>{getSubjectLabel(s.subject)}</option>
              ))}
            </select>
          </div>
          {scoreTrendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={scoreTrendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Недостаточно данных для графика
            </p>
          )}
        </Section>

        {/* 3. Subject Radar */}
        <Section title="Предметы">
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text)', fontSize: 12 }} />
                <Radar
                  name="Точность"
                  dataKey="accuracy"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.25}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Нужно минимум 3 предмета для радарной диаграммы
              </p>
              {/* Fallback: bar list */}
              <div className="mt-4 space-y-2 max-w-md mx-auto">
                {radarData.map(r => (
                  <div key={r.subject} className="flex items-center gap-3">
                    <span className="text-sm w-28 text-right" style={{ color: 'var(--color-text)' }}>{r.subject}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${r.accuracy}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10" style={{ color: 'var(--color-text)' }}>{r.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* 4. Weekly Progress */}
        <Section title="Прогресс по неделям">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="count" name="Тестов" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Нет данных
            </p>
          )}
        </Section>

        {/* 5. Time Spent */}
        <Section title="Время обучения">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{totalHours}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>часов</div>
          </div>
          <div className="space-y-2">
            {timeBreakdown.map(t => (
              <div key={t.subject} className="flex items-center gap-3">
                <span className="text-sm w-32 truncate" style={{ color: 'var(--color-text)' }}>{t.subject}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${t.proportion}%` }} />
                </div>
                <span className="text-xs w-10 text-right" style={{ color: 'var(--color-text-secondary)' }}>{t.proportion}%</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. Streak */}
        <Section title="Серии">
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stats.currentStreak}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>текущая серия</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stats.longestStreak}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>лучшая серия</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Последние 7 дней:</span>
            <div className="flex gap-1.5">
              {last7Days.map((active, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full ${active ? 'bg-green-500' : ''}`}
                  style={active ? {} : { backgroundColor: 'var(--color-border)' }}
                  title={active ? 'Активен' : 'Нет активности'}
                />
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{title}</h2>
      {children}
    </div>
  );
}

// === Heatmap helpers ===

interface HeatmapCell {
  date: string;
  count: number;
  dayOfWeek: number;
  weekIndex: number;
}

const DAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', ''];

function build90DayHeatmap(activity: ActivityDay[]): { cells: HeatmapCell[]; months: { label: string; col: number }[] } {
  const actMap = new Map<string, number>();
  for (const a of activity) {
    actMap.set(a.date, a.count);
  }

  const today = new Date();
  const cells: HeatmapCell[] = [];

  // Go back 90 days
  const start = new Date(today);
  start.setDate(start.getDate() - 89);

  // Align to Monday
  const startDay = start.getDay(); // 0=Sun
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  start.setDate(start.getDate() + mondayOffset);

  const d = new Date(start);
  let weekIndex = 0;
  const monthSet = new Map<string, number>();

  while (d <= today) {
    const dow = d.getDay();
    const dayOfWeek = dow === 0 ? 6 : dow - 1; // 0=Mon ... 6=Sun
    const dateStr = d.toISOString().split('T')[0] as string;

    cells.push({
      date: dateStr,
      count: actMap.get(dateStr) || 0,
      dayOfWeek,
      weekIndex,
    });

    if (dayOfWeek === 0) {
      const monthLabel = d.toLocaleDateString('ru-RU', { month: 'short' });
      if (!monthSet.has(monthLabel)) {
        monthSet.set(monthLabel, weekIndex);
      }
    }

    d.setDate(d.getDate() + 1);
    if (d.getDay() === 1 || (d.getDay() === 0 && false)) {
      weekIndex++;
    }
    // actually increment week when we cross Monday
    if (dayOfWeek === 6) {
      weekIndex++;
    }
  }

  // Recalculate weekIndex properly
  const cellsFixed: HeatmapCell[] = [];
  const monthSetFixed = new Map<string, number>();
  const d2 = new Date(start);
  let wi = 0;
  while (d2 <= today) {
    const dow = d2.getDay();
    const dayOfWeek = dow === 0 ? 6 : dow - 1;
    const dateStr = d2.toISOString().split('T')[0] as string;

    cellsFixed.push({
      date: dateStr,
      count: actMap.get(dateStr) || 0,
      dayOfWeek,
      weekIndex: wi,
    });

    if (dayOfWeek === 0) {
      const monthLabel = d2.toLocaleDateString('ru-RU', { month: 'short' });
      if (!monthSetFixed.has(monthLabel)) {
        monthSetFixed.set(monthLabel, wi);
      }
    }

    d2.setDate(d2.getDate() + 1);
    if (dayOfWeek === 6) {
      wi++;
    }
  }

  const months = Array.from(monthSetFixed.entries()).map(([label, col]) => ({ label, col }));

  return { cells: cellsFixed, months };
}

function getHeatmapColor(count: number): string {
  if (count === 0) return 'var(--color-border)';
  if (count === 1) return '#86efac';
  if (count === 2) return '#22d3ee';
  if (count <= 4) return '#06b6d4';
  return '#0891b2';
}

function HeatmapGrid({ data }: { data: { cells: HeatmapCell[]; months: { label: string; col: number }[] } }) {
  const maxWeek = data.cells.reduce((m, c) => Math.max(m, c.weekIndex), 0);

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex ml-8 mb-1" style={{ gap: 0 }}>
        {data.months.map((m, i) => (
          <div
            key={i}
            className="text-xs"
            style={{
              color: 'var(--color-text-secondary)',
              position: 'relative',
              left: `${m.col * 16}px`,
              marginRight: i < data.months.length - 1
                ? `${((data.months[i + 1]?.col || maxWeek) - m.col) * 16 - 30}px`
                : '0',
            }}
          >
            {m.label}
          </div>
        ))}
      </div>
      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1 pt-0">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-[14px] w-7 text-[10px] flex items-center justify-end pr-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {label}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${maxWeek + 1}, 14px)`,
            gridTemplateRows: 'repeat(7, 14px)',
          }}
        >
          {data.cells.map((cell, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                gridColumn: cell.weekIndex + 1,
                gridRow: cell.dayOfWeek + 1,
                width: 14,
                height: 14,
                backgroundColor: getHeatmapColor(cell.count),
              }}
              title={`${cell.date}: ${cell.count} тестов`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// === Weekly progress helpers ===

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `Н${weekNum}`;
}

function buildWeeklyProgress(attempts: RecentAttempt[]): { week: string; count: number; avgScore: number }[] {
  const weekMap = new Map<string, { count: number; totalScore: number }>();

  for (const a of attempts) {
    if (!a.completedAt) continue;
    const week = getISOWeek(new Date(a.completedAt));
    const existing = weekMap.get(week) || { count: 0, totalScore: 0 };
    existing.count++;
    existing.totalScore += a.score || 0;
    weekMap.set(week, existing);
  }

  return Array.from(weekMap.entries())
    .map(([week, data]) => ({
      week,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
    }))
    .slice(-8); // Last 8 weeks
}

function getLast7DaysActivity(activity: ActivityDay[]): boolean[] {
  const actSet = new Set(activity.filter(a => a.count > 0).map(a => a.date));
  const result: boolean[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] as string;
    result.push(actSet.has(dateStr));
  }

  return result;
}
