export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly name: string;
  readonly status?: string;
  readonly currentGrade?: number;
  readonly desiredDirection?: string | null;
  readonly motivation?: string | null;
  readonly authProvider?: string;
  readonly avatar?: string | null;
  readonly role?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface AuthResult {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface AuthSuccessResponse {
  readonly success: true;
  readonly message: string;
  readonly data: AuthResult;
}

export interface CurrentUserResponse {
  readonly success: true;
  readonly data: AuthUser;
}

export interface LogoutResponse {
  readonly success: true;
  readonly message: string;
}

export interface LockoutStatus {
  readonly locked: boolean;
  readonly remainingTime?: number;
}

export interface FailedLoginAttempt {
  readonly attempts: number;
  readonly locked: boolean;
}
