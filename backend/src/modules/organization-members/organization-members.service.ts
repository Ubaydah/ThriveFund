import { Errors } from '../../lib/errors';
import { organizationsRepository } from '../organizations/organizations.repository';
import { organizationMembersRepository } from './organization-members.repository';
import type { AddMemberDto, UpdateMemberRoleDto } from './organization-members.validators';
import { v4 as uuid } from 'uuid';

export const organizationMembersService = {
  async list(userId: string, orgId: string) {
    const org = await organizationsRepository.findById(orgId);
    if (!org) throw Errors.notFound('Organization');
    const isMember = await organizationMembersRepository.isMember(orgId, userId);
    if (!isMember) throw Errors.forbidden();
    return organizationMembersRepository.findByOrg(orgId);
  },

  async add(userId: string, orgId: string, body: AddMemberDto) {
    const canManage = await organizationMembersRepository.hasRole(orgId, userId, ['owner', 'admin']);
    if (!canManage) throw Errors.forbidden();
    return organizationMembersRepository.insert({
      id: `om_${uuid().replace(/-/g, '').slice(0, 12)}`,
      organization_id: orgId,
      user_id: body.user_id,
      role: body.role,
      invited_by: userId,
    });
  },

  async updateRole(userId: string, orgId: string, memberId: string, body: UpdateMemberRoleDto) {
    const canManage = await organizationMembersRepository.hasRole(orgId, userId, ['owner', 'admin']);
    if (!canManage) throw Errors.forbidden();
    return organizationMembersRepository.updateRole(orgId, memberId, body.role);
  },

  async remove(userId: string, orgId: string, memberId: string) {
    const canManage = await organizationMembersRepository.hasRole(orgId, userId, ['owner', 'admin']);
    if (!canManage) throw Errors.forbidden();
    await organizationMembersRepository.remove(orgId, memberId);
  },
};
