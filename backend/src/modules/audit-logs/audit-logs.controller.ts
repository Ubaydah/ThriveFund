import type { Request, Response, NextFunction } from 'express';
import { ok } from '../../lib/response';
import { auditLogsService } from './audit-logs.service';

export const auditLogsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await auditLogsService.list({
        action: req.query.action as string | undefined,
        actor_id: req.query.actor_id as string | undefined,
        organization_id: req.query.organization_id as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },
};
