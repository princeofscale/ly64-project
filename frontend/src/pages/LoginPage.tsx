import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as any)?.email || '';

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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Неверный email или пароль';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-cyan-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Вход
            </h1>
            <p className="text-gray-400 text-lg font-sans">
              Войдите в свой аккаунт
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                placeholder="ivan.ivanov@example.com"
              />
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Input
                label="Пароль"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className="text-gray-400 font-sans">
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-semibold border-b border-cyan-400/0 hover:border-cyan-400 transition-all"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-300 text-sm font-sans flex items-center justify-center gap-2 group transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Вернуться на главную
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <p className="text-gray-500 text-sm font-sans">
            Защищенный вход через{' '}
            <span className="text-cyan-400 font-mono">HTTPS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
