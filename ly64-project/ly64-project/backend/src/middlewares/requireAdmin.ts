import prismaClient from '../config/database';
import RoleService from '../services/roleService';
import { logger } from '../utils/logger';

import type { Request, Response, NextFunction } from 'express';

const roleService = new RoleService(prismaClient);

export const requireAdmin = async (
  request: Request,
  _response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await roleService.validateAdminAccess(request.userId, request);
    next();
  } catch (error) {
    logger.error('Error in requireAdmin middleware', { error });
    next(error);
  }
};
