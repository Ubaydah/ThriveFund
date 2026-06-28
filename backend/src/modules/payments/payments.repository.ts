import { query, execute } from '../../config/database';

export const paymentsRepository = {
  async insert(data: {
    id: string;
    webhook_event_id?: string;
    provider: string;
    provider_reference: string;
    account_number: string;
    amount: number;
    currency: string;
    payer_name: string;
    reference: string;
    status: string;
    paid_at?: Date;
  }) {
    await execute(
      `INSERT INTO payments
         (id, webhook_event_id, provider, provider_reference, account_number, amount, currency,
          payer_name, reference, status, paid_at, verified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [data.id, data.webhook_event_id ?? null, data.provider, data.provider_reference,
       data.account_number, data.amount, data.currency, data.payer_name, data.reference,
       data.status, data.paid_at ?? null],
    );
    const rows = await query('SELECT * FROM payments WHERE id = ?', [data.id]);
    return rows[0];
  },

  async findByProviderReference(ref: string) {
    const rows = await query('SELECT * FROM payments WHERE provider_reference = ?', [ref]);
    return rows[0] ?? null;
  },

  async findById(id: string) {
    const rows = await query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows[0] ?? null;
  },

  async findAll(filters: { status?: string; page: number; perPage: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (filters.status) { conditions.push('status = ?'); values.push(filters.status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM payments ${where}`, values);
    const rows = await query(
      `SELECT * FROM payments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );
    return { rows, total: Number(countRows[0].total) };
  },
};
