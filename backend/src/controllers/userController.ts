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

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar },
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

  private extractUserId(req: Request): string {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    return userId;
  }

  private extractUpdateData(body: Record<string, unknown>): UpdateProfileData {
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.currentGrade !== undefined) {
      updateData.currentGrade = body.currentGrade;
    }
    if (body.desiredDirection !== undefined) {
      updateData.desiredDirection = body.desiredDirection;
    }
    if (body.motivation !== undefined) {
      updateData.motivation = body.motivation;
    }
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio;
    }
    if (body.isPublic !== undefined) {
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
