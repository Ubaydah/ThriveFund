import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { communityController } from './community.controller';

export const communityRouter = Router();

communityRouter.use(requireAuth);

// Mounted at /community-projects → GET /
// Mounted at /search            → GET /
communityRouter.get('/', (req, res, next) => {
  if (req.baseUrl.includes('search')) {
    return communityController.search(req, res, next);
  }
  return communityController.listProjects(req, res, next);
});
