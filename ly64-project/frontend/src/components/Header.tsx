import {
  Menu,
  LayoutDashboard,
  User,
  Trophy,
  BarChart3,
  Calculator,
  FlaskConical,
  Ruler,
  StickyNote,
  Settings,
  LogOut,
  Rocket,
  Disc3,
  Gamepad2,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isRocketPage = location.pathname === '/rocket';
  const displayBalance = user?.rutheniumBalance ?? 0;
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
    <header className={`backdrop-blur-lg border-b sticky top-0 z-50 ${
      isRocketPage
        ? 'bg-slate-950/80 border-slate-800'
        : 'bg-white/90 border-slate-200'
    }`}>
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105 ${
              isRocketPage
                ? 'bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-indigo-600/30'
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-600/25'
            }`}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className={`text-base font-bold ${isRocketPage ? 'text-white' : 'text-slate-900'}`}>Lyceum 64</p>
              <p className={`text-xs -mt-0.5 ${isRocketPage ? 'text-slate-400' : 'text-slate-500'}`}>Проект 9Р класса</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/games"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 transition-colors"
                title="Игры"
              >
                <Gamepad2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Игры</span>
                <span className="text-[10px] tabular-nums text-amber-600 font-bold">
                  {displayBalance.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} Ɍ
                </span>
              </Link>
            )}
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

                    {/* Games */}
                    <div className="p-2 border-t border-slate-100">
                      <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        Игры
                      </p>
                      <MenuItem
                        to="/games"
                        icon={Gamepad2}
                        label="Все игры"
                        onClick={() => setIsMenuOpen(false)}
                        highlight
                      />
                      <MenuItem
                        to="/rocket"
                        icon={Rocket}
                        label="Ракетка"
                        onClick={() => setIsMenuOpen(false)}
                        highlight
                      />
                      <MenuItem
                        to="/roulette"
                        icon={Disc3}
                        label="Европейская рулетка"
                        onClick={() => setIsMenuOpen(false)}
                        highlight
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
