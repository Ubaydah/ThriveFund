import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { organizationMembersController } from './organization-members.controller';

export const organizationMembersRouter = Router({ mergeParams: true });
organizationMembersRouter.use(requireAuth);

organizationMembersRouter.get('/', organizationMembersController.list);
organizationMembersRouter.post('/', organizationMembersController.add);
organizationMembersRouter.patch('/:memberId', organizationMembersController.updateRole);
organizationMembersRouter.delete('/:memberId', organizationMembersController.remove);
