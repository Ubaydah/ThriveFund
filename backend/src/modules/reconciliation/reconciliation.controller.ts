import type { Request, Response, NextFunction } from 'express';
import { ok } from '../../lib/response';
import { reconciliationService } from './reconciliation.service';
import { resolveReconciliationSchema } from './reconciliation.validators';
import { requireAdmin } from '../../middleware/admin.middleware';

export const reconciliationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await reconciliationService.list(req.user!.sub, {
        status: req.query.status as string | undefined,
        organization_id: req.query.organization_id as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reconciliationService.overview(req.user!.sub);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reconciliationService.getById(req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  },
};

export const adminReconciliationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await reconciliationService.listAdmin({
        status: req.query.status as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const body = resolveReconciliationSchema.parse(req.body);
      const data = await reconciliationService.resolveManual(req.params.id, body);
      ok(res, data);
    } catch (err) { next(err); }
  },
};
