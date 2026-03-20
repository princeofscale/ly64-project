import bcrypt from 'bcrypt';

import prisma from '../config/database';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/statsConstants';
import { AppError } from '../middlewares/errorHandler';
import achievementService from '../services/achievementService';
import errorAnalysisService from '../services/errorAnalysisService';
import { LeaderboardService } from '../services/leaderboardService';
import { UserProfileService } from '../services/userProfileService';
import { UserStatsService } from '../services/userStatsService';

import type { UpdateProfileData } from '../types/userTypes';
import type { Request, Response, NextFunction } from 'express';

const userStatsService = new UserStatsService(prisma);
const userProfileService = new UserProfileService(prisma);
const leaderboardService = new LeaderboardService(prisma);

class UserController {
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          status: true,
          currentGrade: true,
          desiredDirection: true,
          motivation: true,
          authProvider: true,
          avatar: true,
          bio: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.params;

      if (!username || typeof username !== 'string') {
        throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const profile = await userProfileService.getPublicProfile(username);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const updateData = this.extractUpdateData(req.body);

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          status: true,
          currentGrade: true,
          desiredDirection: true,
          motivation: true,
          authProvider: true,
          avatar: true,
          bio: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const { avatar } = req.body;

      if (!avatar) {
        throw new AppError(ERROR_MESSAGES.AVATAR_REQUIRED, HTTP_STATUS.BAD_REQUEST);
      }

      const validatedAvatar = this.validateAvatar(avatar);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: validatedAvatar },
        select: {
          id: true,
          avatar: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async updatePrivacy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const { isPublic } = req.body;

      if (typeof isPublic !== 'boolean') {
        throw new AppError(ERROR_MESSAGES.INVALID_PRIVACY, HTTP_STATUS.BAD_REQUEST);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isPublic },
        select: {
          id: true,
          isPublic: true,
        },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = this.extractSearchQuery(req.query.q);
      const users = await userProfileService.searchUsers(query);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  public async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const stats = await userStatsService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  public async getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);

      const achievements = await achievementService.getAllAchievementsWithProgress(userId);
      const stats = await achievementService.getUserAchievementStats(userId);

