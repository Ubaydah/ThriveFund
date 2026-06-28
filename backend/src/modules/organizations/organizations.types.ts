export type { CreateOrganizationDto, UpdateOrganizationDto } from './organizations.validators';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  owner_id: string;
  created_at: string;
}
