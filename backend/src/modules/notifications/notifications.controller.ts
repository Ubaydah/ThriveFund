import type { Request, Response, NextFunction } from 'express';
import { ok, noContent } from '../../lib/response';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await notificationsService.list(req.user!.sub, {
        unread_only: req.query.unread_only === 'true',
        page:        req.query.page ? Number(req.query.page) : undefined,
        per_page:    req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationsService.unreadCount(req.user!.sub);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markRead(req.user!.sub, req.params.id);
      noContent(res);
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllRead(req.user!.sub);
      noContent(res);
    } catch (err) { next(err); }
  },
};
