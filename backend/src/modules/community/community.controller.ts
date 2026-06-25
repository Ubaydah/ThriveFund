import type { Request, Response, NextFunction } from 'express';
import { ok } from '../../lib/response';
import { communityService } from './community.service';
import { Errors } from '../../lib/errors';

export const communityController = {
  async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await communityService.listCommunityProjects(req.user!.sub, {
        category: req.query.category as string | undefined,
        page:     req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q) return next(Errors.validation('Query param `q` is required'));
      const data = await communityService.search(req.user!.sub, {
        q,
        type: req.query.type as string | undefined,
      });
      ok(res, data);
    } catch (err) { next(err); }
  },
};
