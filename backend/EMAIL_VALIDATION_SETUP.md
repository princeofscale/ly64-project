# Настройка Email Валидации

## Текущий статус
✅ Работает простая валидация (формат + проверка одноразовых email)

## Опции для продвинутой валидации

### Вариант 1: Reacher API через Docker (рекомендуется)

**Преимущества:**
- Полная проверка deliverability (может ли email получать письма)
- Проверка SMTP
- Определение catch-all доменов
- Обнаружение одноразовых email

**Установка:**

1. Установите Docker (если еще не установлен)

2. Запустите Reacher backend:
```bash
docker run -p 3000:3000 reacherhq/backend:latest
```

3. Добавьте в `backend/.env`:
```env
REACHER_API_URL=http://localhost:3000
```

4. Готово! Сервис автоматически будет использовать Reacher API

**Проверка работы:**
```bash
curl -X POST http://localhost:3000/v0/check_email \
  -H "Content-Type: application/json" \
  -d '{"to_email": "test@gmail.com"}'
```

### Вариант 2: Простая валидация (текущая)

**Что проверяет:**
- ✅ Корректность формата email
- ✅ Список известных одноразовых доменов
- ❌ Не проверяет deliverability
- ❌ Не проверяет существование домена

**Настройка:**
Ничего не требуется, работает из коробки.

### Вариант 3: Использовать сторонний API

**Альтернативы:**
- [Abstract Email Validation API](https://www.abstractapi.com/email-verification-validation-api)
- [Hunter.io Email Verifier](https://hunter.io/email-verifier)
- [ZeroBounce](https://www.zerobounce.net/)

Обычно требуют платную подписку для production использования.

## Рекомендации

**Для разработки:**
- Используйте простую валидацию (Вариант 2)

**Для production:**
- Если важна точность: Reacher API (Вариант 1) или сторонний сервис (Вариант 3)
- Если достаточно базовой проверки: простая валидация (Вариант 2)

## Примеры использования

### В коде (уже интегрировано):
```typescript
import emailValidationService from './services/emailValidationService';

const isValid = await emailValidationService.validateEmail('user@example.com');
if (!isValid) {
  throw new Error('Email адрес недоступен');
}
```

### Пример ответа от Reacher API:
```json
{
  "input": "user@gmail.com",
  "is_reachable": "safe",
  "misc": {
    "is_disposable": false,
    "is_role_account": false
  },
  "mx": {
    "accepts_mail": true,
    "records": ["gmail-smtp-in.l.google.com."]
  },
  "smtp": {
    "can_connect_smtp": true,
    "is_deliverable": true,
    "is_disabled": false
  },
  "syntax": {
    "is_valid_syntax": true,
    "domain": "gmail.com",
    "username": "user"
  }
}
```

## Troubleshooting

**Reacher API не отвечает:**
- Проверьте, что Docker контейнер запущен: `docker ps`
- Проверьте логи: `docker logs <container_id>`
- Убедитесь, что порт 3000 свободен

**Медленная валидация:**
- SMTP проверка может занимать 5-10 секунд
- Рассмотрите кеширование результатов или асинхронную проверку

**Ложные срабатывания:**
- Некоторые почтовые сервера блокируют SMTP проверки
- В этом случае сервис вернет `is_reachable: "unknown"` - мы разрешаем такие email
