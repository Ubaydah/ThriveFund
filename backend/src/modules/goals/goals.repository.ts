import { query, execute } from '../../config/database';

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  [key: string]: unknown;
}

export const goalsRepository = {
  async insert(data: {
    id: string;
    user_id: string;
    title: string;
    description?: string | null;
    target_amount: number;
    category: string;
    deadline: string;
    color?: string | null;
  }): Promise<GoalRow> {
    await execute(
      `INSERT INTO goals (id, user_id, title, description, target_amount, category, deadline, color, status, current_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, NOW())`,
      [data.id, data.user_id, data.title, data.description ?? null,
       data.target_amount, data.category, data.deadline, data.color ?? null],
    );
    const rows = await query<GoalRow>(
      `SELECT *,
              GREATEST(0, DATEDIFF(deadline, NOW())) AS days_left,
              ROUND((current_amount / NULLIF(target_amount, 0)) * 100) AS progress_percent
       FROM goals WHERE id = ?`,
      [data.id],
    );
    return rows[0];
  },

  async findAllByUser(
    userId: string,
    filters: { status?: string; category?: string; q?: string; page: number; perPage: number },
  ) {
    const conditions = ['user_id = ?'];
    const values: unknown[] = [userId];

    if (filters.status)   { conditions.push('status = ?');      values.push(filters.status); }
    if (filters.category) { conditions.push('category = ?');    values.push(filters.category); }
    if (filters.q)        { conditions.push('title LIKE ?');    values.push(`%${filters.q}%`); }

    const where = conditions.join(' AND ');

    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM goals WHERE ${where}`,
      values,
    );

    const rows = await query<GoalRow>(
      `SELECT id, title, category, target_amount, current_amount, status, color,
              GREATEST(0, DATEDIFF(deadline, NOW())) AS days_left,
              ROUND((current_amount / NULLIF(target_amount, 0)) * 100) AS progress_percent,
              (SELECT COUNT(*) FROM transactions WHERE goal_id = goals.id AND status = 'successful') AS contributors_count
       FROM goals WHERE ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );

    return { rows, total: Number(countRows[0].total) };
  },

  async findById(goalId: string, userId: string): Promise<GoalRow | null> {
    const rows = await query<GoalRow>(
      `SELECT *,
              GREATEST(0, DATEDIFF(deadline, NOW())) AS days_left,
              ROUND((current_amount / NULLIF(target_amount, 0)) * 100) AS progress_percent,
              target_amount - current_amount AS remaining_amount
       FROM goals WHERE id = ? AND user_id = ?`,
      [goalId, userId],
    );
    if (!rows[0]) return null;

    const goal = rows[0];
    // Fetch linked virtual account separately (MySQL < 8.0.14 doesn't support LATERAL)
    const vaRows = await query(
      `SELECT id, account_number, account_name, bank_name, status
       FROM virtual_accounts WHERE goal_id = ? LIMIT 1`,
      [goalId],
    );
    goal.virtual_account = vaRows[0] ?? null;
    return goal;
  },

  async findByIdRaw(goalId: string, userId: string): Promise<GoalRow | null> {
    const rows = await query<GoalRow>(
      'SELECT id, slug, title FROM goals WHERE id = ? AND user_id = ?',
      [goalId, userId],
    );
    return rows[0] ?? null;
  },

  async update(goalId: string, userId: string, fields: Record<string, unknown>): Promise<GoalRow | null> {
    const allowed = ['title', 'description', 'target_amount', 'category', 'deadline', 'color'];
    const entries = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (!entries.length) return null;

    const setClauses = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = [...entries.map(([, v]) => v), goalId, userId];
    const result = await execute(
      `UPDATE goals SET ${setClauses}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      values,
    );
    if (!result.affectedRows) return null;

    const rows = await query<GoalRow>('SELECT * FROM goals WHERE id = ?', [goalId]);
    return rows[0] ?? null;
  },

  async delete(goalId: string, userId: string): Promise<number> {
    const result = await execute(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [goalId, userId],
    );
    return result.affectedRows;
  },

  async updateStatus(goalId: string, userId: string, status: string): Promise<GoalRow | null> {
    const result = await execute(
      'UPDATE goals SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [status, goalId, userId],
    );
    if (!result.affectedRows) return null;
    const rows = await query<GoalRow>('SELECT * FROM goals WHERE id = ?', [goalId]);
    return rows[0] ?? null;
  },

  async incrementAmount(goalId: string, amount: number) {
    await execute(
      'UPDATE goals SET current_amount = current_amount + ?, updated_at = NOW() WHERE id = ?',
      [amount, goalId],
    );
  },

  async findOwnerByGoalId(goalId: string): Promise<{ user_id: string; title: string; email: string } | null> {
    const rows = await query<{ user_id: string; title: string; email: string }>(
      `SELECT g.user_id, g.title, u.email
       FROM goals g JOIN users u ON u.id = g.user_id
       WHERE g.id = ?`,
      [goalId],
    );
    return rows[0] ?? null;
  },

  async findBySlug(slug: string): Promise<GoalRow | null> {
    const rows = await query<GoalRow>(
      `SELECT title, description, target_amount, current_amount,
              ROUND((current_amount / NULLIF(target_amount, 0)) * 100) AS progress_percent,
              deadline, allow_anonymous
       FROM goals WHERE (slug = ? OR id = ?) AND status = 'active'`,
      [slug, slug],
    );
    return rows[0] ?? null;
  },
};
