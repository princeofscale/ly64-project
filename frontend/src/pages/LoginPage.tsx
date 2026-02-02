import {
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  Check,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authService } from '../services/authService';

import type { FormEvent } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShake(false);

    try {
      await authService.login(formData);
      toast.success('Вход выполнен успешно!');
      setTimeout(async () => navigate('/dashboard'), 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Неверный email или пароль';
      setError(errorMessage);
      setShake(true);
      toast.error(errorMessage);
      setTimeout(() => setShake(false), 650);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Gradient Background with Branding */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full min-h-[400px] lg:min-h-screen px-8 lg:px-16 py-12 text-white animate-slide-in-left">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">LY64</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Добро пожаловать
              <br />
              обратно!
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Войдите в свой аккаунт и продолжите управление вашими проектами
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-white/90">Безопасная аутентификация</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-white/90">Быстрый доступ к проектам</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-white/90">Современный интерфейс</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="hidden lg:block absolute bottom-8 right-8 opacity-20">
            <div className="w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="w-24 h-24 border-4 border-white rounded-full absolute top-4 left-4"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center px-8 py-12 bg-slate-50 dark:bg-slate-900 relative">
        {/* Back Link - Desktop */}
        <Link
          to="/"
          className="hidden lg:flex absolute top-8 left-8 items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          На главную
        </Link>

        <div className="w-full max-w-md animate-slide-in-right">
          {/* Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Вход в аккаунт
              </h2>
              <p className="text-slate-500 dark:text-slate-400">Введите ваши данные для входа</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
              {/* Email Input with Icon */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="email"
                    placeholder="ivan@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input with Icon */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    placeholder="Введите пароль"
                    className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center">
                      {rememberMe && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    Запомнить меня
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Забыли пароль?
                </Link>
              </div>

              {/* Submit Button with Gradient */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Вход...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Войти</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Нет аккаунта?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>

          {/* Back Link - Mobile */}
          <div className="mt-6 text-center lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              На главную
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.65s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
