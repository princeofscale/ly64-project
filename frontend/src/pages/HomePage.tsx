/**
 * HomePage - Modern, minimalist education platform landing page
 * Inspired by Duolingo, Khan Academy, and Coursera
 * Features: Glassmorphism, smooth animations, responsive design
 */

import { LYCEUM_INFO, DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import { motion, useInView } from 'framer-motion';
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
  Sparkles,
  Target,
  Award,
  Users,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { getGreetingWithName, getRandomMotivation } from '../utils/greetings';
import {
  pageVariants,
  cardVariants,
  staggerContainer,
  fadeInVariants,
  scalePopVariants,
} from '@/utils/animations';

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
  { bg: string; border: string; text: string; iconBg: string; gradient: string }
> = {
  [Direction.PROGRAMMING]: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    gradient: 'from-blue-500 to-indigo-600',
  },
  [Direction.ROBOTICS]: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30 hover:border-violet-500/50',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
    gradient: 'from-violet-500 to-purple-600',
  },
  [Direction.MEDICINE]: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    gradient: 'from-rose-500 to-pink-600',
  },
  [Direction.BIOTECHNOLOGY]: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-600',
  },
  [Direction.CULTURE]: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    gradient: 'from-amber-500 to-orange-600',
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
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-75" />
          <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[90px] animate-pulse delay-150" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="primary" size="md" rounded className="mb-6">
                <GraduationCap className="w-4 h-4" />
                Лицей-интернат №64
                <Sparkles className="w-3 h-3" />
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isAuthenticated ? (
                <>
                  {greeting}
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    👋
                  </motion.span>
                </>
              ) : (
                <>
                  Будущее начинается{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    здесь
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isAuthenticated
                ? motivation
                : 'Интерактивная платформа для подготовки к поступлению в один из лучших лицеев Саратова'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button
                      variant="gradient"
                      size="lg"
                      rightIcon={<ChevronRight className="w-5 h-5" />}
                    >
                      Начать подготовку
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Войти в систему
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">
                    <Button
                      variant="gradient"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Панель управления
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" size="lg">
                      Личный кабинет
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Современный подход к образованию с игровыми элементами и персонализацией
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Персональный подход"
              description="Адаптивное обучение под ваш уровень знаний"
              gradient="from-indigo-500 to-purple-600"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Геймификация"
              description="Учитесь с удовольствием через игровые элементы"
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Отслеживание прогресса"
              description="Детальная аналитика вашего развития"
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="Достижения"
              description="Получайте награды за выполнение заданий"
              gradient="from-amber-500 to-orange-600"
            />
          </motion.div>
        </div>
      </section>

      {/* Directions Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Направления обучения
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Выберите свой путь к успеху в одной из пяти специализаций
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
              <DirectionCard
                key={key}
                direction={key as Direction}
                label={label}
                description={getDirectionDescription(key as Direction)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <StatCard number="1000+" label="Учеников" icon={<Users className="w-8 h-8" />} />
            <StatCard
              number="98%"
              label="Довольных студентов"
              icon={<Star className="w-8 h-8" />}
            />
            <StatCard
              number="50+"
              label="Преподавателей"
              icon={<GraduationCap className="w-8 h-8" />}
            />
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contacts Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="glass" padding="lg" hover>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <h3 className="text-2xl font-bold text-white">Контакты</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{LYCEUM_INFO.phone}</span>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{LYCEUM_INFO.email}</span>
                  </div>

                  <a
                    href={LYCEUM_INFO.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-indigo-300 group-hover:text-indigo-200 font-medium flex items-center gap-2">
                      Официальный сайт
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </a>
                </div>
              </Card>
            </motion.div>

            {/* Admission Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="glass" padding="lg" hover>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <h3 className="text-2xl font-bold text-white">Сроки приёма</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-emerald-300 font-semibold mb-1">
                          Приём документов
                        </p>
                        <p className="text-white text-lg font-bold">
                          {LYCEUM_INFO.admissionPeriod.documentSubmission}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-amber-300 font-semibold mb-1">Экзамены</p>
                        <p className="text-white text-lg font-bold">
                          {LYCEUM_INFO.admissionPeriod.exams}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card
                variant="glass"
                padding="lg"
                className="relative overflow-hidden border-2 border-indigo-500/30"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                <div className="relative text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Готовы начать обучение?
                  </h2>
                  <p className="text-lg text-slate-300 mb-8">
                    Присоединяйтесь к тысячам студентов, которые уже достигают своих целей
                  </p>
                  <Link to="/register">
                    <Button
                      variant="gradient"
                      size="xl"
                      rightIcon={<ChevronRight className="w-6 h-6" />}
                    >
                      Зарегистрироваться сейчас
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p className="mb-2">
              &copy; {new Date().getFullYear()} Лицей-интернат №64. Все права защищены.
            </p>
            <p className="text-sm">
              Создано с <span className="text-red-400 animate-pulse">❤</span> для будущих лидеров
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Card variant="glass" padding="lg" hover glow className="h-full">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-3 mb-4 shadow-lg`}>
          <div className="text-white w-full h-full flex items-center justify-center">{icon}</div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}

// Stat Card Component with animated counter
function StatCard({
  number,
  label,
  icon,
}: {
  number: string;
  label: string;
  icon: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayNumber, setDisplayNumber] = useState('0');

  useEffect(() => {
    if (isInView) {
      // Extract numeric value for animation
      const numericValue = parseInt(number.replace(/\D/g, ''));
      let start = 0;
      const duration = 2000;
      const increment = numericValue / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayNumber(number);
          clearInterval(timer);
        } else {
          setDisplayNumber(
            Math.floor(start).toString() + number.replace(/\d/g, '').replace(/\+/g, '')
          );
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, number]);

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <Card variant="glass" padding="lg" hover className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="text-white">{icon}</div>
          </div>
        </div>

        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{displayNumber}</div>
        <div className="text-slate-400 font-medium">{label}</div>
      </Card>
    </motion.div>
  );
}

// Direction Card Component
interface DirectionCardProps {
  direction: Direction;
  label: string;
  description: string;
}

function DirectionCard({ direction, label, description }: DirectionCardProps) {
  const [showModal, setShowModal] = useState(false);
  const Icon = DIRECTION_ICONS[direction];
  const colors = DIRECTION_COLORS[direction];
  const info = DIRECTION_INFO[direction];

  return (
    <>
      <motion.div variants={cardVariants}>
        <Card
          variant="glass"
          padding="lg"
          hover
          glow
          className={`h-full cursor-pointer border-2 ${colors.border} group`}
          onClick={() => setShowModal(true)}
        >
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} p-4 mb-4 shadow-lg group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-full h-full text-white" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">{label}</h3>
          <p className="text-slate-400 mb-4 leading-relaxed">{description}</p>

          <div
            className={`inline-flex items-center gap-2 text-sm font-semibold ${colors.text} group-hover:gap-3 transition-all`}
          >
            Подробнее
            <ChevronRight className="w-4 h-4" />
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} p-5 shadow-xl`}
                >
                  <Icon className="w-full h-full text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{label}</h2>
                  <p className="text-slate-400">Направление обучения</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-8 leading-relaxed text-lg">{info.fullDescription}</p>

            {/* Subjects */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                Профильные предметы
              </h4>
              <div className="flex flex-wrap gap-3">
                {info.subjects.map((subject, i) => (
                  <Badge key={i} variant="info" size="lg" rounded>
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Careers */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                Возможные профессии
              </h4>
              <div className="flex flex-wrap gap-3">
                {info.careers.map((career, i) => (
                  <Badge key={i} variant="warning" size="lg" rounded>
                    {career}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

export default HomePage;
