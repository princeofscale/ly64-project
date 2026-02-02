import { Eye, EyeOff, ArrowLeft, GraduationCap, Mail, Lock } from 'lucide-react';
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
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(formData);
      toast.success('Вход выполнен успешно!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Неверный email или пароль';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-100/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Лицей-интернат №64</p>
            <p className="text-sm text-slate-500">Платформа подготовки</p>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Добро пожаловать!</h1>
            <p className="text-slate-500">Войдите, чтобы продолжить обучение</p>
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
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 disabled:shadow-none flex items-center justify-center gap-2"
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
