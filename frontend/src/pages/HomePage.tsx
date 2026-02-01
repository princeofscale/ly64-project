import { LYCEUM_INFO, DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import {
  Code,
  Bot,
  Stethoscope,
  Dna,
  Palette,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  CalendarDays,
  FileText,
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';

const DIRECTION_ICONS: Record<Direction, React.ElementType> = {
  [Direction.PROGRAMMING]: Code,
  [Direction.ROBOTICS]: Bot,
  [Direction.MEDICINE]: Stethoscope,
  [Direction.BIOTECHNOLOGY]: Dna,
  [Direction.CULTURE]: Palette,
};

interface DirectionInfo {
  fullDescription: string;
  subjects: string[];
  careers: string[];
}

const DIRECTION_INFO: Record<Direction, DirectionInfo> = {
  [Direction.PROGRAMMING]: {
    fullDescription:
      'Направление для тех, кто хочет стать профессиональным разработчиком программного обеспечения. Изучение алгоритмов, структур данных, языков программирования и современных технологий разработки.',
    subjects: ['Математика (профиль)', 'Информатика (профиль)', 'Физика (профиль)'],
    careers: ['Программист', 'Системный аналитик', 'Data Scientist'],
  },
  [Direction.ROBOTICS]: {
    fullDescription:
      'Направление объединяет программирование, электронику и механику. Вы научитесь собирать и программировать роботов.',
    subjects: ['Математика (профиль)', 'Физика (профиль)', 'Информатика (профиль)'],
    careers: ['Инженер-робототехник', 'Инженер автоматизации', 'Разработчик IoT'],
  },
  [Direction.MEDICINE]: {
    fullDescription:
      'Подготовка к поступлению в медицинские вузы. Углублённое изучение биологии, химии и основ медицины.',
    subjects: ['Биология (профиль)', 'Химия (профиль)', 'Русский язык'],
    careers: ['Врач', 'Фармацевт', 'Биотехнолог'],
  },
  [Direction.BIOTECHNOLOGY]: {
    fullDescription:
      'Направление на стыке биологии и технологий. Генетика, молекулярная биология, биоинформатика.',
    subjects: ['Биология (профиль)', 'Химия (профиль)', 'Информатика'],
    careers: ['Генетик', 'Биоинженер', 'Биоинформатик'],
  },
  [Direction.CULTURE]: {
    fullDescription:
      'Направление для творческих личностей. Изучение истории искусств, культурологии и дизайна.',
    subjects: ['Литература (профиль)', 'История (профиль)', 'Английский язык'],
    careers: ['Дизайнер', 'Искусствовед', 'Журналист'],
  },
};

const DIRECTION_COLORS: Record<
  Direction,
  { bg: string; border: string; text: string; iconBg: string }
> = {
  [Direction.PROGRAMMING]: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  [Direction.ROBOTICS]: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30 hover:border-violet-500/50',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
  },
  [Direction.MEDICINE]: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
  },
  [Direction.BIOTECHNOLOGY]: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  [Direction.CULTURE]: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
};

function getDirectionDescription(direction: Direction): string {
  const descriptions: Record<Direction, string> = {
    [Direction.PROGRAMMING]: 'Углубленное изучение программирования и информатики',
    [Direction.ROBOTICS]: 'Робототехника и автоматизация',
    [Direction.MEDICINE]: 'Медицинские технологии будущего',
    [Direction.BIOTECHNOLOGY]: 'Биотехнологии и генетика',
    [Direction.CULTURE]: 'Культура и искусство',
  };
  return descriptions[direction];
}

function HomePage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  const greeting = useMemo(() => getGreetingWithName(user?.name), [user?.name]);
  const motivation = useMemo(() => getRandomMotivation(), []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]" />

        <div className="relative container-wide py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Лицей-интернат №64</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {isAuthenticated ? greeting : 'Будущее начинается здесь'}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              {isAuthenticated
                ? motivation
                : 'Интерактивная платформа для подготовки к поступлению в один из лучших лицеев Саратова'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Начать подготовку
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Войти в систему
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Панель управления
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Личный кабинет
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Directions Section */}
      <section className="container-wide py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Направления обучения</h2>
          <p className="text-slate-400 text-lg">Выберите свой путь к успеху</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(DIRECTION_LABELS).map(([key, label], index) => (
            <DirectionCard
              key={key}
              direction={key as Direction}
              label={label}
              description={getDirectionDescription(key as Direction)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="container-wide py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contacts Card */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Контакты
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-slate-300">{LYCEUM_INFO.phone}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-slate-300">{LYCEUM_INFO.email}</span>
              </div>

              <a
                href={LYCEUM_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-blue-400 group-hover:underline">Официальный сайт</span>
              </a>
            </div>
          </div>

          {/* Admission Card */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Сроки приёма
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Приём документов</p>
                  <p className="text-white font-medium">
                    {LYCEUM_INFO.admissionPeriod.documentSubmission}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Экзамены</p>
                  <p className="text-white font-medium">{LYCEUM_INFO.admissionPeriod.exams}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface DirectionCardProps {
  direction: Direction;
  label: string;
  description: string;
  index: number;
}

function DirectionCard({ direction, label, description, index }: DirectionCardProps) {
  const [showModal, setShowModal] = useState(false);
  const Icon = DIRECTION_ICONS[direction];
  const colors = DIRECTION_COLORS[direction];
  const info = DIRECTION_INFO[direction];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          w-full text-left p-6 rounded-2xl border transition-all duration-300
          ${colors.bg} ${colors.border}
          hover:scale-[1.02] group
        `}
      >
        <div
          className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-4`}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{label}</h3>

        <p className="text-slate-400 mb-4">{description}</p>

        <span
          className={`text-sm font-medium ${colors.text} inline-flex items-center gap-1 group-hover:gap-2 transition-all`}
        >
          Подробнее
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{label}</h2>
                  <p className="text-slate-500">Направление обучения</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-6 leading-relaxed">{info.fullDescription}</p>

            {/* Subjects */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Профильные предметы
              </h4>
              <div className="flex flex-wrap gap-2">
                {info.subjects.map((subject, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Careers */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                Возможные профессии
              </h4>
              <div className="flex flex-wrap gap-2">
                {info.careers.map((career, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg"
                  >
                    {career}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;
