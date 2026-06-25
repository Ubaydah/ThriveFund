import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { notificationsController } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', notificationsController.list);
notificationsRouter.get('/unread-count', notificationsController.unreadCount);
notificationsRouter.patch('/:id/read', notificationsController.markRead);
notificationsRouter.post('/read-all', notificationsController.markAllRead);
