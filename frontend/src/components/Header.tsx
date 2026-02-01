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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-50 hidden sm:block">
              Лицей №64
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                  <span className="font-medium text-sm hidden sm:block">Меню</span>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50 animate-scale-in">
                    {/* User Info */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                        {user?.name || user?.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {/* Main Navigation */}
                    <div className="py-1">
                      <MenuItem
                        to="/dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/profile"
                        icon={User}
                        label="Профиль"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MenuItem
                        to="/leaderboard"
                        icon={Trophy}
                        label="Лидеры"
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
                    <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                      <p className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Активности
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
                        label="Ежедневный челлендж"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    </div>

                    {/* Tools */}
                    <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                      <p className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                      <div className="py-1 border-t border-slate-200 dark:border-slate-700">
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
                    <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Выйти</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Регистрация
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
        flex items-center gap-3 px-3 py-2.5 transition-colors
        ${
          highlight
            ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
