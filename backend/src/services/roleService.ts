import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { ROLE_TYPES, ROLE_ERROR_MESSAGES, ROLE_HTTP_STATUS } from '../constants/roleConstants';
import { UserRole, RoleCheckResult } from '../types/roleTypes';
import { logSecurityEvent, SecurityEvent } from '../utils/logger';

export class RoleService {
  constructor(private readonly prisma: PrismaClient) {}

  public async validateAdminAccess(userId: string | undefined, request: Request): Promise<void> {
    this.ensureUserIdExists(userId);
    const user = await this.fetchUserRole(userId as string);
    this.ensureUserExists(user, userId as string, request);
    this.ensureUserIsAdmin(user as UserRole, userId as string, request);
    this.logSuccessfulAdminAccess(userId as string, request);
  }

  private ensureUserIdExists(userId: string | undefined): void {
    if (!userId) {
      throw new AppError(ROLE_ERROR_MESSAGES.UNAUTHORIZED, ROLE_HTTP_STATUS.UNAUTHORIZED);
    }
  }

  private async fetchUserRole(userId: string): Promise<UserRole | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
  }

  private ensureUserExists(user: UserRole | null, userId: string, request: Request): void {
    if (!user) {
      this.logUnauthorizedAccess(userId, request, ROLE_ERROR_MESSAGES.USER_NOT_FOUND);
      throw new AppError(ROLE_ERROR_MESSAGES.USER_NOT_FOUND, ROLE_HTTP_STATUS.NOT_FOUND);
    }
  }

  private ensureUserIsAdmin(user: UserRole, userId: string, request: Request): void {
    const roleCheck = this.checkAdminRole(user);

    if (!roleCheck.isAdmin) {
      this.logForbiddenAccess(userId, request, roleCheck.role);
      throw new AppError(ROLE_ERROR_MESSAGES.FORBIDDEN, ROLE_HTTP_STATUS.FORBIDDEN);
    }
  }

  private checkAdminRole(user: UserRole): RoleCheckResult {
    return {
      isAdmin: user.role === ROLE_TYPES.ADMIN,
      role: user.role,
    };
  }

  private logUnauthorizedAccess(userId: string, request: Request, reason: string): void {
    logSecurityEvent({
      event: SecurityEvent.UNAUTHORIZED_ACCESS,
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      details: { reason, path: request.path, method: request.method },
      severity: 'high',
    });
  }

  private logForbiddenAccess(userId: string, request: Request, role: string): void {
    logSecurityEvent({
      event: SecurityEvent.UNAUTHORIZED_ACCESS,
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      details: {
        reason: ROLE_ERROR_MESSAGES.FORBIDDEN,
        role,
        path: request.path,
        method: request.method,
      },
      severity: 'high',
    });
  }

  private logSuccessfulAdminAccess(userId: string, request: Request): void {
    logSecurityEvent({
      event: SecurityEvent.ADMIN_ACTION,
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      details: {
        action: 'admin_access_granted',
        path: request.path,
        method: request.method,
      },
      severity: 'medium',
    });
  }
}

export default RoleService;
