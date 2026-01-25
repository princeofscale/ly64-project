# Lyceum 64 - Архитектура проекта

## Обзор

Lyceum 64 - это платформа для подготовки к ОГЭ, ЕГЭ и ВПР, разработанная для Лицея №64 г. Липецка. Проект построен на современном технологическом стеке с использованием TypeScript, React и Node.js.

## Структура проекта

```
ly64-project-sigma_sergei/
├── backend/           # Backend API (Node.js + Express + Prisma)
├── frontend/          # Frontend приложение (React + Vite + TypeScript)
├── shared/            # Общие типы и константы
├── sdamgia_api/       # Python библиотека для загрузки тестов
├── docs/              # Документация
├── start.sh          # Скрипт запуска (Unix/Linux/macOS)
├── start.bat         # Скрипт запуска (Windows)
└── package.json      # Root package.json для monorepo
```

## Backend (API)

### Технологии

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: SQLite (через Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator, Zod

### Структура backend

```
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── database.ts          # Prisma client instance
│   ├── middlewares/
│   │   ├── auth.ts              # JWT authentication
│   │   └── errorHandler.ts     # Global error handler
│   ├── routes/
│   │   ├── auth.ts              # Регистрация, логин
│   │   ├── user.ts              # Профиль пользователя
│   │   ├── students.ts          # Список учеников лицея
│   │   ├── diagnostic.ts        # Диагностические тесты
│   │   └── tests.ts             # Основные тесты (ОГЭ/ЕГЭ)
│   └── services/
│       ├── antiCheatService.ts  # Система анти-читинга
│       └── testLoaderService.ts # Авто-загрузка тестов
├── prisma/
│   ├── schema.prisma            # Prisma schema
│   ├── migrations/              # Database migrations
│   ├── seed.ts                  # Database seeding
│   └── seeds/
│       ├── achievements.ts      # Достижения
│       └── diagnosticTests.ts   # Диагностические тесты
└── scripts/
    └── fetch_sdamgia_tests.py   # Загрузка тестов из sdamgia.ru
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

#### Users

- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновление профиля
- `GET /api/users/:username` - Публичный профиль

#### Students

- `GET /api/students` - Список учеников лицея

#### Tests

- `GET /api/tests` - Список тестов (с фильтрами)
- `GET /api/tests/:testId/start` - Начать тест (получить рандомизированные вопросы)
- `POST /api/tests/:testId/submit` - Отправить ответы
- `GET /api/tests/:testId/results` - Результаты тестов

#### Diagnostic

- `GET /api/diagnostic/subjects` - Список предметов для диагностики
- `POST /api/diagnostic/:subject/complete` - Завершить диагностику

### Database Schema

**Основные модели:**

- `User` - Пользователи (ученики, абитуриенты)
- `Student` - Список учеников лицея (для связывания при регистрации)
- `Test` - Тесты (ОГЭ, ЕГЭ, ВПР, диагностические)
- `Question` - Вопросы
- `TestQuestion` - Связь тестов и вопросов (many-to-many)
- `TestAttempt` - Попытки прохождения тестов
- `UserProgress` - Прогресс пользователя
- `Achievement` - Достижения
- `UserAchievement` - Достижения пользователей
- `DiagnosticResult` - Результаты диагностики
- `LearningPlan` - Персональные планы обучения
- `LearningPlanItem` - Элементы плана обучения

### Anti-Cheat System

Система анти-читинга анализирует:

- **Время ответов**: Слишком быстрые ответы помечаются
- **Порядок вопросов**: Рандомизация при каждом запуске
- **Порядок вариантов**: Рандомизация опций в вопросах
- **Статистика**: Аналитика подозрительных паттернов

## Frontend

### Технологии

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand (для auth), React hooks (для остального)
- **HTTP Client**: Axios
- **Forms**: React Hook Form (опционально)
- **Notifications**: React Hot Toast

### Структура frontend

```
frontend/
├── src/
│   ├── core/                    # Доменная логика (OOP)
│   │   ├── models/
│   │   │   ├── Exam.ts          # Модели экзаменов (OGE, EGE, etc.)
│   │   │   ├── Task.ts          # Модель задания
│   │   │   └── TestSession.ts   # Управление сессией теста
│   │   ├── strategies/
│   │   │   └── AnswerValidationStrategies.ts  # Стратегии валидации
│   │   ├── factories/
│   │   │   └── ExamFactory.ts   # Factory для создания экзаменов
│   │   ├── services/
│   │   │   ├── ActiveTestService.ts    # Отслеживание активных тестов
│   │   │   ├── TimerService.ts         # Таймер
│   │   │   ├── StorageService.ts       # localStorage wrapper
│   │   │   └── ConfettiService.ts      # Анимация конфетти
│   │   ├── interfaces/          # TypeScript interfaces
│   │   ├── types/               # Type definitions
│   │   └── constants/           # Константы (конфигурации экзаменов)
│   ├── services/
│   │   ├── api.ts               # Axios instance с interceptors
│   │   ├── authService.ts       # Auth API calls
│   │   └── testService.ts       # Test API calls
│   ├── store/
│   │   └── authStore.ts         # Zustand auth store
│   ├── hooks/
│   │   ├── useTestSession.ts    # Управление TestSession
│   │   ├── useExam.ts           # Управление экзаменом
│   │   ├── useTimer.ts          # Интеграция с TimerService
│   │   └── useAchievementNotifications.tsx  # Уведомления о достижениях
│   ├── pages/                   # Route components (22 страницы)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── DiagnosticPage.tsx
│   │   ├── TestSetupPage.tsx    # Выбор класса и предмета
│   │   ├── ExamTestPage.tsx     # Прохождение ОГЭ/ЕГЭ
│   │   ├── TestPage.tsx         # Общая страница теста
│   │   ├── LeaderboardPage.tsx
│   │   ├── LearningPlanPage.tsx
│   │   └── ...                  # VPR тесты, ОГЭ русский и т.д.
│   ├── components/              # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Button.tsx
│   │   ├── UnfinishedTestBanner.tsx
│   │   └── ...
│   ├── data/                    # Статические данные вариантов
│   ├── utils/
│   │   └── greetings.ts         # Генерация приветствий
│   ├── App.tsx                  # Main app component
│   └── index.css                # Tailwind + custom styles
└── public/
    ├── favicon.svg
    └── manifest.json            # PWA manifest
```

### Архитектурные паттерны

#### 1. Strategy Pattern

Используется для валидации ответов. Каждый `Task` (задание) получает стратегию валидации в зависимости от типа вопроса:

- `ShortAnswerValidationStrategy` - короткие ответы
- `ChoiceValidationStrategy` - выбор одного варианта
- `MultipleChoiceValidationStrategy` - множественный выбор
- `MatchingValidationStrategy` - сопоставление
- `DetailedValidationStrategy` - развернутый ответ

#### 2. Factory Pattern

`ExamFactory` с `ExamDataRegistry` создает экземпляры экзаменов (`OGEMathExam`, `EGEProfileMathExam`, и т.д.) на основе параметров.

#### 3. Singleton Pattern

Сервисы используют паттерн Singleton:

- `ActiveTestService.getInstance()`
- `ExamFactory.getInstance()`
- `ExamDataRegistry.getInstance()`

#### 4. Domain Model

Богатые доменные объекты с поведением (не анемичные DTO):

- `Exam` - содержит логику валидации, расчета баллов
- `Task` - содержит логику валидации ответа
- `TestSession` - управляет состоянием теста, навигацией, паузой/возобновлением

### Маршрутизация

Все маршруты определены в `App.tsx` с использованием React Router v6:

- `/` - Главная страница
- `/login`, `/register` - Аутентификация
- `/dashboard` - Панель управления
- `/profile` - Профиль пользователя
- `/diagnostic` - Входная диагностика
- `/test/setup/:subject` - Выбор класса для теста
- `/test/oge-ege` - ОГЭ/ЕГЭ по математике
- `/test/ege-type` - Выбор типа ЕГЭ (профиль/база)
- `/leaderboard` - Таблица лидеров
- `/learning-plan` - Персональный план обучения

### State Management

- **Глобальное состояние**: Zustand для auth (с localStorage persistence)
- **Локальное состояние**: React hooks (useState, useReducer)
- **Сессия теста**: `TestSession` модель с сериализацией в localStorage
- **Активные тесты**: `ActiveTestService` singleton

## Shared Package

Общие типы и константы, используемые как в backend, так и в frontend:

- `Subject` - Предметы (MATHEMATICS, RUSSIAN, PHYSICS, и т.д.)
- `ExamType` - Типы экзаменов (OGE, EGE, VPR, LYCEUM)
- `UserStatus` - Статусы пользователей (STUDENT, APPLICANT)
- `Direction` - Направления обучения (MATHEMATICAL, LINGUISTIC, и т.д.)
- Константы: `SUBJECT_LABELS`, `AVAILABLE_GRADES`, и т.д.

## sdamgia_api

Python библиотека для загрузки тестов с платформы sdamgia.ru:

- Поддержка ОГЭ и ЕГЭ по математике
- Парсинг вариантов тестов
- Экспорт в SQLite database

**Использование:**

```bash
python3 backend/scripts/fetch_sdamgia_tests.py
```

Автоматически загружается при старте backend сервера, если тестов нет в базе.

## Deployment

### Development

```bash
# Вариант 1: Универсальный скрипт (рекомендуется)
./start.sh          # Linux/macOS
start.bat           # Windows

# Вариант 2: Вручную
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Git Workflow

### Pre-commit hooks (Husky + lint-staged)

При каждом коммите автоматически:

- Форматирование кода (Prettier)
- Линтинг (ESLint)
- Type-checking (TypeScript)
- Проверка на console.log/debugger
- Проверка на merge conflicts

### Branches

- `main` - Production-ready код
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL="/api"
```

## Performance Optimizations

### Frontend

- **GPU Acceleration**: `transform: translateZ(0)`, `backface-visibility: hidden`
- **CSS Containment**: `contain: layout style`
- **Debounced inputs**: Для поиска и фильтров
- **Lazy loading**: React.lazy для больших компонентов
- **Мемоизация**: useMemo, useCallback для тяжелых вычислений
- **Reduced motion**: Оптимизация анимаций (убраны mousemove listeners, уменьшены blur эффекты)

### Backend

- **Database indexing**: Индексы на часто используемые поля
- **Connection pooling**: Prisma connection pool
- **Caching**: In-memory кэш для часто запрашиваемых данных

## Security

- **Authentication**: JWT tokens с refresh logic
- **Password hashing**: bcrypt
- **Input validation**: express-validator на backend, стратегии на frontend
- **CORS**: Настроенный CORS для разрешенных origins
- **SQL Injection prevention**: Prisma ORM (параметризованные запросы)
- **XSS prevention**: React автоматически экранирует данные

## Testing Strategy

- **Unit tests**: Для сервисов и стратегий
- **Integration tests**: Для API endpoints
- **E2E tests**: Для критических user flows
- **Manual QA**: Перед каждым релизом

## CI/CD

TBD - планируется настроить GitHub Actions для:

- Автоматического тестирования
- Линтинга
- Build verification
- Deployment на production

## Monitoring & Logging

- **Backend**: Winston logger (планируется)
- **Frontend**: Error boundary + Sentry integration (планируется)
- **Analytics**: Google Analytics или аналог (планируется)

## Future Improvements

1. **WebSocket**: Для real-time уведомлений
2. **Redis**: Для кэширования и session management
3. **Docker**: Контейнеризация для простого deployment
4. **Kubernetes**: Для масштабирования на production
5. **GraphQL**: Замена REST API на GraphQL
6. **Mobile App**: React Native приложение
7. **AI Tutor**: Интеграция AI для персональных рекомендаций
8. **Video Lessons**: Интеграция видео-уроков
9. **Social Features**: Групповые занятия, соревнования

## Контакты и поддержка

- **Repository**: https://github.com/princeofscale/ly64-project
- **Issues**: https://github.com/princeofscale/ly64-project/issues
- **Email**: [добавить email]

## Лицензия

MIT License (см. LICENSE файл)
