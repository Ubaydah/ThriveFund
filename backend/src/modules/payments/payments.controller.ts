import type { Request, Response, NextFunction } from 'express';
import { ok } from '../../lib/response';
import { paymentsService } from './payments.service';
import { requireAdmin } from '../../middleware/admin.middleware';

export const paymentsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await paymentsService.list({
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentsService.getById(req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  },
};

// Admin-only list
export const adminPaymentsController = {
  list: [requireAdmin, paymentsController.list],
  getById: [requireAdmin, paymentsController.getById],
};
