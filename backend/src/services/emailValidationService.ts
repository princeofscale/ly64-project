import axios from 'axios';

/**
 * Email Validation Service
 *
 * УСТАНОВКА (выберите один из вариантов):
 *
 * ВАРИАНТ 1 (рекомендуется): HTTP API через Docker
 * 1. Запустите Docker контейнер:
 *    docker run -p 3000:3000 reacherhq/backend:latest
 * 2. Установите переменную окружения:
 *    REACHER_API_URL=http://localhost:3000
 *
 * ВАРИАНТ 2: Простая валидация (текущая реализация)
 * - Проверка формата
 * - Проверка на одноразовые email
 * - Без внешних зависимостей
 */

export class EmailValidationService {
  private readonly reacherApiUrl = process.env.REACHER_API_URL;
  private readonly useReacherApi = !!this.reacherApiUrl;

  /**
   * Валидация email адреса
   * Проверяет существование и доступность email
   *
   * @param email - Email адрес для проверки
   * @returns true если email валидный и доступен
   */
  async validateEmail(email: string): Promise<boolean> {
    try {
      // Если настроен Reacher API - используем его
      if (this.useReacherApi) {
        return await this.validateWithReacher(email);
      }

      // Иначе используем простую валидацию
      return this.validateSimple(email);
    } catch (error) {
      console.error('Email validation error:', error);
      // Fallback: разрешить регистрацию при ошибке валидации
      return true;
    }
  }

  /**
   * Валидация через Reacher API (check-if-email-exists)
   */
  private async validateWithReacher(email: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.reacherApiUrl}/v0/check_email`,
        { to_email: email },
        { timeout: 10000 }
      );

      const result = response.data;

      // Проверяем результат
      // is_reachable может быть: "safe", "invalid", "risky", "unknown"
      return (
        result.is_reachable === 'safe' ||
        result.is_reachable === 'risky' || // Risky тоже разрешаем
        result.is_reachable === 'unknown' // Unknown тоже разрешаем (на всякий случай)
      );
    } catch (error) {
      console.error('Reacher API error:', error);
      // При ошибке API используем простую валидацию
      return this.validateSimple(email);
    }
  }

  /**
   * Простая валидация email (без внешних API)
   */
  private validateSimple(email: string): boolean {
    // Проверяем базовый формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      return false;
    }

    // Проверяем, что это не одноразовый email сервис
    return this.isNotDisposableEmail(email);
  }

  /**
   * Проверка списка одноразовых email доменов
   * @param email - Email для проверки
   * @returns true если email не одноразовый
   */
  isNotDisposableEmail(email: string): boolean {
    const disposableDomains = [
      'tempmail.com',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
      'fakeinbox.com',
      'yopmail.com',
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }
}

export default new EmailValidationService();
