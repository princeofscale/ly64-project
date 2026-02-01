import {
  DIRECTION_LABELS,
  AVAILABLE_GRADES,
  CURRENT_GRADE_LABELS,
  USER_STATUS_LABELS,
} from '@lyceum64/shared';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressBar } from '../components/ProgressBar';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { useAuthStore } from '../store/authStore';

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
  const [step, setStep] = useState(1);
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

  const totalSteps = formData.status === 'STUDENT' ? 4 : 5;

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
      color = 'bg-gradient-to-r from-red-500 to-red-600';
    } else if (score < 80) {
      label = 'Средний';
      color = 'bg-gradient-to-r from-yellow-500 to-orange-500';
    } else {
      label = 'Сильный';
      color = 'bg-gradient-to-r from-green-500 to-emerald-500';
    }

    return { score, label, color };
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        toast.error('Заполните все поля');
        return false;
      }
      if (emailError) {
        toast.error('Исправьте ошибки в форме');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Пароли не совпадают');
        return false;
      }
      if (formData.password.length < 8) {
        toast.error('Пароль должен содержать минимум 8 символов');
        return false;
      }
      if (!/[a-z]/.test(formData.password)) {
        toast.error('Пароль должен содержать хотя бы одну строчную букву');
        return false;
      }
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('Пароль должен содержать хотя бы одну заглавную букву');
        return false;
      }
      if (!/[0-9]/.test(formData.password)) {
        toast.error('Пароль должен содержать хотя бы одну цифру');
        return false;
      }
    } else if (step === 2) {
      if (formData.status === 'STUDENT' && !formData.name) {
        toast.error('Выберите своё имя из списка учащихся');
        return false;
      }
    } else if (step === 4 && formData.status === 'APPLICANT') {
      if (!formData.motivation || formData.motivation.length < 50) {
        toast.error('Мотивация должна содержать минимум 50 символов');
        return false;
      }
    } else if (step === totalSteps) {
      if (!formData.agreedToTerms) {
        toast.error('Необходимо согласиться с условиями использования');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
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
            setStep(1);
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

      toast.success('Регистрация успешна!');

      useAuthStore
        .getState()
        .login(data.data.user, data.data.token, data.data.refreshToken, data.data.expiresIn);

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = step;
  const displayTotalSteps = totalSteps;

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Регистрация
            </h1>
            <p className="text-gray-400 text-lg font-sans">
              Начните подготовку к поступлению в лицей
            </p>
          </div>

          <ProgressBar current={currentStep} total={displayTotalSteps} className="mb-8" />

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                Основная информация
              </h2>

              <Input
                label="Имя и фамилия"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Иван Иванов"
                required
              />

              <div>
                <div className="mb-2">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="ivan.ivanov@example.com"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 font-sans">
                    Используйте настоящий email адрес. Только латинские буквы, цифры и символы . _ %
                    + -
                  </p>
                </div>
                {emailTouched && emailError && (
                  <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-300 font-sans">{emailError}</p>
                        <p className="text-xs text-red-400 mt-1 font-sans">
                          Пожалуйста, исправьте email чтобы продолжить
                        </p>
                        <div className="mt-3 text-xs text-gray-400">
                          <p className="font-medium mb-2 font-sans">Примеры правильных email:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-500 font-mono">
                            <li>ivan.petrov@gmail.com</li>
                            <li>student2024@mail.ru</li>
                            <li>my.email@yandex.ru</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {emailTouched && !emailError && formData.email && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-400 font-sans">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Email корректный</span>
                  </div>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    placeholder="Минимум 8 символов"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-400 font-sans">Сила пароля:</span>
                      <span
                        className={`font-semibold font-sans ${
                          getPasswordStrength(formData.password).score < 60
                            ? 'text-red-400'
                            : getPasswordStrength(formData.password).score < 80
                              ? 'text-yellow-400'
                              : 'text-green-400'
                        }`}
                      >
                        {getPasswordStrength(formData.password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getPasswordStrength(formData.password).color}`}
                        style={{ width: `${getPasswordStrength(formData.password).score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 space-y-2 font-sans">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            formData.password.length >= 8 ? 'text-green-400' : 'text-gray-600'
                          }
                        >
                          {formData.password.length >= 8 ? '✓' : '○'}
                        </span>
                        <span>Минимум 8 символов</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            /[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-600'
                          }
                        >
                          {/[a-z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Строчная буква</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            /[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-600'
                          }
                        >
                          {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Заглавная буква</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            /[0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-600'
                          }
                        >
                          {/[0-9]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Цифра</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
                              ? 'text-green-400'
                              : 'text-gray-600'
                          }
                        >
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
                            ? '✓'
                            : '○'}
                        </span>
                        <span>Специальный символ (необязательно)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Подтвердите пароль"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center">
                <span
                  className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                Ваш статус
              </h2>

              <button
                onClick={() => updateField('status', 'STUDENT')}
                className={`group w-full p-6 border-2 rounded-2xl transition-all duration-300 ${
                  formData.status === 'STUDENT'
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                    : 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="font-display font-semibold text-xl text-white">
                  {USER_STATUS_LABELS.STUDENT}
                </div>
              </button>

              {formData.status === 'STUDENT' && (
                <div className="relative animate-scale-in">
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-sans">
                    Выберите своё имя из списка учащихся
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
                    placeholder={studentsLoading ? 'Загрузка списка...' : 'Начните вводить ФИО...'}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                    disabled={studentsLoading}
                  />
                  {showStudentDropdown && filteredStudents.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl">
                      {filteredStudents.map((student, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            updateField('name', student);
                            setStudentSearch(student);
                            setShowStudentDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 focus:bg-cyan-500/10 focus:text-cyan-400 focus:outline-none transition-colors font-sans"
                        >
                          {student}
                        </button>
                      ))}
                    </div>
                  )}
                  {formData.name && formData.status === 'STUDENT' && (
                    <p className="mt-2 text-sm text-green-400 font-sans flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Выбрано: {formData.name}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => updateField('status', 'APPLICANT')}
                className={`group w-full p-6 border-2 rounded-2xl transition-all duration-300 ${
                  formData.status === 'APPLICANT'
                    ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="font-display font-semibold text-xl text-white">
                  {USER_STATUS_LABELS.APPLICANT}
                </div>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                Учебная информация
              </h2>

              <Select
                label="Текущий класс"
                value={formData.currentGrade.toString()}
                onChange={e => updateField('currentGrade', parseInt(e.target.value))}
                options={AVAILABLE_GRADES.map(grade => ({
                  value: grade.toString(),
                  label: CURRENT_GRADE_LABELS[grade],
                }))}
                required
              />

              {formData.status === 'APPLICANT' && (
                <Select
                  label="Желаемое направление"
                  value={formData.desiredDirection}
                  onChange={e => updateField('desiredDirection', e.target.value)}
                  options={[
                    { value: '', label: 'Выберите направление' },
                    ...Object.entries(DIRECTION_LABELS).map(([key, label]) => ({
                      value: key,
                      label,
                    })),
                  ]}
                />
              )}
            </div>
          )}

          {step === 4 && formData.status === 'APPLICANT' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center">
                <span
                  className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                Мотивация
              </h2>

              <Textarea
                label="Почему вы хотите поступить в лицей?"
                value={formData.motivation}
                onChange={e => updateField('motivation', e.target.value)}
                placeholder="Расскажите о своих целях и мотивации (минимум 50 символов)"
                rows={6}
                required
              />

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400 font-sans">
                  Символов:{' '}
                  <span
                    className={
                      formData.motivation.length >= 50 ? 'text-green-400' : 'text-gray-500'
                    }
                  >
                    {formData.motivation.length}
                  </span>{' '}
                  / 1000
                </p>
                {formData.motivation.length >= 50 && (
                  <span className="text-sm text-green-400 font-sans flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Готово
                  </span>
                )}
              </div>
            </div>
          )}

          {step === totalSteps && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-display font-semibold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                Условия использования
              </h2>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto backdrop-blur-sm">
                <p className="text-sm text-gray-300 font-sans leading-relaxed">
                  Регистрируясь на платформе, вы соглашаетесь с условиями использования...
                  <br />
                  <br />
                  Подробнее см.{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-cyan-400 hover:text-cyan-300 border-b border-cyan-400/0 hover:border-cyan-400 transition-all"
                  >
                    Условия использования
                  </Link>
                </p>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-800/30 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={e => updateField('agreedToTerms', e.target.checked)}
                  className="mt-1 h-5 w-5 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
                />
                <span className="text-sm text-gray-300 font-sans">
                  Я прочитал и согласен с{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-cyan-400 hover:text-cyan-300 border-b border-cyan-400/0 hover:border-cyan-400 transition-all"
                  >
                    условиями использования
                  </Link>
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700/50">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Назад
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && (!!emailError || !formData.email)}
              >
                Далее
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !formData.agreedToTerms}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6 font-sans">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold border-b border-cyan-400/0 hover:border-cyan-400 transition-all"
            >
              Войти
            </Link>
          </p>
        </div>

        {showExistingEmailModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-8 h-8 text-cyan-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-3">
                  Аккаунт уже существует
                </h3>
                <p className="text-gray-400 font-sans">
                  Пользователь с email{' '}
                  <span className="font-semibold text-cyan-400">{formData.email}</span> уже
                  зарегистрирован в системе
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowExistingEmailModal(false);
                    navigate('/login', { state: { email: formData.email } });
                  }}
                  className="w-full"
                >
                  Войти в аккаунт
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExistingEmailModal(false);
                    setStep(1);
                    setFormData(prev => ({ ...prev, email: '' }));
                    setEmailError('');
                    setEmailTouched(false);
                  }}
                  className="w-full"
                >
                  Изменить email
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
