import type { Request, Response, NextFunction } from 'express';
import { webhooksService } from './webhooks.service';
import { env } from '../../config/env';
import { Errors } from '../../lib/errors';

export const webhooksController = {
  async nomba(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers['x-nomba-signature'] ?? req.headers['x-webhook-signature'] ?? '') as string;
      const rawBody = JSON.stringify(req.body);
      const result = await webhooksService.processNomba(rawBody, signature, req.body);
      res.json({ received: true, ...result as object });
    } catch (err) { next(err); }
  },

  /** Dev/demo: simulate mock payment webhook (disabled in production) */
  async simulateMock(req: Request, res: Response, next: NextFunction) {
    try {
      if (env.NODE_ENV === 'production') {
        throw Errors.forbidden('Mock webhook simulation is disabled in production');
      }
      const result = await webhooksService.simulateMockPayment(req.body);
      res.json({ simulated: true, ...result as object });
    } catch (err) { next(err); }
  },
};
