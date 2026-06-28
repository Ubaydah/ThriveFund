import { Router } from 'express';
import { webhooksController } from './webhooks.controller';

export const webhooksRouter = Router();

// Mounted at /api/webhooks (no /v1 prefix)
webhooksRouter.post('/nomba', webhooksController.nomba);

/** Mock webhook simulation for demo — POST { account_number, amount, payer_name? } */
webhooksRouter.post('/mock/simulate', webhooksController.simulateMock);
