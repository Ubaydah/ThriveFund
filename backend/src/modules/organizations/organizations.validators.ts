import { z } from 'zod';
import { OrganizationType } from '../../shared/types/enums';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.nativeEnum(OrganizationType),
  description: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
