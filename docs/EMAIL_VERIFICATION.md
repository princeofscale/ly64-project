# Email Verification - Решения для проекта Lyceum 64

## Обзор

Для реализации email верификации (отправка кодов подтверждения) существует несколько бесплатных решений.

## Рекомендуемые решения

### 1. ✅ Resend (Рекомендуется)
**Сайт**: https://resend.com

**Плюсы:**
- ✅ **100% бесплатно** для начала: 3,000 emails/месяц, 100 emails/день
- ✅ Очень простое API
- ✅ Современный UI и документация
- ✅ Поддержка React Email для красивых шаблонов
- ✅ Не требует домена для тестирования
- ✅ Быстрая настройка (5-10 минут)

**Минусы:**
- ⚠️ Относительно новый сервис (но стабильный)

**Пример использования:**
```typescript
import { Resend } from 'resend';

const resend = new Resend('re_YOUR_API_KEY');

async function sendVerificationCode(email: string, code: string) {
  await resend.emails.send({
    from: 'Lyceum 64 <noreply@resend.dev>',
    to: email,
    subject: 'Код подтверждения - Lyceum 64',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Код подтверждения</h2>
        <p>Ваш код подтверждения:</p>
        <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f0f0f0; text-align: center;">
          ${code}
        </div>
        <p>Код действителен 10 минут.</p>
      </div>
    `,
  });
}
```

---

### 2. ✅ SendGrid (Популярное решение)
**Сайт**: https://sendgrid.com

**Плюсы:**
- ✅ **Бесплатно**: 100 emails/день (3,000/месяц)
- ✅ Очень надежный и популярный
- ✅ Отличная документация
- ✅ Поддержка шаблонов
- ✅ Аналитика и статистика

**Минусы:**
- ⚠️ Более сложная настройка
- ⚠️ Требует верификации домена для production

**Пример использования:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendVerificationCode(email: string, code: string) {
  await sgMail.send({
    to: email,
    from: 'noreply@lyceum64.ru',
    subject: 'Код подтверждения - Lyceum 64',
    html: `<strong>Ваш код: ${code}</strong>`,
  });
}
```

---

### 3. ✅ Mailgun (Для более крупных проектов)
**Сайт**: https://www.mailgun.com

**Плюсы:**
- ✅ **Бесплатно**: 5,000 emails первые 3 месяца, потом $35/месяц за 50k
- ✅ Очень мощный API
- ✅ Отличная доставляемость
- ✅ Email validation API

**Минусы:**
- ⚠️ После пробного периода - платно
- ⚠️ Сложнее в настройке

---

### 4. ✅ Nodemailer + Gmail (Простое решение)
**Сайт**: https://nodemailer.com

**Плюсы:**
- ✅ **Полностью бесплатно**
- ✅ Не требует регистрации на сторонних сервисах
- ✅ Простая настройка
- ✅ Используется обычный Gmail аккаунт

**Минусы:**
- ⚠️ Лимит: ~500 emails/день с Gmail
- ⚠️ Может попадать в спам
- ⚠️ Gmail может блокировать при подозрительной активности

**Пример использования:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Нужен App Password, не обычный пароль
  },
});

