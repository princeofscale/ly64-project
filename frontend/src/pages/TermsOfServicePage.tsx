import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Пользовательское соглашение</h1>

          <div className="prose prose-blue max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">1. Общие положения</h2>
            <p className="text-gray-700 mb-4">
              Настоящее Пользовательское соглашение регулирует отношения между администрацией
              платформы подготовки к поступлению в Лицей-интернат №64 г. Саратова и пользователями
              платформы.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">
              2. Использование платформы
            </h2>
            <p className="text-gray-700 mb-4">
              2.1. Платформа предназначена для подготовки к поступлению в Лицей-интернат №64 г.
              Саратова и является некоммерческим образовательным проектом.
            </p>
            <p className="text-gray-700 mb-4">
              2.2. Регистрируясь на платформе, пользователь соглашается предоставить достоверную
              информацию о себе.
            </p>
            <p className="text-gray-700 mb-4">
              2.3. Пользователь обязуется использовать платформу исключительно в образовательных
              целях.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">
              3. Персональные данные
            </h2>
            <p className="text-gray-700 mb-4">
              3.1. Платформа собирает следующие персональные данные: имя, email, текущий класс
              обучения, желаемое направление в лицее.
            </p>
            <p className="text-gray-700 mb-4">
              3.2. Персональные данные используются исключительно для обеспечения функционирования
              платформы и улучшения качества обучения.
            </p>
            <p className="text-gray-700 mb-4">
              3.3. Платформа не передает персональные данные третьим лицам без согласия
              пользователя.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">
              4. Права и обязанности пользователя
            </h2>
            <p className="text-gray-700 mb-4">
              4.1. Пользователь имеет право на доступ к образовательным материалам и тестам
              платформы.
            </p>
            <p className="text-gray-700 mb-4">
              4.2. Пользователь обязуется не распространять материалы платформы без разрешения
              администрации.
            </p>
            <p className="text-gray-700 mb-4">
              4.3. Пользователь обязуется не создавать несколько аккаунтов для одного лица.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">5. Ответственность</h2>
            <p className="text-gray-700 mb-4">
              5.1. Платформа не несет ответственности за результаты вступительных экзаменов
              пользователей.
            </p>
            <p className="text-gray-700 mb-4">
              5.2. Платформа предоставляет материалы «как есть» и не гарантирует их полноту или
              актуальность.
            </p>
            <p className="text-gray-700 mb-4">
              5.3. Пользователь несет полную ответственность за сохранность своих учетных данных.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">6. Изменение условий</h2>
            <p className="text-gray-700 mb-4">
              6.1. Администрация оставляет за собой право изменять условия настоящего соглашения.
              Пользователи будут уведомлены об изменениях через платформу.
            </p>
            <p className="text-gray-700 mb-4">
              6.2. Администрация оставляет за собой право блокировать аккаунты пользователей в случае
              нарушения условий соглашения.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">7. Контакты</h2>
            <p className="text-gray-700 mb-4">
              По всем вопросам, связанным с использованием платформы, вы можете обратиться по
              адресу: princeofscale812@proton.me
            </p>

            <p className="text-gray-600 text-sm mt-8">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к регистрации
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
