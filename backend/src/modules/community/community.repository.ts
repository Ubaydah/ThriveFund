import { query } from '../../config/database';

export const communityRepository = {
  async findCommunityProjects(
    userId: string,
    filters: { categories: string[]; page: number; perPage: number },
  ) {
    // mysql2 expands a single ? to IN (?,?,?) when the value is an array
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM goals WHERE user_id = ? AND category IN (?) AND status = 'active'`,
      [userId, filters.categories],
    );

    const rows = await query(
      `SELECT id, title, category, target_amount, current_amount, status, color,
              GREATEST(0, DATEDIFF(deadline, NOW())) AS days_left,
              ROUND((current_amount / NULLIF(target_amount, 0)) * 100) AS progress_percent
       FROM goals
       WHERE user_id = ? AND category IN (?) AND status = 'active'
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, filters.categories, filters.perPage, (filters.page - 1) * filters.perPage],
    );

    return { rows, total: Number(countRows[0].total) };
  },

  async searchGoals(userId: string, q: string) {
    return query(
      `SELECT id, title, category, status, 'goal' AS type
       FROM goals WHERE user_id = ? AND title LIKE ? LIMIT 10`,
      [userId, `%${q}%`],
    );
  },

  async searchTransactions(userId: string, q: string) {
    return query(
      `SELECT t.id, t.reference, t.contributor_name, t.amount, 'transaction' AS type
       FROM transactions t JOIN goals g ON g.id = t.goal_id
       WHERE g.user_id = ? AND (t.contributor_name LIKE ? OR t.reference LIKE ?)
       LIMIT 10`,
      [userId, `%${q}%`, `%${q}%`],
    );
  },

  async searchContributors(userId: string, q: string) {
    return query(
      `SELECT DISTINCT c.id, c.name, c.email, 'contributor' AS type
       FROM contributors c JOIN goals g ON g.id = c.goal_id
       WHERE g.user_id = ? AND (c.name LIKE ? OR c.email LIKE ?)
       LIMIT 10`,
      [userId, `%${q}%`, `%${q}%`],
    );
  },
};
