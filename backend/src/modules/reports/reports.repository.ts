import { query } from '../../config/database';
import { parsePagination, buildMeta } from '../../shared/utils/pagination';

export const reportsRepository = {
  async financialSummary(userId: string) {
    const rows = await query(
      `SELECT
         COUNT(DISTINCT g.id) AS total_goals,
         COUNT(DISTINCT CASE WHEN g.status = 'active' THEN g.id END) AS active_goals,
         COALESCE(SUM(g.current_amount), 0) AS total_collected,
         COALESCE(SUM(g.target_amount), 0) AS total_target,
         COUNT(DISTINCT t.id) AS total_transactions,
         COUNT(DISTINCT c.id) AS total_contributors
       FROM goals g
       LEFT JOIN transactions t ON t.goal_id = g.id AND t.status = 'successful'
       LEFT JOIN contributors c ON c.goal_id = g.id
       WHERE g.user_id = ?`,
      [userId],
    );
    return rows[0];
  },

  async transactionsReport(userId: string, filters: { from?: string; to?: string; goal_id?: string }) {
    const conditions = ['g.user_id = ?', "t.status = 'successful'"];
    const values: unknown[] = [userId];
    if (filters.goal_id) { conditions.push('t.goal_id = ?'); values.push(filters.goal_id); }
    if (filters.from) { conditions.push('t.paid_at >= ?'); values.push(filters.from); }
    if (filters.to) { conditions.push('t.paid_at <= ?'); values.push(filters.to); }

    return query(
      `SELECT t.reference, g.title AS goal, t.contributor_name, t.amount, t.status, t.paid_at
       FROM transactions t JOIN goals g ON g.id = t.goal_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.paid_at DESC`,
      values,
    );
  },

  async reconciliationReport(userId: string, page: number, perPage: number) {
    const offset = (page - 1) * perPage;
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM reconciliation_records rr
       JOIN goals g ON g.id = rr.goal_id WHERE g.user_id = ?`,
      [userId],
    );
    const rows = await query(
      `SELECT rr.id, rr.status, p.amount, p.payer_name, g.title AS goal_title, rr.processed_at
       FROM reconciliation_records rr
       JOIN payments p ON p.id = rr.payment_id
       LEFT JOIN goals g ON g.id = rr.goal_id
       WHERE g.user_id = ?
       ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [userId, perPage, offset],
    );
    return { rows, total: Number(countRows[0].total) };
  },
};
