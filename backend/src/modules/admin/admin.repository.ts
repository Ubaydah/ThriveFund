import { query } from '../../config/database';

export const adminRepository = {
  async getPlatformStats() {
    const rows = await query(
      `SELECT
         (SELECT COUNT(*) FROM users)                                                            AS total_users,
         (SELECT COUNT(*) FROM goals)                                                            AS total_goals,
         (SELECT COUNT(*) FROM transactions)                                                     AS total_transactions,
         (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'successful')        AS total_volume_ngn,
         (SELECT COUNT(*) FROM webhook_events WHERE processed = 0)                              AS pending_reconciliation,
         (SELECT COUNT(*) FROM webhook_events
            WHERE processed = 0 AND received_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR))           AS failed_webhooks_24h`,
    );
    return rows[0];
  },

  async listUsers(page: number, perPage: number) {
    return query(
      `SELECT id, full_name, email, role, created_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [perPage, (page - 1) * perPage],
    );
  },

  async listGoals(page: number, perPage: number) {
    return query(
      `SELECT g.id, g.title, g.category, g.target_amount, g.current_amount, g.status,
              u.email AS owner_email
       FROM goals g JOIN users u ON u.id = g.user_id
       ORDER BY g.created_at DESC LIMIT ? OFFSET ?`,
      [perPage, (page - 1) * perPage],
    );
  },

  async listTransactions(page: number, perPage: number) {
    return query(
      `SELECT t.id, t.reference, t.amount, t.status, t.paid_at,
              g.title AS goal_title, u.email AS owner_email
       FROM transactions t
       JOIN goals g ON g.id = t.goal_id
       JOIN users u ON u.id = g.user_id
       ORDER BY t.paid_at DESC LIMIT ? OFFSET ?`,
      [perPage, (page - 1) * perPage],
    );
  },
};
