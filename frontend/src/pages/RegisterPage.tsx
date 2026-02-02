import {
  DIRECTION_LABELS,
  AVAILABLE_GRADES,
  CURRENT_GRADE_LABELS,
  USER_STATUS_LABELS,
} from '@lyceum64/shared';
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Compass,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Zap,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

import type { FormEvent } from 'react';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  status: 'STUDENT' | 'APPLICANT';
  currentGrade: number;
  desiredDirection: string;
  motivation: string;
  agreedToTerms: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showExistingEmailModal, setShowExistingEmailModal] = useState(false);

  const [students, setStudents] = useState<string[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    status: 'APPLICANT',
    currentGrade: 8,
    desiredDirection: '',
    motivation: '',
    agreedToTerms: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter(student => student.toLowerCase().includes(studentSearch.toLowerCase()))
    .slice(0, 10);

  const validateEmail = (email: string): string => {
    if (!email) return '';

    if (/[а-яА-ЯёЁ]/.test(email)) {
      return 'Email не может содержать кириллицу. Используйте только латинские буквы';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Некорректный формат email. Пример: example@gmail.com';
    }

    const localPart = email.split('@')[0];
    if (localPart.length < 3) {
      return 'Часть email до @ должна содержать минимум 3 символа';
    }

    const randomPattern = /^[a-z]{10,}$/i;
    if (randomPattern.test(localPart.replace(/[0-9._+-]/g, ''))) {
      return 'Email выглядит подозрительно. Используйте настоящий адрес';
    }

    return '';
  };

  const updateField = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'email') {
      setEmailTouched(true);
      setEmailError(validateEmail(value));
    }
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-700' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longLength: password.length >= 12,
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;

    if (checks.special) score += 10;
    if (checks.longLength) score += 10;

    let label = '';
    let color = '';

    if (score < 60) {
      label = 'Слабый';
      color = 'from-red-500 to-red-600';
    } else if (score < 80) {
      label = 'Средний';
      color = 'from-yellow-500 to-orange-500';
    } else {
      label = 'Сильный';
      color = 'from-green-500 to-emerald-500';
    }

    return { score, label, color };
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Укажите ваше имя');
      return false;
    }

    if (!formData.email || emailError) {
      toast.error('Исправьте ошибки в email');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      toast.error('Пароль должен содержать строчную букву');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Пароль должен содержать заглавную букву');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error('Пароль должен содержать цифру');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return false;
    }

    if (formData.status === 'STUDENT' && !formData.name) {
      toast.error('Выберите своё имя из списка учащихся');
      return false;
    }

    if (formData.status === 'APPLICANT' && formData.motivation && formData.motivation.length < 50) {
      toast.error('Мотивация должна содержать минимум 50 символов');
      return false;
    }

    if (!formData.agreedToTerms) {
      toast.error('Необходимо согласиться с условиями использования');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          status: formData.status,
          currentGrade: formData.currentGrade,
          desiredDirection: formData.desiredDirection || undefined,
          motivation: formData.motivation || undefined,
          agreedToTerms: formData.agreedToTerms,
          authProvider: 'EMAIL',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message && data.message.includes('уже существует')) {
          setShowExistingEmailModal(true);
        } else if (data.errors && Array.isArray(data.errors)) {
          const emailErrors = data.errors.filter((e: any) => e.path && e.path.includes('email'));
          if (emailErrors.length > 0) {
            setEmailError(emailErrors[0].message);
            setEmailTouched(true);
            toast.error('Пожалуйста, исправьте ошибки в форме');
          } else {
            toast.error(data.errors[0]?.message || 'Ошибка валидации данных');
          }
        } else {
          toast.error(data.message || 'Ошибка регистрации');
        }
        return;
      }

      setShowSuccess(true);
      toast.success('Регистрация успешна!');

      useAuthStore
        .getState()
        .login(data.data.user, data.data.token, data.data.refreshToken, data.data.expiresIn);

      setTimeout(async () => navigate('/dashboard'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Gradient Background with Branding */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-700 dark:via-blue-700 dark:to-purple-700 overflow-hidden">
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
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">LY64</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Начните обучение
              <br />
              сегодня!
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Присоединяйтесь к платформе и откройте новые возможности для вашего развития
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center gap-3 group animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-white/90">Безопасная регистрация</span>
            </div>
            <div
              className="flex items-center gap-3 group animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-white/90">Быстрый доступ к материалам</span>
            </div>
            <div
              className="flex items-center gap-3 group animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-white/90">Индивидуальный подход</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="hidden lg:block absolute bottom-8 right-8 opacity-20">
            <div className="w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="w-24 h-24 border-4 border-white rounded-full absolute top-4 left-4"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="lg:w-1/2 flex items-center justify-center px-8 py-12 bg-slate-50 dark:bg-slate-900 relative overflow-y-auto">
        {/* Back Link - Desktop */}
        <Link
          to="/"
          className="hidden lg:flex absolute top-8 left-8 items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          На главную
        </Link>

        <div className="w-full max-w-md animate-slide-in-right my-8 lg:my-0">
          {/* Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 lg:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                Регистрация
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Заполните форму для создания аккаунта
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input with Icon */}
              <div className="group animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Имя и фамилия
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    required
                    placeholder="Иван Иванов"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Input with Icon */}
              <div className="group animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    required
                    placeholder="ivan@example.com"
                    className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/50 border-2 ${
                      emailTouched && emailError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/10'
                    } rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:ring-4 outline-none transition-all duration-200`}
                  />
                  {emailTouched && !emailError && formData.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {emailTouched && emailError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
                    <span className="mt-0.5">⚠</span>
                    <span>{emailError}</span>
                  </p>
                )}
                {emailTouched && !emailError && formData.email && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Email корректный</span>
                  </p>
                )}
              </div>

              {/* Password Input with Icon */}
              <div className="group animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    required
                    placeholder="Минимум 8 символов"
                    className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Сила пароля:</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength.score < 60
                            ? 'text-red-500'
                            : passwordStrength.score < 80
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${passwordStrength.color} transition-all duration-500`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            formData.password.length >= 8 ? 'text-green-500' : 'text-slate-400'
                          }
                        >
                          {formData.password.length >= 8 ? '✓' : '○'}
                        </span>
                        <span>8+ символов</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            /[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'
                          }
                        >
                          {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Заглавная</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            /[a-z]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'
                          }
                        >
                          {/[a-z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Строчная</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            /[0-9]/.test(formData.password) ? 'text-green-500' : 'text-slate-400'
                          }
                        >
                          {/[0-9]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Цифра</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="group animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => updateField('confirmPassword', e.target.value)}
                    required
                    placeholder="Повторите пароль"
                    className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-900/50 border-2 ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/10'
                    } rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:ring-4 outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {passwordsMatch && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>⚠</span>
                    <span>Пароли не совпадают</span>
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Пароли совпадают</span>
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Ваш статус
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('status', 'APPLICANT')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.status === 'APPLICANT'
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        formData.status === 'APPLICANT'
                          ? 'text-cyan-700 dark:text-cyan-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {USER_STATUS_LABELS.APPLICANT}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('status', 'STUDENT')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.status === 'STUDENT'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        formData.status === 'STUDENT'
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {USER_STATUS_LABELS.STUDENT}
                    </div>
                  </button>
                </div>
              </div>

              {/* Student Selector (if STUDENT) */}
              {formData.status === 'STUDENT' && (
                <div className="relative animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Выберите свое имя
                  </label>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => {
                      setStudentSearch(e.target.value);
                      updateField('name', '');
                      setShowStudentDropdown(true);
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    placeholder={studentsLoading ? 'Загрузка...' : 'Начните вводить ФИО...'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                    disabled={studentsLoading}
                  />
                  {showStudentDropdown && filteredStudents.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {filteredStudents.map((student, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateField('name', student);
                            setStudentSearch(student);
                            setShowStudentDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                        >
                          {student}
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.name && formData.status === 'STUDENT' && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>Выбрано: {formData.name}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Grade Selector */}
              <div className="group animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Текущий класс
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <select
                    value={formData.currentGrade}
                    onChange={e => updateField('currentGrade', parseInt(e.target.value))}
                    className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {AVAILABLE_GRADES.map(grade => (
                      <option key={grade} value={grade}>
                        {CURRENT_GRADE_LABELS[grade]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Direction Selector (for APPLICANT) */}
              {formData.status === 'APPLICANT' && (
                <div className="group animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Желаемое направление (необязательно)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors pointer-events-none">
                      <Compass className="w-5 h-5" />
                    </div>
                    <select
                      value={formData.desiredDirection}
                      onChange={e => updateField('desiredDirection', e.target.value)}
                      className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Выберите направление</option>
                      {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Motivation (for APPLICANT) */}
              {formData.status === 'APPLICANT' && (
                <div className="group animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Мотивация (необязательно)
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.motivation}
                      onChange={e => updateField('motivation', e.target.value)}
                      placeholder="Расскажите, почему хотите поступить в лицей (минимум 50 символов)"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200 resize-none"
                    />
                  </div>
                  {formData.motivation && (
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span
                        className={`${
                          formData.motivation.length >= 50
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {formData.motivation.length >= 50
                          ? '✓ Готово'
                          : `${formData.motivation.length}/50`}
                      </span>
                      <span className="text-slate-400">{formData.motivation.length}/1000</span>
                    </div>
                  )}
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={e => updateField('agreedToTerms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-cyan-600 peer-checked:border-cyan-600 transition-all duration-200 flex items-center justify-center">
                      {formData.agreedToTerms && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Я прочитал и согласен с{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                    >
                      условиями использования
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button with Gradient */}
              <button
                type="submit"
                disabled={loading || !formData.agreedToTerms}
                className="relative w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Регистрация...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Зарегистрироваться</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.55s' }}>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Уже есть аккаунт?{' '}
                <Link
                  to="/login"
                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                >
                  Войти
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

      {/* Existing Email Modal */}
      {showExistingEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-cyan-500/30">
                <Mail className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                Аккаунт уже существует
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Пользователь с email{' '}
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {formData.email}
                </span>{' '}
                уже зарегистрирован
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowExistingEmailModal(false);
                  navigate('/login', { state: { email: formData.email } });
                }}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Войти в аккаунт
              </button>
              <button
                onClick={() => {
                  setShowExistingEmailModal(false);
                  setFormData(prev => ({ ...prev, email: '' }));
                  setEmailError('');
                  setEmailTouched(false);
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-300"
              >
                Изменить email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce-in border-2 border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                Регистрация успешна!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-2">Добро пожаловать в LY64</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Перенаправление в личный кабинет...
              </p>
            </div>
          </div>
        </div>
      )}

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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
