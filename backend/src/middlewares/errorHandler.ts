import { ZodError } from 'zod';

import { logger } from '../utils/logger';

import type { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: unknown[];
}

export const errorHandler = (err: ApiError | ZodError, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const statusCode = (err as ApiError).statusCode || 500;
  const internalMessage = err.message || 'Internal Server Error';

  logger.error(`Error: ${internalMessage}`, err);

  // Don't leak internal error details to client on 500
  const clientMessage = statusCode === 500
    ? 'Внутренняя ошибка сервера'
    : internalMessage;

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    errors: (err as ApiError).errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  errors?: unknown[];

  constructor(message: string, statusCode: number = 500, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
