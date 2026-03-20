import {
  Menu,
  LayoutDashboard,
  User,
  Trophy,
  BarChart3,
  BookOpen,
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
  Zap,
  Network,
  Swords,
  FileText,
  Bookmark,
  Brain,
  Users,
  ClipboardList,
  Landmark,
  FunctionSquare,
  Languages,
  Search,
  LifeBuoy,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="backdrop-blur-lg border-b sticky top-0 z-50" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', borderColor: 'var(--color-border)' }}>
      <div className="container-wide py-3">
        <div className="flex justify-between items-center">
          {}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Лицей №64</p>
              <p className="text-xs -mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Саратов</p>
            </div>
          </Link>

          {}
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchOpen(true)}
                  title="Поиск (Ctrl+K)"
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label="Открыть поиск"
                >
                  <Search className="w-5 h-5" />
                </button>
                <NotificationBell />
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary, var(--color-surface))', color: 'var(--color-text-secondary)' }}
                  aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                  <span className="font-medium text-sm hidden sm:block">Меню</span>
                </button>

                {}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[340px] border rounded-2xl shadow-xl z-50 animate-scale-in flex flex-col max-h-[calc(100vh-80px)]" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    {/* User info */}
                    <div className="px-4 py-3 border-b rounded-t-2xl flex items-center gap-3 shrink-0" style={{ backgroundColor: 'var(--color-bg-secondary, var(--color-bg))', borderColor: 'var(--color-border)' }}>
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                          {user?.name || 'Пользователь'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                      </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto overscroll-contain p-2 space-y-1">
                      {/* Main */}
                      <div className="grid grid-cols-2 gap-1">
                        <MenuItemCompact to="/dashboard" icon={LayoutDashboard} label="Главная" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/profile" icon={User} label="Профиль" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/settings" icon={Settings} label="Настройки" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/leaderboard" icon={Trophy} label="Рейтинг" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/error-analysis" icon={BarChart3} label="Ошибки" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/theory" icon={BookOpen} label="Справочник" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/knowledge-map" icon={Network} label="Карта знаний" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/analytics" icon={BarChart3} label="Аналитика" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/test-history" icon={ClipboardList} label="История" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/classroom" icon={Users} label="Классы" onClick={() => setIsMenuOpen(false)} />
                        <MenuItemCompact to="/support" icon={LifeBuoy} label="Поддержка" onClick={() => setIsMenuOpen(false)} />
                      </div>

                      {/* Trainers */}
                      <div className="pt-1">
                        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Тренажёры</p>
                        <div className="grid grid-cols-3 gap-1">
                          <MenuItemCompact to="/spin-wheel" icon={CircleDot} label="Колесо" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/flashcards" icon={Layers} label="Карточки" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/problem-generator" icon={Dices} label="Генератор" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/daily-challenge" icon={Flame} label="Вызов дня" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/marathon" icon={Zap} label="Марафон" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/duel" icon={Swords} label="Дуэли" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/spaced-repetition" icon={Brain} label="Повторение" onClick={() => setIsMenuOpen(false)} />
                        </div>
                      </div>

                      {/* Utilities */}
                      <div className="pt-1">
                        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Инструменты</p>
                        <div className="grid grid-cols-3 gap-1">
                          <MenuItemCompact to="/cheat-sheets" icon={FileText} label="Шпаргалки" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/notes" icon={StickyNote} label="Заметки" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/bookmarks" icon={Bookmark} label="Закладки" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/formula-calculator" icon={Calculator} label="Калькулятор" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/unit-converter" icon={Ruler} label="Конвертер" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/periodic-table" icon={FlaskConical} label="Менделеева" onClick={() => setIsMenuOpen(false)} />
                        </div>
                      </div>

                      {/* References */}
                      <div className="pt-1">
                        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Справочники</p>
                        <div className="grid grid-cols-3 gap-1">
                          <MenuItemCompact to="/glossary" icon={BookOpen} label="Словарь" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/timeline" icon={Landmark} label="Лента ист." onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/history-figures" icon={Users} label="Деятели" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/trig-table" icon={FunctionSquare} label="Тригоном." onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/calc-table" icon={FunctionSquare} label="Произв./∫" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/literature" icon={BookOpen} label="Литература" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/physics-constants" icon={FlaskConical} label="Константы" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/chemistry-reactions" icon={FlaskConical} label="Реакции" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/social-terms" icon={BookOpen} label="Общество" onClick={() => setIsMenuOpen(false)} />
                          <MenuItemCompact to="/irregular-verbs" icon={Languages} label="Глаголы англ." onClick={() => setIsMenuOpen(false)} />
                        </div>
                      </div>
                    </div>

                    {/* Footer: admin + logout — always visible */}
                    <div className="shrink-0 border-t p-2 rounded-b-2xl" style={{ borderColor: 'var(--color-border)' }}>
                      {user?.role === 'ADMIN' && (
                        <>
                          <MenuItemCompact
                            to="/admin"
                            icon={Settings}
                            label="Админ-панель"
                            onClick={() => setIsMenuOpen(false)}
                            highlight
                          />
                          <MenuItemCompact
                            to="/admin/support"
                            icon={LifeBuoy}
                            label="Тикеты"
                            onClick={() => setIsMenuOpen(false)}
                            highlight
                          />
                        </>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            void handleLogout();
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Выйти</span>
                        </button>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
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
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

interface MenuItemCompactProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

function MenuItemCompact({ to, icon: Icon, label, onClick, highlight }: MenuItemCompactProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`menu-item-hover flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${
        highlight ? 'text-amber-600' : ''
      }`}
      style={{ color: highlight ? undefined : 'var(--color-text-secondary)' }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium truncate">{label}</span>
    </Link>
  );
}
