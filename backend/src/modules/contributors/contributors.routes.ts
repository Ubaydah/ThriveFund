import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { contributorsController } from './contributors.controller';

export const contributorsRouter = Router();

contributorsRouter.use(requireAuth);

// Top-level list across all goals
contributorsRouter.get('/', contributorsController.listAll);
