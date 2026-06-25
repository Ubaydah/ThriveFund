import { query, execute } from '../../config/database';

export const webhooksRepository = {
  async insertEvent(data: {
    id: string;
    event_type: string;
    provider_reference: string;
    payload: string;
  }) {
    // INSERT IGNORE silently skips if provider_reference already exists (idempotent)
    await execute(
      `INSERT IGNORE INTO webhook_events (id, event_type, provider_reference, payload, processed, received_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [data.id, data.event_type, data.provider_reference, data.payload],
    );
  },

  async markProcessed(providerReference: string) {
    await execute(
      'UPDATE webhook_events SET processed = 1, processed_at = NOW() WHERE provider_reference = ?',
      [providerReference],
    );
  },

  async findAll(filters: {
    processed?: boolean;
    event_type?: string;
    page: number;
    perPage: number;
  }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.processed !== undefined) {
      conditions.push('processed = ?');
      values.push(filters.processed ? 1 : 0);
    }
    if (filters.event_type) {
      conditions.push('event_type = ?');
      values.push(filters.event_type);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return query(
      `SELECT id, event_type, provider_reference, processed, processed_at, received_at
       FROM webhook_events ${where}
       ORDER BY received_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );
  },

  async findById(id: string) {
    const rows = await query('SELECT * FROM webhook_events WHERE id = ?', [id]);
    return rows[0] ?? null;
  },

  async findReconciliation(filters: {
    status?: string;
    from?: string;
    to?: string;
    page: number;
    perPage: number;
  }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.status === 'matched')   { conditions.push('we.processed = 1'); }
    if (filters.status === 'unmatched') { conditions.push('we.processed = 0'); }
    if (filters.from) { conditions.push('we.received_at >= ?'); values.push(filters.from); }
    if (filters.to)   { conditions.push('we.received_at <= ?'); values.push(filters.to); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM webhook_events we ${where}`,
      values,
    );

    const rows = await query(
      `SELECT we.id, we.event_type, we.provider_reference, we.processed, we.processed_at,
              t.id AS transaction_id, t.amount,
              va.account_number
       FROM webhook_events we
       LEFT JOIN transactions t ON t.provider_reference = we.provider_reference
       LEFT JOIN virtual_accounts va ON va.account_number = JSON_UNQUOTE(JSON_EXTRACT(we.payload, '$.data.account_number'))
       ${where}
       ORDER BY we.received_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );

    return { rows, total: Number(countRows[0].total) };
  },

  async markReconciledManually(id: string) {
    await execute(
      'UPDATE webhook_events SET processed = 1, processed_at = NOW() WHERE id = ?',
      [id],
    );
  },
};
