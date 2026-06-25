import type { Request, Response, NextFunction } from 'express';
import { ok, created } from '../../lib/response';
import { virtualAccountsService } from './virtual-accounts.service';

export const virtualAccountsController = {
  async createForGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await virtualAccountsService.createForGoal(req.user!.sub, req.params.id, req.body);
      created(res, data);
    } catch (err) { next(err); }
  },

  async getForGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await virtualAccountsService.getForGoal(req.user!.sub, req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await virtualAccountsService.listAll(req.user!.sub);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await virtualAccountsService.getById(req.user!.sub, req.params.id);
      ok(res, data);
    } catch (err) { next(err); }
  },
};
