import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { organizationsController } from './organizations.controller';

export const organizationsRouter = Router();
organizationsRouter.use(requireAuth);

organizationsRouter.post('/', organizationsController.create);
organizationsRouter.get('/', organizationsController.list);
organizationsRouter.get('/:id', organizationsController.getById);
organizationsRouter.patch('/:id', organizationsController.update);
