# Лицей-интернат №64 - Платформа подготовки к поступлению

Веб-платформа для подготовки к поступлению в Лицей-интернат №64 г. Саратова (8 и 10 классы), а также к ОГЭ и ЕГЭ.

## О проекте

Это некоммерческий учебный EdTech-проект, разработанный в рамках итогового школьного проекта (9 класс). Платформа предоставляет интерактивный тренажер для подготовки к вступительным экзаменам.

### Официальная информация о лицее

- **Название:** Лицей-интернат №64
- **Город:** Саратов
- **Телефон:** +7 (8452) 79-64-64
- **Email:** sarli64@mail.ru
- **Сайт:** [lic-int64-saratov-r64.gosweb.gosuslugi.ru](https://lic-int64-saratov-r64.gosweb.gosuslugi.ru)

## Направления обучения

1. **Программирование** - физика, информатика
2. **Робототехника** - физика, информатика
3. **Медицина будущего** - биология
4. **Биотехнологии** - биология
5. **Культура** - история, английский язык

**Обязательные предметы для всех направлений:** русский язык, математика

## Технологический стек

### Frontend
- React 18 + TypeScript
- Vite (сборка)
- Tailwind CSS (стилизация)
- React Router (навигация)
- Zustand (управление состоянием)
- Axios (HTTP-клиент)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (в разработке, легко мигрировать на PostgreSQL)
- JWT (аутентификация)

### Shared
- Общие TypeScript типы
- Константы приложения

## Структура проекта

```
lyceum_project/
├── frontend/          # React frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API сервисы
│   │   ├── store/         # Zustand store
│   │   ├── utils/         # Утилиты
│   │   └── types/         # TypeScript типы
│   └── package.json
│
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/        # API маршруты
│   │   ├── controllers/   # Контроллеры
│   │   ├── services/      # Бизнес-логика
│   │   ├── middlewares/   # Middleware
│   │   └── utils/         # Утилиты
│   ├── prisma/
│   │   └── schema.prisma  # Prisma схема БД
│   └── package.json
│
├── shared/            # Общие типы и константы
│   ├── src/
│   │   ├── types/         # TypeScript типы
│   │   └── constants/     # Константы
│   └── package.json
│
└── package.json       # Root package.json для workspaces
```

## Установка и запуск

### Требования
- Node.js >= 18
- npm >= 9

### Установка зависимостей

```bash
# Установить зависимости для всех пакетов
npm install
```

### Настройка Backend

1. Создайте файл `.env` в директории `backend/`:
```bash
cp backend/.env.example backend/.env
```

2. Инициализируйте базу данных:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Запуск приложения

#### Режим разработки (одновременный запуск frontend и backend)
```bash
npm run dev
```

#### Раздельный запуск

Frontend (http://localhost:5173):
```bash
npm run dev:frontend
```

Backend (http://localhost:3001):
```bash
npm run dev:backend
```

### Сборка для продакшена

```bash
npm run build
```

## Доступные команды

### Root (для всех пакетов)
- `npm run dev` - запуск frontend и backend в режиме разработки
- `npm run build` - сборка всех пакетов
- `npm run test` - запуск тестов
- `npm run lint` - проверка кода
- `npm run type-check` - проверка типов TypeScript

### Backend
- `npm run dev` - запуск в режиме разработки с hot-reload
- `npm run build` - сборка TypeScript
- `npm run start` - запуск собранного приложения
- `npm run prisma:generate` - генерация Prisma Client
- `npm run prisma:migrate` - применение миграций БД
- `npm run prisma:studio` - открыть Prisma Studio
- `npm run db:seed` - заполнение БД тестовыми данными

### Frontend
- `npm run dev` - запуск dev-сервера Vite
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр production сборки

### Shared
- `npm run build` - сборка TypeScript типов
- `npm run dev` - watch-режим для разработки

## API Endpoints (планируется)

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `POST /api/auth/logout` - выход

### Тесты
- `GET /api/tests` - список тестов
- `GET /api/tests/:id` - получить тест
- `POST /api/tests/:id/attempt` - начать прохождение
- `PUT /api/tests/:id/attempt/:attemptId` - сохранить ответы
- `POST /api/tests/:id/attempt/:attemptId/complete` - завершить тест

### Вопросы
- `GET /api/questions` - список вопросов (с фильтрами)
- `GET /api/questions/:id` - получить вопрос

### Пользователь
- `GET /api/users/me` - текущий пользователь
- `GET /api/users/me/progress` - прогресс пользователя
- `GET /api/users/me/stats` - статистика пользователя

## Функционал (MVP)

- ✅ Базовая структура проекта
- ✅ Типизация данных
- ⏳ Аутентификация пользователей
- ⏳ База вопросов по предметам
- ⏳ Интерактивные тесты
- ⏳ Система оценки ответов
- ⏳ Отслеживание прогресса
- ⏳ Статистика и аналитика

## Планы развития

- Расширенная база вопросов
- Адаптивные тесты
- Мобильное приложение
- Система рекомендаций
- Геймификация
- Социальные функции
- Интеграция с официальным сайтом лицея

## Лицензия

MIT - это некоммерческий учебный проект

## Авторы

Учебный проект 9 класса

## Источники информации

Вся информация взята с официального сайта Лицея-интерната №64:
- [Информация для поступающих](https://lic-int64-saratov-r64.gosweb.gosuslugi.ru/roditelyam-i-uchenikam/poleznaya-informatsiya/informatsiya-dlya-postupayuschih/)
