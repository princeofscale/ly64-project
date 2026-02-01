import { Response } from 'express';
import {
  AuthSuccessResponse,
  CurrentUserResponse,
  LogoutResponse,
  AuthResult,
  AuthUser,
} from '../types/authTypes';
import { HTTP_STATUS_CODES, AUTH_MESSAGES } from '../constants/authConstants';

export class AuthResponseService {
  public sendRegistrationSuccess(res: Response, result: AuthResult): void {
    const response: AuthSuccessResponse = {
      success: true,
      message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
      data: result,
    };

    res.status(HTTP_STATUS_CODES.CREATED).json(response);
  }

  public sendLoginSuccess(res: Response, result: AuthResult): void {
    const response: AuthSuccessResponse = {
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: result,
    };

    res.status(HTTP_STATUS_CODES.OK).json(response);
  }

  public sendCurrentUser(res: Response, user: AuthUser): void {
    const response: CurrentUserResponse = {
      success: true,
      data: user,
    };

    res.status(HTTP_STATUS_CODES.OK).json(response);
  }

  public sendLogoutSuccess(res: Response): void {
    const response: LogoutResponse = {
      success: true,
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    };

    res.status(HTTP_STATUS_CODES.OK).json(response);
  }
}

export default new AuthResponseService();
