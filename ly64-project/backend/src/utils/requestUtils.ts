import { HTTP_STATUS_CODES, AUTH_MESSAGES } from '../constants/authConstants';
import { AppError } from '../middlewares/errorHandler';

import type { Request } from 'express';

export class RequestUtils {
  public static extractUserId(request: Request): string {
    const userId = request.userId;

    if (!userId || typeof userId !== 'string') {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    return userId;
  }

  public static extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return AUTH_MESSAGES.UNKNOWN_ERROR;
  }
}
