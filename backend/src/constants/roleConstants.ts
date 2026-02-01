export const ROLE_TYPES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const ROLE_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Требуется авторизация',
  USER_NOT_FOUND: 'Пользователь не найден',
  FORBIDDEN: 'Доступ запрещён. Требуются права администратора.',
  SERVER_ERROR: 'Ошибка сервера',
} as const;

export const ROLE_HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
