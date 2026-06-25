import type { Request, Response } from 'express';
import { checkDbConnection } from '../../config/database';

export const healthController = {
  liveness(_req: Request, res: Response) {
    res.json({ status: 'ok' });
  },

  async readiness(_req: Request, res: Response) {
    const dbOk = await checkDbConnection();
    const status = dbOk ? 'ready' : 'degraded';
    res.status(dbOk ? 200 : 503).json({
      status,
      checks: {
        database: dbOk ? 'ok' : 'error',
        nomba_api: 'unknown', // TODO: add Nomba ping check
      },
    });
  },
};
