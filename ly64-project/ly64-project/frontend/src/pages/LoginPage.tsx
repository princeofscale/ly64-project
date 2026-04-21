import { Eye, EyeOff, ArrowLeft, Rocket, Mail, Lock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

import { authService } from '../services/authService';

import type { FormEvent } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<{
    type: 'wrong_password' | 'locked' | 'error';
    message: string;
  } | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setLoginError(null);
    try {
      await authService.login(formData);
      toast.success('Вход выполнен успешно!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error: unknown) {
      const axiosError = error as any;
      const message =
        axiosError?.response?.data?.message ||
        (error instanceof Error ? error.message : 'Ошибка входа');
      const status = axiosError?.response?.status;

      if (status === 429) {
        setLoginError({ type: 'locked', message });
      } else if (status === 401) {
        setLoginError({ type: 'wrong_password', message });
      } else {
        setLoginError({ type: 'error', message });
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/40 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-fuchsia-200/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-xl group-hover:shadow-indigo-600/40 transition-all group-hover:scale-105">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Lyceum 64</p>
            <p className="text-xs text-slate-500">Проект 9Р класса · учебный</p>
          </div>
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-2xl shadow-blue-900/10 animate-fade-in ring-1 ring-slate-200/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Рады видеть вас снова
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">Добро пожаловать!</h1>
            <p className="text-sm text-slate-500">Войдите, чтобы продолжить обучение</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setLoginError(null); }}
                  required
                  autoComplete="email"
                  placeholder="ivan@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Пароль</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={e => { setFormData({ ...formData, password: e.target.value }); setLoginError(null); }}
                  required
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError?.type === 'locked' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
                <p className="text-sm">{loginError.message}</p>
              </div>
            )}

            {loginError?.type === 'wrong_password' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p className="text-sm">{loginError.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loginError?.type === 'locked'}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/40 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400">или</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-slate-600">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
