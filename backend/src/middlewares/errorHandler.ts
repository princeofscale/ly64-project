import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (err: ApiError | ZodError, _req: Request, res: Response, _next: NextFunction) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error: ${message}`, err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: (err as ApiError).errors,
    ...(process.env.NODE_ENV === 'development' && { stack: 'ошибочка)' }),
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
