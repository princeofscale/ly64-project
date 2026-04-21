export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const NOT_FOUND_MESSAGES = {
  ROUTE_NOT_FOUND: 'Запрашиваемый ресурс не найден',
  API_ENDPOINT_NOT_FOUND: 'API endpoint не существует',
  PAGE_NOT_FOUND: '404 - Страница не найдена',
  SUGGESTION: 'Проверьте правильность URL адреса',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  HTML: 'text/html',
  TEXT: 'text/plain',
} as const;
