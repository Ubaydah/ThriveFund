import { v4 as uuid } from 'uuid';
import { execute } from '../config/database';
import type { AuditAction } from '../shared/types/enums';

export async function logAudit(params: {
  action: AuditAction | string;
  actor_id?: string | null;
  organization_id?: string | null;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
}) {
  const id = `aud_${uuid().replace(/-/g, '').slice(0, 12)}`;
  await execute(
    `INSERT INTO audit_logs (id, action, actor_id, organization_id, resource_type, resource_id, metadata, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      params.action,
      params.actor_id ?? null,
      params.organization_id ?? null,
      params.resource_type ?? null,
      params.resource_id ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.ip_address ?? null,
    ],
  );
  return id;
}
