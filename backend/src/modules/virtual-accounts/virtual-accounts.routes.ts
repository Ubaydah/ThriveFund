import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { virtualAccountsController } from './virtual-accounts.controller';

export const virtualAccountsRouter = Router();

virtualAccountsRouter.use(requireAuth);

virtualAccountsRouter.get('/', virtualAccountsController.listAll);
virtualAccountsRouter.get('/:id', virtualAccountsController.getById);
