import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { auditLogsController } from './audit-logs.controller';

export const auditLogsRouter = Router();
auditLogsRouter.use(requireAuth, requireAdmin);
auditLogsRouter.get('/', auditLogsController.list);
