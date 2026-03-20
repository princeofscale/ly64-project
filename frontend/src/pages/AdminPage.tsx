import { DIRECTION_LABELS, SUBJECT_LABELS } from '@lyceum64/shared';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

// ─── Types ───────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  status: string;
  currentGrade: number;
  desiredDirection: string | null;
  createdAt: string;
  _count: {
    testAttempts: number;
  };
}

interface PlatformStats {
  totalUsers: number;
  usersToday: number;
  totalTests: number;
  testsToday: number;
  usersByRole: Record<string, number>;
  avgScore?: number;
  activeUsersWeek?: number;
  testsBySubject?: Record<string, number>;
  registrationsByDay?: Record<string, number>;
  questionsBySubject?: Record<string, number>;
  testsByExamType?: Record<string, number>;
}

interface TestAttemptEntry {
  id: string;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
  user: { id: string; name: string; email: string };
  test: { id: string; title: string; subject: string; examType: string };
}

interface ClassroomEntry {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  membersCount: number;
  createdAt: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  keys: string[];
  hitRate: string;
}

interface SystemInfo {
  users: number;
  tests: number;
  questions: number;
  testAttempts: number;
  classrooms: number;
  achievements: number;
  notifications: number;
  duels: number;
  marathonRuns: number;
  srsCards: number;
}

type TabId = 'overview' | 'users' | 'tests' | 'classrooms' | 'content' | 'system';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'users', label: 'Пользователи' },
  { id: 'tests', label: 'Тесты' },
  { id: 'classrooms', label: 'Классы' },
  { id: 'content', label: 'Контент' },
  { id: 'system', label: 'Система' },
];

const ROLE_LABELS: Record<string, string> = {
  USER: 'Пользователь',
  ADMIN: 'Администратор',
  TEACHER: 'Учитель',
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  LYCEUM_ENTRANCE: 'Вступительные',
  OGE: 'ОГЭ',
  EGE: 'ЕГЭ',
  VPR: 'ВПР',
};

