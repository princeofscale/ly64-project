import {
  DIRECTION_LABELS,
  AVAILABLE_GRADES,
  CURRENT_GRADE_LABELS,
  USER_STATUS_LABELS,
} from '@lyceum64/shared';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

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
      return 'Email не может содержать кириллицу';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Некорректный формат email';
    }

    const localPart = email.split('@')[0];
    if (localPart && localPart.length < 3) {
      return 'Часть email до @ должна содержать минимум 3 символа';
    }

    return '';
  };

  const updateField = (field: keyof RegisterFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'email' && typeof value === 'string') {
      setEmailTouched(true);
      setEmailError(validateEmail(value));
    }
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;

    if (score < 50) return { score, label: 'Слабый', color: 'bg-red-500' };
    if (score < 75) return { score, label: 'Средний', color: 'bg-amber-500' };
    return { score, label: 'Сильный', color: 'bg-emerald-500' };
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        toast.error('Заполните все поля');
        return false;
      }
      if (emailError) {
        toast.error('Исправьте ошибки в email');
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
      if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        toast.error('Пароль должен содержать строчные, заглавные буквы и цифры');
        return false;
      }
    } else if (step === 2) {
      if (formData.status === 'STUDENT' && !formData.name) {
        toast.error('Выберите своё имя из списка');
        return false;
      }
    } else if (step === 4 && formData.status === 'APPLICANT') {
      if (!formData.motivation) {
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
    if (!validateStep()) return;
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        if (data.message?.includes('уже существует')) {
          setShowExistingEmailModal(true);
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
    } catch {
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Лицей-интернат №64</p>
            <p className="text-sm text-slate-500">Платформа подготовки</p>
          </div>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Создать аккаунт</h1>
            <p className="text-slate-500">Шаг {step} из {totalSteps}</p>
          </div>

          <div className="mb-8">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Основная информация
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Имя и фамилия</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Иван Иванов"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="ivan@example.com"
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      emailTouched && emailError
                        ? 'border-red-300 focus:border-red-500'
                        : emailTouched && formData.email && !emailError
                          ? 'border-emerald-300 focus:border-emerald-500'
                          : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {emailTouched && formData.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailError ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailTouched && emailError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Пароль</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    placeholder="Минимум 8 символов"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Сила пароля:</span>
                      <span className={`font-medium ${
                        passwordStrength.score < 50 ? 'text-red-600' :
                        passwordStrength.score < 75 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} rounded-full transition-all`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-600' : ''}`}>
                        {formData.password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                        8+ символов
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                        {/[a-z]/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                        Строчная буква
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                        {/[A-Z]/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                        Заглавная буква
                      </div>
                      <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                        {/[0-9]/.test(formData.password) ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                        Цифра
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Подтвердите пароль</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => updateField('confirmPassword', e.target.value)}
                    placeholder="Повторите пароль"
                    className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-emerald-300'
                          : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Ваш статус
              </h2>

              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => updateField('status', 'STUDENT')}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    formData.status === 'STUDENT'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.status === 'STUDENT' ? 'border-blue-500' : 'border-slate-300'
                    }`}>
                      {formData.status === 'STUDENT' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{USER_STATUS_LABELS.STUDENT}</p>
                      <p className="text-sm text-slate-500">Уже учусь в лицее</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('status', 'APPLICANT')}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                    formData.status === 'APPLICANT'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.status === 'APPLICANT' ? 'border-violet-500' : 'border-slate-300'
                    }`}>
                      {formData.status === 'APPLICANT' && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{USER_STATUS_LABELS.APPLICANT}</p>
                      <p className="text-sm text-slate-500">Готовлюсь к поступлению</p>
                    </div>
                  </div>
                </button>
              </div>

              {formData.status === 'STUDENT' && (
                <div className="mt-6 animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Выберите своё имя из списка
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => {
                        setStudentSearch(e.target.value);
                        updateField('name', '');
                        setShowStudentDropdown(true);
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      placeholder={studentsLoading ? 'Загрузка...' : 'Начните вводить ФИО'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      disabled={studentsLoading}
                    />
                    {showStudentDropdown && filteredStudents.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredStudents.map((student, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              updateField('name', student);
                              setStudentSearch(student);
                              setShowStudentDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors"
                          >
                            {student}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.name && (
                    <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Выбрано: {formData.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Учебная информация
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Текущий класс</label>
                <select
                  value={formData.currentGrade}
                  onChange={e => updateField('currentGrade', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {AVAILABLE_GRADES.map(grade => (
                    <option key={grade} value={grade}>
                      {CURRENT_GRADE_LABELS[grade]}
                    </option>
                  ))}
                </select>
              </div>

              {formData.status === 'APPLICANT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Желаемое направление
                  </label>
                  <select
                    value={formData.desiredDirection}
                    onChange={e => updateField('desiredDirection', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Выберите направление</option>
                    {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 4 && formData.status === 'APPLICANT' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Почему вы хотите поступить в лицей?
              </h2>

              <div>
                <textarea
                  value={formData.motivation}
                  onChange={e => updateField('motivation', e.target.value)}
                  placeholder="Расскажите о своих целях и мотивации..."
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">{formData.motivation.length} / 1000</span>
                </div>
              </div>
            </div>
          )}

          {step === totalSteps && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Условия использования
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto text-sm text-slate-600">
                Регистрируясь на платформе, вы соглашаетесь с условиями использования сервиса.
                Мы обязуемся защищать ваши персональные данные в соответствии с законодательством РФ.
                <br /><br />
                Подробнее см.{' '}
                <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Условия использования
                </Link>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={e => updateField('agreedToTerms', e.target.checked)}
                  className="mt-0.5 h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  Я прочитал и согласен с{' '}
                  <Link to="/terms" target="_blank" className="text-blue-600 hover:underline">
                    условиями использования
                  </Link>
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && (!!emailError || !formData.email)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                Далее
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.agreedToTerms}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    Создать аккаунт
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            На главную
          </Link>
        </div>

        {showExistingEmailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Аккаунт уже существует</h3>
                <p className="text-slate-500">
                  Пользователь с email <span className="font-semibold text-blue-600">{formData.email}</span> уже зарегистрирован
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExistingEmailModal(false);
                    navigate('/login', { state: { email: formData.email } });
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Войти в аккаунт
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExistingEmailModal(false);
                    setStep(1);
                    setFormData(prev => ({ ...prev, email: '' }));
                    setEmailError('');
                    setEmailTouched(false);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Использовать другой email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
