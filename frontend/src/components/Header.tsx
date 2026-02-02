import {
  Menu,
  LayoutDashboard,
  User,
  Trophy,
  BarChart3,
  CircleDot,
  Layers,
  Dices,
  Flame,
  Calculator,
  FlaskConical,
  Ruler,
  StickyNote,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold text-slate-900">Лицей №64</p>
              <p className="text-xs text-slate-500 -mt-0.5">Саратов</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                  <span className="font-medium text-sm hidden sm:block">Меню</span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50 animate-scale-in">
                    {/* User Info */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {user?.name || 'Пользователь'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="p-2">
                      <MenuItem
                        to="/dashboard"
                        icon={LayoutDashboard}
                        label="Панель управления"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/profile"
                        icon={User}
                        label="Мой профиль"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/leaderboard"
                        icon={Trophy}
                        label="Рейтинг"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/error-analysis"
                        icon={BarChart3}
                        label="Анализ ошибок"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    </div>

                    {/* Games & Activities */}
                    <div className="p-2 border-t border-slate-100">
                      <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Тренажёры
                      </p>
                      <MenuItem
                        to="/spin-wheel"
                        icon={CircleDot}
                        label="Колесо фортуны"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/flashcards"
                        icon={Layers}
                        label="Флеш-карточки"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/problem-generator"
                        icon={Dices}
                        label="Генератор задач"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/daily-challenge"
                        icon={Flame}
                        label="Ежедневный вызов"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    </div>

                    {/* Tools */}
                    <div className="p-2 border-t border-slate-100">
                      <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Инструменты
                      </p>
                      <MenuItem
                        to="/formula-calculator"
                        icon={Calculator}
                        label="Калькулятор"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/periodic-table"
                        icon={FlaskConical}
                        label="Таблица Менделеева"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/unit-converter"
                        icon={Ruler}
                        label="Конвертер единиц"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/notes"
                        icon={StickyNote}
                        label="Заметки"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    </div>

                    {/* Admin */}
                    {user?.role === 'ADMIN' && (
                      <div className="p-2 border-t border-slate-100">
                        <MenuItem
                          to="/admin"
                          icon={Settings}
                          label="Админ-панель"
                          onClick={() => setIsMenuOpen(false)}
                          highlight
                        />
                      </div>
                    )}

                    {/* Logout */}
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Выйти из аккаунта</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                >
                  Начать обучение
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

interface MenuItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

function MenuItem({ to, icon: Icon, label, onClick, highlight }: MenuItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
        ${
          highlight
            ? 'text-amber-600 hover:bg-amber-50'
            : 'text-slate-700 hover:bg-slate-100'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
