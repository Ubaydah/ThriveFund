import type { Request, Response, NextFunction } from 'express';
import { ok, noContent } from '../../lib/response';
import { usersService } from './users.service';
import { updateProfileSchema, changePasswordSchema, notificationPrefsSchema } from './users.schema';

export const usersController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getProfile(req.user!.sub);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateProfileSchema.parse(req.body);
      const data = await usersService.updateProfile(req.user!.sub, body);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const body = changePasswordSchema.parse(req.body);
      await usersService.changePassword(req.user!.sub, body);
      noContent(res);
    } catch (err) { next(err); }
  },

  async getNotificationPrefs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getNotificationPrefs(req.user!.sub);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async updateNotificationPrefs(req: Request, res: Response, next: NextFunction) {
    try {
      const body = notificationPrefsSchema.parse(req.body);
      const data = await usersService.updateNotificationPrefs(req.user!.sub, body);
      ok(res, data);
    } catch (err) { next(err); }
  },
};
