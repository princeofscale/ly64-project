# 🚀 Руководство по запуску проекта

## ✅ Что уже реализовано

### Backend
- ✅ Расширенная регистрация (статус, класс, направление, мотивация)
- ✅ OAuth интеграция с Dnevnik.ru (готово к настройке)
- ✅ Email валидация (простая + опциональная продвинутая)
- ✅ Система достижений
- ✅ API для профиля и статистики
- ✅ Seed для достижений

### Frontend
- ✅ Многошаговая форма регистрации (6 шагов)
- ✅ ProfilePage с достижениями
- ✅ DashboardPage с статистикой
- ✅ Компоненты ProgressBar и AchievementCard

## 📋 Предварительные требования

- Node.js 18+
- npm
- (Опционально) Docker - для email валидации

## 🛠️ Установка

### 1. Установка зависимостей

Из корневой директории проекта:

```bash
npm install
```

Это установит зависимости для всех workspace (frontend, backend, shared).

### 2. Настройка Backend

#### Создайте .env файл:

```bash
cd backend
cp .env.example .env
```

#### Отредактируйте backend/.env:

```env
# Основные настройки
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173

# Session (для OAuth)
SESSION_SECRET=your-session-secret-change-this

# Email валидация (опционально)
# REACHER_API_URL=http://localhost:3000

# OAuth Dnevnik.ru (опционально)
# DNEVNIK_CLIENT_ID=your_client_id
# DNEVNIK_CLIENT_SECRET=your_client_secret
# DNEVNIK_REDIRECT_URI=http://localhost:3001/api/oauth/dnevnik/callback
```

#### Запустите миграции и seed:

```bash
cd backend

# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Заполнение БД достижениями
npx ts-node prisma/seed.ts
```

## 🎯 Запуск проекта

### Вариант 1: Запуск всего (рекомендуется)

Из корневой директории:

```bash
npm run dev
```

Это запустит одновременно:
- Frontend на http://localhost:5173
- Backend на http://localhost:3001

### Вариант 2: Запуск по отдельности

**Backend:**
```bash
npm run dev:backend
```

**Frontend:**
```bash
npm run dev:frontend
```

## 🧪 Проверка работы

1. Откройте http://localhost:5173
2. Перейдите на страницу регистрации
3. Пройдите все 6 шагов регистрации
4. После регистрации откроется Dashboard
5. Проверьте профиль - должно быть разблокировано достижение "Первые шаги"

## 🔧 Дополнительные настройки

### Email валидация (опционально)

Для продвинутой email валидации:

1. Запустите Docker контейнер:
```bash
docker run -p 3000:3000 reacherhq/backend:latest
```

2. Добавьте в backend/.env:
```env
REACHER_API_URL=http://localhost:3000
```

Подробнее: `backend/EMAIL_VALIDATION_SETUP.md`

### OAuth с Dnevnik.ru (опционально)

Для интеграции с Dnevnik.ru:

1. Зарегистрируйтесь как партнер на https://login.dnevnik.ru/
2. Получите Client ID и Client Secret
3. Настройте Redirect URI: `http://localhost:3001/api/oauth/dnevnik/callback`
4. Добавьте credentials в backend/.env:
```env
DNEVNIK_CLIENT_ID=your_client_id
DNEVNIK_CLIENT_SECRET=your_client_secret
DNEVNIK_REDIRECT_URI=http://localhost:3001/api/oauth/dnevnik/callback
```

Подробнее: `IMPLEMENTATION_PLAN.md` (ФАЗА 2)

## 📊 Prisma Studio

Для просмотра данных в БД:

```bash
cd backend
npm run prisma:studio
```

Откроется http://localhost:5555 с GUI для базы данных.

## 🐛 Troubleshooting

### Ошибка "Port already in use"

**Frontend (5173):**
```bash
lsof -ti:5173 | xargs kill -9
```

**Backend (3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

### Ошибка Prisma

Перегенерируйте client:
```bash
cd backend
npm run prisma:generate
```

### Backend не подключается к Frontend

Проверьте CORS настройки в `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

## 📁 Структура проекта

```
lyceum_project/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Express + Prisma + TypeScript
├── shared/            # Shared types and constants
├── package.json       # Workspace configuration
└── SETUP_GUIDE.md     # Этот файл
```

## 🎨 Доступные страницы

- `/` - Главная страница
- `/login` - Вход
- `/register` - Регистрация (многошаговая форма)
- `/dashboard` - Дашборд пользователя
- `/profile` - Профиль с достижениями
- `/terms` - Условия использования

## 📝 TODO для production

- [ ] Добавить настоящую валидацию email (Reacher API или альтернативу)
- [ ] Настроить OAuth с Dnevnik.ru
- [ ] Добавить защищенные роуты (ProtectedRoute)
- [ ] Переместить на PostgreSQL
- [ ] Настроить переменные окружения для production
- [ ] Добавить логирование (Winston/Pino)
- [ ] Добавить rate limiting
- [ ] Настроить CI/CD

## 📚 Дополнительная документация

- `IMPLEMENTATION_PLAN.md` - Полный план реализации
- `backend/EMAIL_VALIDATION_SETUP.md` - Настройка email валидации
- `CLAUDE.md` - Инструкции для Claude Code

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли (frontend и backend)
2. Проверьте файлы .env
3. Убедитесь, что все зависимости установлены
4. Проверьте, что порты 3001 и 5173 свободны
