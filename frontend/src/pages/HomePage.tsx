import { LYCEUM_INFO, DIRECTION_LABELS, Direction } from '@lyceum64/shared';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            {isAuthenticated ? `Добро пожаловать, ${user?.name}!` : 'Подготовься к поступлению'}
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {isAuthenticated
              ? 'Продолжай подготовку к поступлению в лицей'
              : `Интерактивная платформа для подготовки к вступительным экзаменам в ${LYCEUM_INFO.name}`
            }
          </p>

          {!isAuthenticated && (
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Начать подготовку
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Войти
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Панель управления
              </Link>
              <Link
                to="/profile"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Личный кабинет
              </Link>
            </div>
          )}
        </div>

        {/* Directions */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Направления обучения
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(DIRECTION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="px-6 py-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {label}
                  </h4>
                  <p className="text-gray-600">
                    {getDirectionDescription(key as Direction)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white shadow-lg rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Информация о поступлении
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Контакты</h4>
              <p className="text-gray-600">Телефон: {LYCEUM_INFO.phone}</p>
              <p className="text-gray-600">Email: {LYCEUM_INFO.email}</p>
              <a
                href={LYCEUM_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Официальный сайт
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Сроки приема</h4>
              <p className="text-gray-600">
                Прием документов: {LYCEUM_INFO.admissionPeriod.documentSubmission}
              </p>
              <p className="text-gray-600">
                Экзамены: {LYCEUM_INFO.admissionPeriod.exams}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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

export default HomePage;
