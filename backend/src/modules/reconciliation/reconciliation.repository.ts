import { query, execute } from '../../config/database';

export const reconciliationRepository = {
  async insert(data: {
    id: string;
    payment_id: string;
    webhook_event_id?: string;
    organization_id?: string;
    goal_id?: string;
    virtual_account_id?: string;
    transaction_id?: string;
    status: string;
    notes?: string;
  }) {
    await execute(
      `INSERT INTO reconciliation_records
         (id, payment_id, webhook_event_id, organization_id, goal_id, virtual_account_id,
          transaction_id, status, notes, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [data.id, data.payment_id, data.webhook_event_id ?? null, data.organization_id ?? null,
       data.goal_id ?? null, data.virtual_account_id ?? null, data.transaction_id ?? null,
       data.status, data.notes ?? null],
    );
    const rows = await query('SELECT * FROM reconciliation_records WHERE id = ?', [data.id]);
    return rows[0];
  },

  async findAll(filters: {
    status?: string;
    organization_id?: string;
    user_id?: string;
    from?: string;
    to?: string;
    page: number;
    perPage: number;
  }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.status) { conditions.push('rr.status = ?'); values.push(filters.status); }
    if (filters.organization_id) { conditions.push('rr.organization_id = ?'); values.push(filters.organization_id); }
    if (filters.user_id) {
      conditions.push('(g.user_id = ? OR o.owner_id = ?)');
      values.push(filters.user_id, filters.user_id);
    }
    if (filters.from) { conditions.push('rr.created_at >= ?'); values.push(filters.from); }
    if (filters.to) { conditions.push('rr.created_at <= ?'); values.push(filters.to); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM reconciliation_records rr
       LEFT JOIN goals g ON g.id = rr.goal_id
       LEFT JOIN organizations o ON o.id = rr.organization_id ${where}`,
      values,
    );
    const rows = await query(
      `SELECT rr.*, p.amount, p.payer_name, p.account_number, p.provider_reference,
              g.title AS goal_title, va.bank_name
       FROM reconciliation_records rr
       JOIN payments p ON p.id = rr.payment_id
       LEFT JOIN goals g ON g.id = rr.goal_id
       LEFT JOIN virtual_accounts va ON va.id = rr.virtual_account_id
       LEFT JOIN organizations o ON o.id = rr.organization_id
       ${where}
       ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );
    return { rows, total: Number(countRows[0].total) };
  },

  async findById(id: string) {
    const rows = await query(
      `SELECT rr.*, p.*, we.payload AS webhook_payload
       FROM reconciliation_records rr
       JOIN payments p ON p.id = rr.payment_id
       LEFT JOIN webhook_events we ON we.id = rr.webhook_event_id
       WHERE rr.id = ?`,
      [id],
    );
    return rows[0] ?? null;
  },

  async getStats(userId?: string) {
    const userFilter = userId ? 'AND (g.user_id = ? OR o.owner_id = ?)' : '';
    const values = userId ? [userId, userId] : [];
    const rows = await query<{ status: string; count: number }>(
      `SELECT rr.status, COUNT(*) AS count
       FROM reconciliation_records rr
       LEFT JOIN goals g ON g.id = rr.goal_id
       LEFT JOIN organizations o ON o.id = rr.organization_id
       WHERE 1=1 ${userFilter}
       GROUP BY rr.status`,
      values,
    );
    return rows;
  },
};
