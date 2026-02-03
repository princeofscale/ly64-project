import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}
export declare const errorHandler: (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => void;
export declare class AppError extends Error implements ApiError {
  statusCode: number;
  errors?: any[];
  constructor(message: string, statusCode?: number, errors?: any[]);
}
//# sourceMappingURL=errorHandler.d.ts.map
