import { query, execute } from '../../config/database';

export const contributorsRepository = {
  async findAllByUser(userId: string) {
    return query(
      `SELECT c.id, c.name, c.email,
              COUNT(DISTINCT t.goal_id) AS goals_count,
              COALESCE(SUM(CASE WHEN t.status = 'successful' THEN t.amount ELSE 0 END), 0) AS total_contributed,
              MAX(t.paid_at) AS last_contribution_at,
              CONCAT(
                LEFT(SUBSTRING_INDEX(c.name, ' ', 1), 1),
                LEFT(SUBSTRING_INDEX(c.name, ' ', -1), 1)
              ) AS avatar_initials
       FROM contributors c
       JOIN goals g ON g.id = c.goal_id
       LEFT JOIN transactions t ON t.contributor_name = c.name AND t.goal_id = c.goal_id
       WHERE g.user_id = ?
       GROUP BY c.id, c.name, c.email
       ORDER BY total_contributed DESC`,
      [userId],
    );
  },

  async findByGoal(goalId: string) {
    return query(
      `SELECT c.id, c.name, c.email, c.phone_number,
              COALESCE(SUM(CASE WHEN t.status = 'successful' THEN t.amount ELSE 0 END), 0) AS total_contributed,
              MAX(t.paid_at) AS last_contribution_at
       FROM contributors c
       LEFT JOIN transactions t ON t.contributor_name = c.name AND t.goal_id = c.goal_id
       WHERE c.goal_id = ?
       GROUP BY c.id, c.name, c.email, c.phone_number
       ORDER BY total_contributed DESC`,
      [goalId],
    );
  },

  async insert(data: {
    id: string;
    goal_id: string;
    name: string;
    email?: string | null;
    phone_number?: string | null;
    unique_reference: string;
  }) {
    await execute(
      `INSERT INTO contributors (id, goal_id, name, email, phone_number, unique_reference, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [data.id, data.goal_id, data.name, data.email ?? null, data.phone_number ?? null, data.unique_reference],
    );
    const rows = await query('SELECT * FROM contributors WHERE id = ?', [data.id]);
    return rows[0];
  },

  async insertInvitation(data: {
    id: string;
    goal_id: string;
    email: string;
    name?: string | null;
    channel: string;
  }) {
    await execute(
      `INSERT INTO invitations (id, goal_id, email, name, channel, status, sent_at)
       VALUES (?, ?, ?, ?, ?, 'sent', NOW())`,
      [data.id, data.goal_id, data.email, data.name ?? null, data.channel],
    );
    const rows = await query('SELECT * FROM invitations WHERE id = ?', [data.id]);
    return rows[0];
  },

  async findInvitationsByGoal(goalId: string) {
    return query(
      'SELECT * FROM invitations WHERE goal_id = ? ORDER BY sent_at DESC',
      [goalId],
    );
  },
};
