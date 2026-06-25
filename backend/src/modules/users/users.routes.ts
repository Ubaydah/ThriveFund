import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { usersController } from './users.controller';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', usersController.getProfile);
usersRouter.patch('/me', usersController.updateProfile);
usersRouter.patch('/me/password', usersController.changePassword);
usersRouter.get('/me/notification-preferences', usersController.getNotificationPrefs);
usersRouter.patch('/me/notification-preferences', usersController.updateNotificationPrefs);
