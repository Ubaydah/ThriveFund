import type { Request, Response, NextFunction } from 'express';
import { Errors } from '../lib/errors';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return next(Errors.forbidden('Admin access required'));
  next();
};
