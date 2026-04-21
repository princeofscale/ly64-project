export const DATABASE_CONSTANTS = {
  DEFAULT_URL: 'file:./dev.db',
  DEVELOPMENT_ENV: 'development',
} as const;

export const DATABASE_LOG_LEVELS = {
  DEVELOPMENT: ['query', 'error', 'warn'] as const,
  PRODUCTION: ['error'] as const,
} as const;

export const LIFECYCLE_EVENTS = {
  BEFORE_EXIT: 'beforeExit',
  SIGINT: 'SIGINT',
  SIGTERM: 'SIGTERM',
} as const;
