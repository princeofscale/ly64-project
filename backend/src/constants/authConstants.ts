export { HTTP_STATUS_CODES } from './httpConstants';

export const AUTH_MESSAGES = {
  REGISTRATION_SUCCESS: 'Пользователь успешно зарегистрирован',
  LOGIN_SUCCESS: 'Вход выполнен успешно',
  LOGOUT_SUCCESS: 'Выход выполнен успешно',
  UNAUTHORIZED: 'Не авторизован',
  ACCOUNT_LOCKED_RETRY:
    'Аккаунт временно заблокирован из-за множества неудачных попыток входа. Попробуйте через',
  ACCOUNT_LOCKED_DURATION:
    'Аккаунт заблокирован на 15 минут из-за множества неудачных попыток входа.',
  REMAINING_ATTEMPTS: 'Осталось попыток:',
  UNKNOWN_ERROR: 'Unknown error',
  MINUTES: 'минут',
} as const;

export const LOCKOUT_SETTINGS = {
  MAX_ATTEMPTS: 5,
  WARNING_THRESHOLD: 3,
  LOCKOUT_DURATION_MINUTES: 15,
} as const;
