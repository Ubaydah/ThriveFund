import type { Request, Response } from 'express';
import { checkDbConnection } from '../../config/database';
import { getPaymentProvider } from '../../providers/payment';

export const healthController = {
  liveness(_req: Request, res: Response) {
    res.json({ status: 'ok' });
  },

  async readiness(_req: Request, res: Response) {
    const dbOk = await checkDbConnection();
    const provider = getPaymentProvider();
    const providerHealth = await provider.healthCheck();

    const status = dbOk ? 'ready' : 'degraded';
    res.status(dbOk ? 200 : 503).json({
      status,
      checks: {
        database: dbOk ? 'ok' : 'error',
        payment_provider: providerHealth.status,
        payment_provider_message: providerHealth.message,
      },
    });
  },
};
