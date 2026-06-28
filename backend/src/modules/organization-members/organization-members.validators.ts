import { z } from 'zod';
import { OrganizationMemberRole } from '../../shared/types/enums';

export const addMemberSchema = z.object({
  user_id: z.string().min(1),
  role: z.nativeEnum(OrganizationMemberRole).default(OrganizationMemberRole.Viewer),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(OrganizationMemberRole),
});

export type AddMemberDto = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;
