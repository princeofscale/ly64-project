import { Router } from 'express';

import type { Request, Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      dev: 'princeofscale',
      telegram: '@tqwit',
    },
  });
});

export default router;
