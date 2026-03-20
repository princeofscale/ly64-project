# План: Улучшение Лидерборда и Профиля

## Проблема 1: Лидерборд пустой

**Причина**: Фронтенд НЕ отправляет токен авторизации при запросе лидерборда!

```typescript
// LeaderboardPage.tsx:94 - НЕТ auth header!
const response = await fetch(`/api/users/leaderboard?${params}`);
```

А бэкенд ТРЕБУЕТ авторизацию:
```typescript
// user.ts:28
router.get('/leaderboard', authenticateToken, getLeaderboard);
```

Результат: запрос возвращает 401, лидерборд всегда пуст.

**Исправление**:
1. Добавить `Authorization: Bearer ${token}` в fetch запрос лидерборда
2. Или сделать эндпоинт публичным (убрать authenticateToken) - лидерборд должен быть виден всем

**Бэкенд уже работает правильно**: LeaderboardService считает реальные очки из TestAttempt:
- +10 за каждый пройденный тест
- +5 * средний балл
- +2 * лучший балл
- +50 за каждое достижение

## Проблема 2: "Любимый предмет" захардкожен

**Причина**: Фронтенд показывает fallback "MATHEMATICS" когда нет данных:
```typescript
// ProfilePage.tsx:482
{getSubjectLabel(stats?.favoriteSubject || 'MATHEMATICS')}
```

**Бэкенд уже считает правильно**: `findFavoriteSubject()` возвращает предмет с наибольшим числом попыток. Но если тестов нет - возвращает DEFAULT_VALUES.FAVORITE_SUBJECT.

**Исправление**:
1. В бэкенде: если нет тестов → вернуть `null` вместо "MATHEMATICS"
2. В фронтенде: если favoriteSubject === null → показать "Не определено" вместо "Математика"

## Файлы для изменения:

### Frontend:
1. `frontend/src/pages/LeaderboardPage.tsx` - добавить auth header
2. `frontend/src/pages/ProfilePage.tsx` - обработать null favoriteSubject

### Backend:
1. `backend/src/services/userStatsService.ts` - вернуть null если нет тестов
2. `backend/src/constants/statsConstants.ts` - проверить DEFAULT_VALUES
