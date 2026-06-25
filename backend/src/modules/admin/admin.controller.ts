import type { Request, Response, NextFunction } from 'express';
import { ok, created } from '../../lib/response';
import { adminService } from './admin.service';

export const adminController = {
  async overview(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await adminService.overview()); } catch (err) { next(err); }
  },

  async listReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await adminService.listReconciliation({
        status:   req.query.status as string | undefined,
        from:     req.query.from as string | undefined,
        to:       req.query.to as string | undefined,
        page:     req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async getReconciliation(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await adminService.getReconciliation(req.params.id)); } catch (err) { next(err); }
  },

  async resolveReconciliation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.resolveReconciliation(req.params.id, req.body);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async listWebhookEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.listWebhookEvents({
        processed:  req.query.processed as string | undefined,
        event_type: req.query.event_type as string | undefined,
        page:       req.query.page ? Number(req.query.page) : undefined,
        per_page:   req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data);
    } catch (err) { next(err); }
  },

  async retryWebhookEvent(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await adminService.retryWebhookEvent(req.params.id)); } catch (err) { next(err); }
  },

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.listUsers({ page: Number(req.query.page ?? 1) });
      ok(res, data);
    } catch (err) { next(err); }
  },

  async listGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.listGoals({ page: Number(req.query.page ?? 1) });
      ok(res, data);
    } catch (err) { next(err); }
  },

  async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.listTransactions({ page: Number(req.query.page ?? 1) });
      ok(res, data);
    } catch (err) { next(err); }
  },
};
