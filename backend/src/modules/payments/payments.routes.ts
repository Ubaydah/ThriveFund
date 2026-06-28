import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { paymentsController } from './payments.controller';

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth, requireAdmin);

paymentsRouter.get('/', paymentsController.list);
paymentsRouter.get('/:id', paymentsController.getById);
