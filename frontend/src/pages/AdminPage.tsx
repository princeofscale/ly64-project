import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

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
}

const DIRECTION_LABELS: Record<string, string> = {
  PROGRAMMING: 'Программирование',
  ROBOTICS: 'Робототехника',
  MEDICINE: 'Медицина будущего',
  BIOTECHNOLOGY: 'Биотехнологии',
  CULTURE: 'Культура',
};

const ROLE_LABELS: Record<string, string> = {
  USER: 'Пользователь',
  ADMIN: 'Администратор',
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Доступ запрещён');
      navigate('/dashboard');
      return;
    }
    loadStats();
    loadUsers();
  }, [user, navigate]);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({
      role: u.role,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success('Пользователь обновлён');
        setEditingUser(null);
        loadUsers();
      } else {
        toast.error('Ошибка обновления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Пользователь удалён');
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Ошибка удаления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">
          Панель администратора
        </h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-slate-600">Всего пользователей</div>
              <div className="text-xs text-emerald-600 mt-1">+{stats.usersToday} сегодня</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-violet-600">{stats.totalTests}</div>
              <div className="text-sm text-slate-600">Всего тестов пройдено</div>
              <div className="text-xs text-emerald-600 mt-1">+{stats.testsToday} сегодня</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-amber-600">
                {stats.usersByRole?.ADMIN || 0}
              </div>
              <div className="text-sm text-slate-600">Администраторов</div>
              <div className="text-xs text-slate-500 mt-1">
                {stats.usersByRole?.USER || 0} обычных пользователей
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по email, имени..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-[200px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Все роли</option>
            <option value="USER">Пользователи</option>
            <option value="ADMIN">Администраторы</option>
          </select>
        </div>

        {/* Users table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Загрузка...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                        Пользователь
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                        Роль
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                        Направление
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                        Тесты
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                        Дата
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-sm text-slate-600">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {u.desiredDirection
                            ? DIRECTION_LABELS[u.desiredDirection] || u.desiredDirection
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{u._count.testAttempts}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Изменить
                            </button>
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    Назад
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600">
                    Страница {page} из {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    Вперёд
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Редактирование пользователя</h2>
              <p className="text-slate-600 mb-6">{editingUser.email}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Роль</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="USER">Пользователь</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
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