async function sendVerificationCode(email: string, code: string) {
  await transporter.sendMail({
    from: '"Lyceum 64" <your-email@gmail.com>',
    to: email,
    subject: 'Код подтверждения',
    html: `<p>Ваш код подтверждения: <strong>${code}</strong></p>`,
  });
}
```

---

### 5. ✅ Brevo (ex-Sendinblue)
**Сайт**: https://www.brevo.com

**Плюсы:**
- ✅ **Бесплатно**: 300 emails/день
- ✅ Простое API
- ✅ SMS интеграция (опционально)
- ✅ Marketing automation

**Минусы:**
- ⚠️ Дневной лимит может быть недостаточен

---

## Сравнение решений

| Сервис | Бесплатный лимит | Сложность настройки | Рекомендация |
|--------|------------------|---------------------|--------------|
| **Resend** | 3,000/месяц | ⭐⭐⭐⭐⭐ Очень просто | ✅ Лучший выбор |
| **SendGrid** | 100/день | ⭐⭐⭐ Средне | ✅ Хороший выбор |
| **Mailgun** | 5,000 (3 месяца) | ⭐⭐ Сложнее | ⚠️ Платно после trial |
| **Nodemailer + Gmail** | 500/день | ⭐⭐⭐⭐ Просто | ⚠️ Может попадать в спам |
| **Brevo** | 300/день | ⭐⭐⭐ Средне | ⚠️ Низкий лимит |

---

## Рекомендация для Lyceum 64

### Вариант 1: Resend (для production)
**Самое простое и надежное решение.**

**Установка:**
```bash
npm install resend --save
```

**Реализация:**

1. Регистрация на https://resend.com
2. Получить API ключ
3. Добавить в `.env`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
4. Создать сервис email:

```typescript
// backend/src/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email: string): Promise<string> {
    const code = this.generateCode();

    // Store code in Redis or database with expiration (10 minutes)
    // await redis.setex(`email_code:${email}`, 600, code);

    await resend.emails.send({
      from: 'Lyceum 64 <noreply@resend.dev>',
      to: email,
      subject: 'Код подтверждения регистрации - Lyceum 64',
      html: this.getEmailTemplate(code),
    });

    return code;
  }

  private getEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .code-box {
            background: linear-gradient(135deg, #06B6D4, #3B82F6);
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin: 20px 0;
            letter-spacing: 8px;
          }
          .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lyceum 64</h1>
            <p>Код подтверждения регистрации</p>
          </div>
          <div class="code-box">${code}</div>
          <p>Введите этот код на странице регистрации для подтверждения вашей электронной почты.</p>
          <p><strong>Код действителен 10 минут.</strong></p>
          <p>Если вы не регистрировались на платформе Lyceum 64, проигнорируйте это письмо.</p>
          <div class="footer">
            <p>© 2026 Lyceum 64. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    // Retrieve code from Redis/database and compare
    // const storedCode = await redis.get(`email_code:${email}`);
    // return storedCode === code;
    return true; // Placeholder
  }
}

export default new EmailService();
```

5. Добавить endpoint в `routes/auth.ts`:

```typescript
router.post('/send-verification-code', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const code = await emailService.sendVerificationCode(email);
    res.json({ success: true, message: 'Код отправлен на email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка отправки кода' });
  }
});

router.post('/verify-code', async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    const isValid = await emailService.verifyCode(email, code);
    if (isValid) {
      res.json({ success: true, message: 'Код подтвержден' });
    } else {
      res.status(400).json({ success: false, message: 'Неверный код' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка проверки кода' });
  }
});
```

---

### Вариант 2: Nodemailer + Gmail (для development/testing)
**Для локальной разработки и тестирования.**

**Установка:**
```bash
npm install nodemailer --save
npm install @types/nodemailer --save-dev
```

**Настройка Gmail:**
1. Включить 2FA на аккаунте Google
2. Создать App Password: https://myaccount.google.com/apppasswords
3. Использовать этот пароль в приложении

---

## План внедрения

### Этап 1: Development (Nodemailer)
1. Использовать Nodemailer + Gmail для тестирования
2. Протестировать flow регистрации
3. Отладить UI/UX

### Этап 2: Production (Resend)
1. Зарегистрироваться на Resend
2. Получить API ключ
3. Заменить Nodemailer на Resend
4. Протестировать на production

### Этап 3: Scaling (если нужно)
1. Если превысили лимит Resend (3,000/месяц)
2. Перейти на платный план Resend ($20/месяц за 50,000 emails)
3. Или мигрировать на SendGrid/Mailgun

---

## Дополнительные улучшения

### 1. Rate Limiting
Ограничить количество запросов кода:
- Максимум 3 запроса в 10 минут с одного email
- Максимум 10 запросов в час с одного IP

### 2. Redis для хранения кодов
Использовать Redis вместо базы данных для временных кодов:
```bash
npm install redis
```

### 3. Email Templates
Создать красивые HTML шаблоны с branding лицея.

### 4. Логирование
Логировать все отправки email для отладки.

---

## Заключение

**Для проекта Lyceum 64 рекомендуется:**
1. **Development**: Nodemailer + Gmail
2. **Production**: Resend (3,000 emails/месяц бесплатно)
3. **Backup**: SendGrid (если нужен запасной вариант)

**Стоимость**: $0 для начала, масштабируется по мере роста.
