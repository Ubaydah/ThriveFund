import type { Request, Response, NextFunction } from 'express';
import { ok, created } from '../../lib/response';
import { organizationsService } from './organizations.service';
import { createOrganizationSchema, updateOrganizationSchema } from './organizations.validators';

export const organizationsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createOrganizationSchema.parse(req.body);
      const data = await organizationsService.create(req.user!.sub, body);
      created(res, data);
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await organizationsService.list(req.user!.sub, {
        page: req.query.page ? Number(req.query.page) : undefined,
        per_page: req.query.per_page ? Number(req.query.per_page) : undefined,
      });
      ok(res, data, meta);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizationsService.getById(req.user!.sub, req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateOrganizationSchema.parse(req.body);
      const data = await organizationsService.update(req.user!.sub, req.params.id, body);
      ok(res, data);
    } catch (err) { next(err); }
  },
};
