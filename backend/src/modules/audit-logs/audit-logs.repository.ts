import { query } from '../../config/database';
import { parsePagination, buildMeta } from '../../shared/utils/pagination';

export const auditLogsRepository = {
  async findAll(filters: {
    action?: string;
    actor_id?: string;
    organization_id?: string;
    from?: string;
    to?: string;
    page: number;
    perPage: number;
  }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.action) { conditions.push('action = ?'); values.push(filters.action); }
    if (filters.actor_id) { conditions.push('actor_id = ?'); values.push(filters.actor_id); }
    if (filters.organization_id) { conditions.push('organization_id = ?'); values.push(filters.organization_id); }
    if (filters.from) { conditions.push('created_at >= ?'); values.push(filters.from); }
    if (filters.to) { conditions.push('created_at <= ?'); values.push(filters.to); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, values);
    const rows = await query(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );
    return { rows, total: Number(countRows[0].total) };
  },
};
