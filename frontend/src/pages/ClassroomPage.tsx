import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface TeacherClassroom {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  createdAt: string;
}

interface StudentClassroom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  joinedAt: string;
}

interface StudentStats {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  testsCompleted: number;
  avgScore: number;
  bestScore: number;
}

export default function ClassroomPage() {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [teacherClassrooms, setTeacherClassrooms] = useState<TeacherClassroom[]>([]);
  const [studentClassrooms, setStudentClassrooms] = useState<StudentClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    void loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      const data = res.data.data;
      setTeacherClassrooms(data.teacher || []);
      setStudentClassrooms(data.student || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newClassName.trim()) return;
    try {
      await api.post('/classrooms', { name: newClassName.trim() });
      setNewClassName('');
      toast.success('Класс создан');
      void loadClassrooms();
    } catch {
      toast.error('Ошибка создания класса');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      await api.post('/classrooms/join', { code: joinCode.trim() });
      setJoinCode('');
      toast.success('Вы присоединились к классу');
      void loadClassrooms();
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ошибка';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить класс? Это действие нельзя отменить.')) return;
    try {
      await api.delete(`/classrooms/${id}`);
      toast.success('Класс удалён');
      void loadClassrooms();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const handleExpand = async (classroomId: string) => {
    if (expandedClassroom === classroomId) {
      setExpandedClassroom(null);
      return;
    }
    setExpandedClassroom(classroomId);
    setLoadingStudents(true);
    try {
      const res = await api.get(`/classrooms/${classroomId}/students`);
      setStudents(res.data.data || []);
    } catch {
      toast.error('Ошибка загрузки учеников');
    } finally {
      setLoadingStudents(false);
    }
  };

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    toast.success('Код скопирован');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Классы</h1>

        {/* Teacher view: Create classroom */}
        {isTeacher && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Создать класс</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Название класса"
                className="flex-1 px-4 py-2 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={() => void handleCreate()}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Создать
              </button>
            </div>
          </div>
        )}

        {/* Student: Join classroom */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Присоединиться к классу</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Код класса (6 символов)"
              maxLength={6}
              className="flex-1 px-4 py-2 rounded-xl border text-sm font-mono tracking-wider"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={() => void handleJoin()}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Присоединиться
            </button>
          </div>
        </div>

        {/* Teacher classrooms */}
        {isTeacher && teacherClassrooms.length > 0 && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Мои классы (учитель)</h2>
            <div className="space-y-3">
              {teacherClassrooms.map(c => (
                <div key={c.id}>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:shadow-sm transition-shadow"
                    style={{ borderColor: 'var(--color-border)' }}
                    onClick={() => void handleExpand(c.id)}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                      <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <span>
                          Код:{' '}
                          <button
                            onClick={e => { e.stopPropagation(); copyCode(c.code); }}
                            className="font-mono font-bold text-blue-600 hover:underline"
                          >
                            {c.code}
                          </button>
                        </span>
                        <span>{c.memberCount} уч.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); void handleDelete(c.id); }}
                        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Удалить
                      </button>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {expandedClassroom === c.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded student list */}
                  {expandedClassroom === c.id && (
                    <div className="ml-4 mt-2 space-y-2">
                      {loadingStudents ? (
                        <div className="py-4 text-center">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      ) : students.length === 0 ? (
                        <p className="text-sm py-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                          Пока нет учеников
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{ color: 'var(--color-text-secondary)' }}>
                                <th className="text-left py-2 px-3 font-medium">Ученик</th>
                                <th className="text-center py-2 px-3 font-medium">Тестов</th>
                                <th className="text-center py-2 px-3 font-medium">Средний</th>
                                <th className="text-center py-2 px-3 font-medium">Лучший</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map(s => (
                                <tr key={s.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                  <td className="py-2 px-3" style={{ color: 'var(--color-text)' }}>{s.name}</td>
                                  <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text)' }}>{s.testsCompleted}</td>
                                  <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text)' }}>{s.avgScore}%</td>
                                  <td className="py-2 px-3 text-center" style={{ color: 'var(--color-text)' }}>{s.bestScore}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student classrooms */}
        {studentClassrooms.length > 0 && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Мои классы (ученик)</h2>
            <div className="space-y-3">
              {studentClassrooms.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Присоединились: {new Date(c.joinedAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {teacherClassrooms.length === 0 && studentClassrooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {isTeacher ? 'Создайте свой первый класс' : 'Введите код, чтобы присоединиться к классу'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
