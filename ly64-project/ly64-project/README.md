# Lyceum 64 - Платформа подготовки к экзаменам

Современная образовательная платформа для подготовки к ОГЭ, ЕГЭ и ВПР по математике и другим предметам.

## 🚀 Возможности

- **Полноценные тесты ОГЭ/ЕГЭ/ВПР** - куча заданий по предметам с автоматической проверкой
- **Таймер и навигация** - отслеживание времени и быстрый переход между заданиями
- **Детальный разбор** - просмотр правильных ответов и анализ ошибок
- **Система достижений** - геймификация с анимацией конфетти
- **Таблица лидеров** - соревнование с другими учениками
- **Профили пользователей** - статистика, биография, аватары
- **Темная тема** - современный дизайн с Tailwind CSS
- **Антифрод система** - защита от списывания

## 🛠 Технологии

### Frontend

- **React 19.2.4** + TypeScript 5.9.3
- **Vite 8.0.5** - быстрая сборка
- **Tailwind CSS 4.2.2** - стилизация
- **Zustand 5.0.12** - управление состоянием
- **React Router 7.14.0** - маршрутизация
- **Axios 1.14.0** - HTTP клиент
- **Framer Motion 12.38.0** - анимации
- **Recharts 3.8.1** - графики
- **Lucide React 1.7.0** - иконки

### Backend

- **Node.js 18+** + Express 5.2.1
- **Prisma 7.6.0** - ORM для SQLite
- **SQLite** - база данных
- **JWT 9.0.3** - аутентификация
- **bcrypt 6.0.0** - хеширование паролей
- **Zod 4.3.6** - валидация
- **Winston** - логирование
- **WebSocket** - realtime

### Инфраструктура

- **Monorepo** - единая кодовая база
- **ESLint 9.39.2** + **Prettier** - контроль качества кода
- **Husky** - Git хуки
- **TypeScript 5.9.3** - типизация
- **Vitest** - тестирование (планируется)

## 📦 Установка

### Требования

- Node.js >= 18
- npm >= 9
- Python 3.8+ (для загрузки тестов из sdamgia.ru)

### Быстрый старт

1. Клонировать репозиторий:

```bash
git clone https://github.com/princeofscale/ly64-project.git
cd ly64-project
```

2. Установить зависимости:

```bash
npm install
```

3. Настроить окружение:

```bash
# Backend
cp backend/.env.example backend/.env
# Заполните JWT_SECRET в backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# (опционально) настройте VITE_API_URL
```

4. Инициализировать базу данных:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Загрузить тесты из sdamgia.ru:

```bash
cd backend
pip install -r requirements.txt  # если есть
python scripts/fetch_sdamgia_tests.py
```

6. Запустить проект:

**Вариант 1: Скрипт (рекомендуется)**

```bash
# macOS/Linux
bash start.sh

# Windows
start.bat
```

**Вариант 2: Вручную**

```bash
# Терминал 1 - Backend
cd backend
npm run dev

# Терминал 2 - Frontend
cd frontend
npm run dev
```

7. Открыть в браузере:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🧪 Тестовый аккаунт

```
Email: test@lyceum64.ru
Пароль: test123
```

## 📝 Основные команды

### Backend

```bash
npm run dev        # Запуск в режиме разработки
npm run build      # Сборка для production
npm start          # Запуск production версии
npm run type-check # Проверка TypeScript
npx prisma studio  # GUI для базы данных
```

### Frontend

```bash
npm run dev        # Запуск dev сервера
npm run build      # Сборка для production
npm run preview    # Просмотр production сборки
npm run lint       # ESLint проверка
```

## 📁 Структура проекта

```
ly64-project/
├── backend/              # Node.js + Express API
│   ├── prisma/          # Схема БД и миграции
│   ├── scripts/         # Скрипты (загрузка тестов)
│   └── src/
│       ├── controllers/ # Контроллеры
│       ├── routes/      # Маршруты API
│       ├── services/    # Бизнес-логика
│       └── middlewares/ # Middleware (auth, errors)
├── frontend/            # React приложение
│   ├── public/         # Статические файлы
│   └── src/
│       ├── components/ # React компоненты
│       ├── pages/      # Страницы
│       ├── core/       # Domain модели (OOP)
│       ├── services/   # API клиент
│       └── store/      # Zustand state
├── shared/             # Общие типы
├── sdamgia_api/        # Python API для sdamgia.ru
├── start.sh            # Скрипт запуска (Unix)
├── start.bat           # Скрипт запуска (Windows)
└── ARCHITECTURE.md     # Подробная архитектура
```

## 🎯 Архитектура

### Domain-Driven Design (Frontend)

- **Strategy Pattern** - валидация ответов по типу вопроса
- **Factory Pattern** - создание экзаменов разных типов
- **Singleton Pattern** - сервисы (Timer, Storage, ActiveTest)
- **Rich Domain Model** - Exam, Task, TestSession с поведением

Подробнее: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔒 Безопасность

- JWT токены для аутентификации
- bcrypt хеширование паролей (10 раундов)
- HTTP-only cookies (опционально)
- Защита от SQL инъекций (Prisma ORM)
- Валидация входных данных
- Антифрод система (отслеживание времени ответов)

## 📊 API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена

### Тесты

- `GET /api/tests` - Список тестов
- `GET /api/tests/:id/start` - Начать тест
- `POST /api/tests/:id/submit` - Отправить ответы
- `GET /api/tests/:id/results` - Результаты теста

### Пользователи

- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновить профиль
- `GET /api/users/achievements` - Достижения

### Leaderboard

- `GET /api/students/leaderboard` - Таблица лидеров

## 🎨 UI/UX

- Адаптивный дизайн (mobile-first)
- Темная тема с градиентами
- Анимации (confetti, transitions)
- Тосты для уведомлений
- Прогресс-бары
- Glassmorphism эффекты

## 📄 Лицензия

MIT License - see [LICENSE](./LICENSE)

## 👨‍💻 Авторы

- **Третьяков Александр** - разработка платформы & backend & frontend
- **Потапов Сергей** - помощь в разработке платформы & backend & frontend
- **Шишкин Александр** - разработка платформы & frontend & реферат & презентация

## 📞 Контакты

- GitHub: [@princeofscale](https://github.com/princeofscale)
- Проект: https://github.com/princeofscale/ly64-project
