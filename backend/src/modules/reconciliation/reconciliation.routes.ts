import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { reconciliationController } from './reconciliation.controller';

export const reconciliationRouter = Router();
reconciliationRouter.use(requireAuth);

reconciliationRouter.get('/', reconciliationController.list);
reconciliationRouter.get('/overview', reconciliationController.overview);
reconciliationRouter.get('/:id', reconciliationController.getById);
