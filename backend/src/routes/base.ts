import { Router } from 'express';

import type { Request, Response } from 'express';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'API/ is running',
    dev: 'princeofscale',
    telegram: '@tqwit',
  });
});

export default router;
