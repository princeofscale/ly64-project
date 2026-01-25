import { Request, Response, NextFunction } from 'express';
export declare function getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function updateAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function updatePrivacy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function checkAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>;
export declare function getUserRank(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=userController.d.ts.map
