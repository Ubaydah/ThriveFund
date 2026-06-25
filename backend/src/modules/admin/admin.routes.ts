import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { adminController } from './admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/overview', adminController.overview);

adminRouter.get('/reconciliation', adminController.listReconciliation);
adminRouter.get('/reconciliation/:id', adminController.getReconciliation);
adminRouter.post('/reconciliation/:id/resolve', adminController.resolveReconciliation);

adminRouter.get('/webhook-events', adminController.listWebhookEvents);
adminRouter.post('/webhook-events/:id/retry', adminController.retryWebhookEvent);

adminRouter.get('/users', adminController.listUsers);
adminRouter.get('/goals', adminController.listGoals);
adminRouter.get('/transactions', adminController.listTransactions);
