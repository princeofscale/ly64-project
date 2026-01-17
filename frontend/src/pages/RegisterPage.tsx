import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { ProgressBar } from '../components/ProgressBar';
import { useAuthStore } from '../store/authStore';
import {
  DIRECTION_LABELS,
  AVAILABLE_GRADES,
  CURRENT_GRADE_LABELS,
  USER_STATUS_LABELS,
} from '@lyceum64/shared';

interface RegisterFormData {
  authMethod: 'email' | 'dnevnik';
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
  const [dnevnikOAuthEnabled, setDnevnikOAuthEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    authMethod: 'email',
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
      toast.error('Вы уже зарегистрированы в системе');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Проверяем доступность Dnevnik.ru OAuth
  useEffect(() => {
    const checkOAuthConfig = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/config');
        const data = await response.json();
        setDnevnikOAuthEnabled(data.dnevnikOAuthEnabled);
      } catch (error) {
        console.error('Failed to check OAuth config:', error);
        setDnevnikOAuthEnabled(false);
      }
    };

    checkOAuthConfig();
  }, []);

  // Рассчитываем общее количество шагов в зависимости от метода и статуса
  const totalSteps = (() => {
    const baseSteps = formData.authMethod === 'email' ? 6 : 5;
    // Для студентов убираем шаг с мотивацией
    return formData.status === 'STUDENT' ? baseSteps - 1 : baseSteps;
  })();

  const updateField = (field: keyof RegisterFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Функция оценки силы пароля
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longLength: password.length >= 12,
    };

    // Базовые требования
    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;

    // Дополнительные бонусы
    if (checks.special) score += 10;
    if (checks.longLength) score += 10;

    let label = '';
    let color = '';

    if (score < 60) {
      label = 'Слабый';
      color = 'bg-red-500';
    } else if (score < 80) {
      label = 'Средний';
      color = 'bg-yellow-500';
    } else {
      label = 'Сильный';
      color = 'bg-green-500';
    }

    return { score, label, color };
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      return true;
    } else if (step === 2 && formData.authMethod === 'email') {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        toast.error('Заполните все поля');
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
    } else if (
      (step === 5 && formData.authMethod === 'email' && formData.status === 'APPLICANT') ||
      (step === 4 && formData.authMethod === 'dnevnik' && formData.status === 'APPLICANT')
    ) {
      // Мотивация обязательна только для APPLICANT
      if (!formData.motivation || formData.motivation.length < 50) {
        toast.error('Мотивация должна содержать минимум 50 символов');
        return false;
      }
    } else if (
      (step === 6 && formData.authMethod === 'email' && formData.status === 'APPLICANT') ||
      (step === 5 && formData.authMethod === 'email' && formData.status === 'STUDENT') ||
      (step === 5 && formData.authMethod === 'dnevnik' && formData.status === 'APPLICANT') ||
      (step === 4 && formData.authMethod === 'dnevnik' && formData.status === 'STUDENT')
    ) {
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

    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleOAuthLogin = () => {
    window.location.href = 'http://localhost:3001/api/oauth/dnevnik';
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
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
          authProvider: formData.authMethod === 'email' ? 'EMAIL' : 'DNEVNIK',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Проверяем, есть ли специфичное сообщение об ошибке
        if (data.message && data.message.includes('уже существует')) {
          toast.error('Пользователь с таким email уже зарегистрирован', {
            duration: 5000,
          });
        } else {
          toast.error(data.message || 'Ошибка регистрации');
        }
        return;
      }

      // Успешная регистрация
      toast.success('Регистрация прошла успешно! Добро пожаловать!');

      // Save user and token to store
      useAuthStore.getState().login(data.data.user, data.data.token);

      // Navigate to dashboard
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      toast.error(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = step;
  const displayTotalSteps = totalSteps;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up border border-gray-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 text-center">
            Регистрация
          </h1>
          <p className="text-gray-600 mb-8 text-center text-lg">
            Начните подготовку к поступлению в лицей
          </p>

          {/* Progress bar */}
          <ProgressBar current={currentStep} total={displayTotalSteps} className="mb-8" />

          {/* Step 1: Auth method */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Выберите способ регистрации</h2>

              <button
                onClick={() => updateField('authMethod', 'email')}
                className={`w-full p-5 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  formData.authMethod === 'email'
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="font-semibold text-lg">Email и пароль</div>
                <div className="text-sm text-gray-600">Классическая регистрация</div>
              </button>

              {dnevnikOAuthEnabled && (
                <>
                  <button
                    onClick={() => updateField('authMethod', 'dnevnik')}
                    className={`w-full p-5 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      formData.authMethod === 'dnevnik'
                        ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="font-semibold text-lg">Через Dnevnik.ru</div>
                    <div className="text-sm text-gray-600">Быстрая регистрация</div>
                  </button>

                  {formData.authMethod === 'dnevnik' && (
                    <div className="pt-4">
                      <Button onClick={handleOAuthLogin} className="w-full">
                        Продолжить с Dnevnik.ru
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Basic info (email only) */}
          {step === 2 && formData.authMethod === 'email' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Основная информация</h2>

              <Input
                label="Имя и фамилия"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Иван Иванов"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="ivan@example.com"
                required
              />

              <div>
                <div className="relative">
                  <Input
                    label="Пароль"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Минимум 8 символов, заглавная буква, строчная буква и цифра"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
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

                {/* Индикатор силы пароля */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Сила пароля:</span>
                      <span className={`font-semibold ${
                        getPasswordStrength(formData.password).score < 60 ? 'text-red-600' :
                        getPasswordStrength(formData.password).score < 80 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrength(formData.password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                        style={{ width: `${getPasswordStrength(formData.password).score}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                          {formData.password.length >= 8 ? '✓' : '○'}
                        </span>
                        <span>Минимум 8 символов</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[a-z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Строчная буква</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Заглавная буква</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[0-9]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Цифра</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}
                        </span>
                        <span>Специальный символ (необязательно, но усилит пароль)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Подтвердите пароль"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showConfirmPassword ? (
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
            </div>
          )}

          {/* Step 3 (or 2 for dnevnik): Status */}
          {((step === 3 && formData.authMethod === 'email') || (step === 2 && formData.authMethod === 'dnevnik')) && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Ваш статус</h2>

              <button
                onClick={() => updateField('status', 'STUDENT')}
                className={`w-full p-5 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  formData.status === 'STUDENT'
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="font-semibold text-lg">{USER_STATUS_LABELS.STUDENT}</div>
              </button>

              <button
                onClick={() => updateField('status', 'APPLICANT')}
                className={`w-full p-5 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  formData.status === 'APPLICANT'
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="font-semibold text-lg">{USER_STATUS_LABELS.APPLICANT}</div>
              </button>
            </div>
          )}

          {/* Step 4 (or 3 for dnevnik): Academic info */}
          {((step === 4 && formData.authMethod === 'email') || (step === 3 && formData.authMethod === 'dnevnik')) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Учебная информация</h2>

              <Select
                label="Текущий класс"
                value={formData.currentGrade.toString()}
                onChange={(e) => updateField('currentGrade', parseInt(e.target.value))}
                options={AVAILABLE_GRADES.map((grade) => ({
                  value: grade.toString(),
                  label: CURRENT_GRADE_LABELS[grade],
                }))}
                required
              />

              {formData.status === 'APPLICANT' && (
                <Select
                  label="Желаемое направление"
                  value={formData.desiredDirection}
                  onChange={(e) => updateField('desiredDirection', e.target.value)}
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

          {/* Step 5 (or 4 for dnevnik): Motivation - только для APPLICANT */}
          {(
            (step === 5 && formData.authMethod === 'email' && formData.status === 'APPLICANT') ||
            (step === 4 && formData.authMethod === 'dnevnik' && formData.status === 'APPLICANT')
          ) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Мотивация</h2>

              <Textarea
                label="Почему вы хотите поступить в лицей?"
                value={formData.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                placeholder="Расскажите о своих целях и мотивации (минимум 50 символов)"
                rows={6}
                required
              />

              <p className="text-sm text-gray-600">
                Символов: {formData.motivation.length} / 1000
              </p>
            </div>
          )}

          {/* Step 6 (or 5 for dnevnik): Terms */}
          {((step === 6 && formData.authMethod === 'email' && formData.status === 'APPLICANT') ||
            (step === 5 && formData.authMethod === 'email' && formData.status === 'STUDENT') ||
            (step === 5 && formData.authMethod === 'dnevnik' && formData.status === 'APPLICANT') ||
            (step === 4 && formData.authMethod === 'dnevnik' && formData.status === 'STUDENT')) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Условия использования</h2>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700">
                  Регистрируясь на платформе, вы соглашаетесь с условиями использования...
                  <br /><br />
                  Подробнее см.{' '}
                  <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Условия использования
                  </Link>
                </p>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Я прочитал и согласен с{' '}
                  <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                    условиями использования
                  </Link>
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Назад
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && formData.authMethod === 'dnevnik'}
              >
                Далее
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !formData.agreedToTerms}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            )}
          </div>

          {/* Link to login */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
