import type { Request, Response, NextFunction } from 'express';
import { ok, noContent } from '../../lib/response';
import { organizationMembersService } from './organization-members.service';
import { addMemberSchema, updateMemberRoleSchema } from './organization-members.validators';

export const organizationMembersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizationMembersService.list(req.user!.sub, req.params.orgId);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const body = addMemberSchema.parse(req.body);
      const data = await organizationMembersService.add(req.user!.sub, req.params.orgId, body);
      ok(res, data);
    } catch (err) { next(err); }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateMemberRoleSchema.parse(req.body);
      const data = await organizationMembersService.updateRole(
        req.user!.sub, req.params.orgId, req.params.memberId, body,
      );
      ok(res, data);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await organizationMembersService.remove(req.user!.sub, req.params.orgId, req.params.memberId);
      noContent(res);
    } catch (err) { next(err); }
  },
};
