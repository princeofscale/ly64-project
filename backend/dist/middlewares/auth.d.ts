import { Request, Response, NextFunction } from 'express';
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