      res.json({
        achievements,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  public async checkAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const newAchievements = await achievementService.checkAndUnlockAchievements(userId);

      res.json({
        message: ERROR_MESSAGES.ACHIEVEMENTS_CHECKED,
        newAchievements,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = this.extractQueryParam(req.query.period);
      const subject = this.extractQueryParam(req.query.subject);
      const limit = this.extractQueryParam(req.query.limit);

      const leaderboard = await leaderboardService.getLeaderboard(period, subject, limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  public async getUserRank(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const rank = await leaderboardService.getUserRank(userId);
      res.json(rank);
    } catch (error) {
      next(error);
    }
  }

  public async getErrorAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const analysis = await errorAnalysisService.getDetailedAnalysis(userId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.extractUserId(req);
      const { currentPassword, newPassword } = req.body as Record<string, unknown>;

      if (typeof currentPassword !== 'string' || !currentPassword) {
        throw new AppError('Укажите текущий пароль', HTTP_STATUS.BAD_REQUEST);
      }
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        throw new AppError('Новый пароль должен быть не менее 8 символов', HTTP_STATUS.BAD_REQUEST);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        throw new AppError('Смена пароля недоступна для этого аккаунта', HTTP_STATUS.BAD_REQUEST);
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new AppError('Неверный текущий пароль', HTTP_STATUS.UNAUTHORIZED);
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

      res.json({ message: 'Пароль успешно изменён' });
    } catch (error) {
      next(error);
    }
  }

  private extractUserId(req: Request): string {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    return userId;
  }

  private validateString(value: unknown, maxLength: number, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new AppError(`${fieldName} должно быть строкой`, HTTP_STATUS.BAD_REQUEST);
    }
    if (value.length > maxLength) {
      throw new AppError(`${fieldName} не должно превышать ${maxLength} символов`, HTTP_STATUS.BAD_REQUEST);
    }
    return value.trim();
  }

  private validateAvatar(value: unknown): string {
    if (typeof value !== 'string') {
      throw new AppError('Некорректный формат аватара', HTTP_STATUS.BAD_REQUEST);
    }
    // Only allow emoji avatars (short strings) or safe URL patterns
    if (value.length > 500) {
      throw new AppError('Аватар слишком длинный', HTTP_STATUS.BAD_REQUEST);
    }
    // Block javascript: and dangerous data: URIs to prevent XSS
    const lower = value.toLowerCase().trim();
    if (lower.startsWith('javascript:') || lower.startsWith('data:text/html') || lower.startsWith('data:image/svg')) {
      throw new AppError('Недопустимый формат аватара', HTTP_STATUS.BAD_REQUEST);
    }
    return value.trim();
  }

  private extractUpdateData(body: Record<string, unknown>): UpdateProfileData {
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = this.validateString(body.name, 100, 'Имя');
    }
    if (body.status !== undefined) {
      const validStatuses = ['STUDENT', 'APPLICANT'];
      if (typeof body.status !== 'string' || !validStatuses.includes(body.status)) {
        throw new AppError('Статус должен быть STUDENT или APPLICANT', HTTP_STATUS.BAD_REQUEST);
      }
      updateData.status = body.status;
    }
    if (body.currentGrade !== undefined) {
      const grade = Number(body.currentGrade);
      if (!Number.isInteger(grade) || grade < 1 || grade > 11) {
        throw new AppError('Класс должен быть от 1 до 11', HTTP_STATUS.BAD_REQUEST);
      }
      updateData.currentGrade = grade;
    }
    if (body.desiredDirection !== undefined) {
      const validDirections = ['PROGRAMMING', 'ROBOTICS', 'MEDICINE', 'BIOTECHNOLOGY', 'CULTURE'];
      if (body.desiredDirection !== null && (typeof body.desiredDirection !== 'string' || !validDirections.includes(body.desiredDirection))) {
        throw new AppError('Некорректное направление', HTTP_STATUS.BAD_REQUEST);
      }
      updateData.desiredDirection = body.desiredDirection;
    }
    if (body.motivation !== undefined) {
      updateData.motivation = this.validateString(body.motivation, 500, 'Мотивация');
    }
    if (body.avatar !== undefined) {
      updateData.avatar = this.validateAvatar(body.avatar);
    }
    if (body.bio !== undefined) {
      updateData.bio = this.validateString(body.bio, 1000, 'Биография');
    }
    if (body.isPublic !== undefined) {
      if (typeof body.isPublic !== 'boolean') {
        throw new AppError('isPublic должно быть булевым значением', HTTP_STATUS.BAD_REQUEST);
      }
      updateData.isPublic = body.isPublic;
    }

    return updateData;
  }

  private extractSearchQuery(query: unknown): string {
    if (typeof query === 'string') {
      return query;
    }
    return '';
  }

  private extractQueryParam(param: unknown): string | undefined {
    if (typeof param === 'string') {
      return param;
    }
    if (Array.isArray(param) && param.length > 0 && typeof param[0] === 'string') {
      return param[0];
    }
    return undefined;
  }
}

const controller = new UserController();

export const getProfile = controller.getProfile.bind(controller);
export const getPublicProfile = controller.getPublicProfile.bind(controller);
export const updateProfile = controller.updateProfile.bind(controller);
export const updateAvatar = controller.updateAvatar.bind(controller);
export const updatePrivacy = controller.updatePrivacy.bind(controller);
export const searchUsers = controller.searchUsers.bind(controller);
export const getStats = controller.getStats.bind(controller);
export const getAchievements = controller.getAchievements.bind(controller);
export const checkAchievements = controller.checkAchievements.bind(controller);
export const getLeaderboard = controller.getLeaderboard.bind(controller);
export const getUserRank = controller.getUserRank.bind(controller);
export const getErrorAnalysis = controller.getErrorAnalysis.bind(controller);
export const changePassword = controller.changePassword.bind(controller);