// ─── Component ───────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Users tab
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ role: '' });

  // Tests tab
  const [attempts, setAttempts] = useState<TestAttemptEntry[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsSubject, setAttemptsSubject] = useState('');
  const [attemptsSearch, setAttemptsSearch] = useState('');
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [attemptsTotalPages, setAttemptsTotalPages] = useState(1);

  // Classrooms tab
  const [classrooms, setClassrooms] = useState<ClassroomEntry[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [deletingClassroomId, setDeletingClassroomId] = useState<string | null>(null);

  // System tab
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // ─── Loaders ────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch {
      // silent
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { page: page.toString(), limit: '10' };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data.users);
      setTotalPages(data.data.pagination.pages);
    } catch {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  const loadAttempts = useCallback(async () => {
    try {
      setAttemptsLoading(true);
      const params: Record<string, string> = { page: attemptsPage.toString(), limit: '15' };
      if (attemptsSubject) params.subject = attemptsSubject;
      if (attemptsSearch) params.search = attemptsSearch;
      const { data } = await api.get('/admin/test-attempts', { params });
      setAttempts(data.data.attempts);
      setAttemptsTotalPages(data.data.pagination.pages);
    } catch {
      toast.error('Ошибка загрузки попыток');
    } finally {
      setAttemptsLoading(false);
    }
  }, [attemptsPage, attemptsSubject, attemptsSearch]);

  const loadClassrooms = useCallback(async () => {
    try {
      setClassroomsLoading(true);
      const { data } = await api.get('/admin/classrooms');
      setClassrooms(data.data);
    } catch {
      toast.error('Ошибка загрузки классов');
    } finally {
      setClassroomsLoading(false);
    }
  }, []);

  const loadSystemInfo = useCallback(async () => {
    try {
      setSystemLoading(true);
      const [cacheRes, sysRes] = await Promise.all([
        api.get('/admin/cache/stats'),
        api.get('/admin/system-info'),
      ]);
      setCacheStats(cacheRes.data.data);
      setSystemInfo(sysRes.data.data);
    } catch {
      toast.error('Ошибка загрузки системной информации');
    } finally {
      setSystemLoading(false);
    }
  }, []);

  // ─── Effects ────────────────────────────────────────

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Доступ запрещён');
      void navigate('/dashboard');
      return;
    }
    void loadStats();
  }, [user, navigate, loadStats]);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'overview') void loadUsers();
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'tests') void loadAttempts();
  }, [activeTab, loadAttempts]);

  useEffect(() => {
    if (activeTab === 'classrooms') void loadClassrooms();
  }, [activeTab, loadClassrooms]);

  useEffect(() => {
    if (activeTab === 'system') void loadSystemInfo();
  }, [activeTab, loadSystemInfo]);

  // ─── Handlers ───────────────────────────────────────

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({ role: u.role });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
      toast.success('Пользователь обновлён');
      setEditingUser(null);
      void loadUsers();
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await api.delete(`/admin/users/${deletingUserId}`);
      toast.success('Пользователь удалён');
      setDeletingUserId(null);
      void loadUsers();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Ошибка удаления';
      toast.error(message);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deletingClassroomId) return;
    try {
      await api.delete(`/admin/classrooms/${deletingClassroomId}`);
      toast.success('Класс удалён');
      setDeletingClassroomId(null);
      void loadClassrooms();
    } catch {
      toast.error('Ошибка удаления класса');
    }
  };

  const handleClearCache = async () => {
    try {
      await api.delete('/admin/cache');
      toast.success('Кэш очищен');
      void loadSystemInfo();
    } catch {
      toast.error('Ошибка очистки кэша');
    }
  };

  // ─── Guard ──────────────────────────────────────────

  if (user?.role !== 'ADMIN') return null;

  // ─── Chart data helpers ─────────────────────────────

  const registrationChartData = stats?.registrationsByDay
    ? Object.entries(stats.registrationsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: date.slice(5), // MM-DD
          count,
        }))
    : [];

  const testsBySubjectData = stats?.testsBySubject
    ? Object.entries(stats.testsBySubject).map(([key, value]) => ({
        subject: (SUBJECT_LABELS as Record<string, string>)[key] ?? key,
        count: value,
      }))
    : [];

  const questionsBySubjectData = stats?.questionsBySubject
    ? Object.entries(stats.questionsBySubject).map(([key, value]) => ({
        subject: (SUBJECT_LABELS as Record<string, string>)[key] ?? key,
        count: value,
      }))
    : [];

  const testsByExamTypeData = stats?.testsByExamType
    ? Object.entries(stats.testsByExamType).map(([key, value]) => ({
        type: EXAM_TYPE_LABELS[key] ?? key,
        count: value,
      }))
    : [];

  // ─── Render ─────────────────────────────────────────

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          Панель администратора
        </h1>

        {/* Tabs */}
        <div
          className="flex flex-wrap gap-1 mb-8 p-1 rounded-xl"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Tab: Overview ═══ */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard value={stats.totalUsers} label="Пользователей" sub={`+${stats.usersToday} сегодня`} color="#2563eb" />
              <StatCard value={stats.totalTests} label="Тестов пройдено" sub={`+${stats.testsToday} сегодня`} color="#7c3aed" />
              <StatCard value={`${stats.avgScore ?? 0}%`} label="Средний балл" color="#10b981" />
              <StatCard value={stats.activeUsersWeek ?? 0} label="Активных за неделю" color="#06b6d4" />
              <StatCard value={stats.usersByRole?.ADMIN ?? 0} label="Администраторов" color="#f59e0b" />
              <StatCard value={stats.usersByRole?.TEACHER ?? 0} label="Учителей" color="#ec4899" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration chart */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Регистрации за 30 дней
                </h3>
                {registrationChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={registrationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text)',
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} name="Регистрации" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                    Нет данных
                  </div>
                )}
              </div>

              {/* Tests by subject chart */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Тесты по предметам
                </h3>
                {testsBySubjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={testsBySubjectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="subject" stroke="var(--color-text-muted)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-text)',
                        }}
                      />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Попытки" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                    Нет данных
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Tab: Users ═══ */}
        {activeTab === 'users' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Поиск по email, имени..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input flex-1 min-w-[200px]"
              />
              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                className="input w-auto"
              >
                <option value="">Все роли</option>
                <option value="USER">Пользователи</option>
                <option value="ADMIN">Администраторы</option>
                <option value="TEACHER">Учителя</option>
              </select>
            </div>

            {/* Users table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {loading ? (
                <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'var(--color-bg-secondary)' }}>
                          <Th>Пользователь</Th>
                          <Th>Роль</Th>
                          <Th>Направление</Th>
                          <Th>Тесты</Th>
                          <Th>Дата</Th>
                          <Th align="right">Действия</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="transition-colors" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td className="px-4 py-3">
                              <div className="font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</div>
                              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <RoleBadge role={u.role} />
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {u.desiredDirection
                                ? (DIRECTION_LABELS as Record<string, string>)[u.desiredDirection] ?? u.desiredDirection
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {u._count.testAttempts}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditUser(u)} className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                  Изменить
                                </button>
                                {u.id !== user?.id && (
                                  <button onClick={() => setDeletingUserId(u.id)} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                    Удалить
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ Tab: Tests ═══ */}
        {activeTab === 'tests' && (
          <div>
            <div className="flex flex-wrap gap-4 mb-6">
              <input
                type="text"
                placeholder="Поиск по имени..."
                value={attemptsSearch}
                onChange={e => { setAttemptsSearch(e.target.value); setAttemptsPage(1); }}
                className="input flex-1 min-w-[200px]"
              />
              <select
                value={attemptsSubject}
                onChange={e => { setAttemptsSubject(e.target.value); setAttemptsPage(1); }}
                className="input w-auto"
              >
                <option value="">Все предметы</option>
                {Object.entries(SUBJECT_LABELS as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {attemptsLoading ? (
                <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'var(--color-bg-secondary)' }}>
                          <Th>Пользователь</Th>
                          <Th>Тест</Th>
                          <Th>Предмет</Th>
                          <Th>Балл</Th>
                          <Th>Дата</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td className="px-4 py-3">
                              <div className="font-medium" style={{ color: 'var(--color-text)' }}>{a.user.name}</div>
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.user.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {a.test.title}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {(SUBJECT_LABELS as Record<string, string>)[a.test.subject] ?? a.test.subject}
                            </td>
                            <td className="px-4 py-3">
                              {a.score != null ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.score >= 70 ? 'bg-green-100 text-green-700' : a.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {a.score}%
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(a.startedAt).toLocaleDateString('ru-RU')}
                            </td>
                          </tr>
                        ))}
                        {attempts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                              Нет попыток
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={attemptsPage} totalPages={attemptsTotalPages} onPageChange={setAttemptsPage} />
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══ Tab: Classrooms ═══ */}
        {activeTab === 'classrooms' && (
          <div>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {classroomsLoading ? (
                <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--color-bg-secondary)' }}>
                        <Th>Название</Th>
                        <Th>Учитель</Th>
                        <Th>Код</Th>
                        <Th>Учеников</Th>
                        <Th>Создан</Th>
                        <Th align="right">Действия</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {classrooms.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm" style={{ color: 'var(--color-text)' }}>{c.teacherName}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.teacherEmail}</div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 rounded text-xs font-mono" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}>
                              {c.code}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.membersCount}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setDeletingClassroomId(c.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                      {classrooms.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                            Нет классов
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ Tab: Content ═══ */}
        {activeTab === 'content' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Questions by subject */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Вопросы по предметам
              </h3>
              {questionsBySubjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={questionsBySubjectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="subject" stroke="var(--color-text-muted)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Вопросы" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                  Нет данных
                </div>
              )}
            </div>

            {/* Tests by exam type */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Тесты по типам экзаменов
              </h3>
              {testsByExamTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testsByExamTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="type" stroke="var(--color-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Тесты" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                  Нет данных
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ Tab: System ═══ */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {systemLoading ? (
              <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</div>
            ) : (
              <>
                {/* Cache */}
                {cacheStats && (
                  <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Кэш</h3>
                      <button
                        onClick={() => void handleClearCache()}
                        className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Очистить кэш
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MiniStat label="Hit Rate" value={cacheStats.hitRate} />
                      <MiniStat label="Размер" value={String(cacheStats.size)} />
                      <MiniStat label="Попадания" value={String(cacheStats.hits)} />
                      <MiniStat label="Промахи" value={String(cacheStats.misses)} />
                    </div>
                  </div>
                )}

                {/* DB records */}
                {systemInfo && (
                  <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Записи в базе данных</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: 'var(--color-bg-secondary)' }}>
                            <Th>Таблица</Th>
                            <Th align="right">Записей</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              ['Пользователи', systemInfo.users],
                              ['Тесты', systemInfo.tests],
                              ['Вопросы', systemInfo.questions],
                              ['Попытки тестов', systemInfo.testAttempts],
                              ['Классы', systemInfo.classrooms],
                              ['Достижения', systemInfo.achievements],
                              ['Уведомления', systemInfo.notifications],
                              ['Дуэли', systemInfo.duels],
                              ['Марафоны', systemInfo.marathonRuns],
                              ['SRS карточки', systemInfo.srsCards],
                            ] as const
                          ).map(([label, count]) => (
                            <tr key={label} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td className="px-4 py-2.5 text-sm" style={{ color: 'var(--color-text)' }}>{label}</td>
                              <td className="px-4 py-2.5 text-sm text-right font-mono font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                {count.toLocaleString('ru-RU')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ Modals ═══ */}

        {/* Delete User Modal */}
        {deletingUserId && (
          <ConfirmModal
            title="Удалить пользователя?"
            description="Это действие необратимо. Все данные пользователя будут удалены."
            onConfirm={() => void handleDeleteUser()}
            onCancel={() => setDeletingUserId(null)}
            confirmLabel="Удалить"
          />
        )}

        {/* Delete Classroom Modal */}
        {deletingClassroomId && (
          <ConfirmModal
            title="Удалить класс?"
            description="Все участники будут удалены из класса. Это действие необратимо."
            onConfirm={() => void handleDeleteClassroom()}
            onCancel={() => setDeletingClassroomId(null)}
            confirmLabel="Удалить"
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
            <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 id="edit-user-title" className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                Редактирование пользователя
              </h2>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{editingUser.email}</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="role-select" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Роль
                  </label>
                  <select
                    id="role-select"
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="input"
                  >
                    <option value="USER">Пользователь</option>
                    <option value="ADMIN">Администратор</option>
                    <option value="TEACHER">Учитель</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary flex-1"
                >
                  Отмена
                </button>
                <button
                  onClick={() => void handleSaveUser()}
                  className="btn btn-primary flex-1"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function StatCard({ value, label, sub, color }: { value: string | number; label: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-amber-100 text-amber-700',
    TEACHER: 'bg-pink-100 text-pink-700',
    USER: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] ?? colors.USER}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' | 'left' }) {
  return (
    <th
      className={`px-4 py-3 text-sm font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: 'var(--color-text-secondary)' }}
    >
      {children}
    </th>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn btn-secondary text-sm disabled:opacity-50"
      >
        Назад
      </button>
      <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {page} из {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn btn-secondary text-sm disabled:opacity-50"
      >
        Вперёд
      </button>
    </div>
  );
}

function ConfirmModal({ title, description, onConfirm, onCancel, confirmLabel }: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">&#9888;&#65039;</span>
          </div>
          <h3 id="confirm-modal-title" className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">
            Отмена
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
