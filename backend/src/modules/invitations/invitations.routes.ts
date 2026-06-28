import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { invitationsController } from './invitations.controller';

export const invitationsRouter = Router({ mergeParams: true });

invitationsRouter.post('/', requireAuth, invitationsController.sendToGoal);
invitationsRouter.get('/', requireAuth, invitationsController.listByGoal);

// Public accept
export const invitationsPublicRouter = Router();
invitationsPublicRouter.post('/:token/accept', invitationsController.accept);
