import { query, execute } from '../../config/database';

export const notificationsRepository = {
  async findAll(userId: string, filters: { unreadOnly: boolean; page: number; perPage: number }) {
    const conditions = ['user_id = ?'];
    const values: unknown[] = [userId];

    if (filters.unreadOnly) conditions.push('unread = 1');

    const where = conditions.join(' AND ');
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM notifications WHERE ${where}`,
      values,
    );

    const rows = await query(
      `SELECT id, type, title, body, unread, created_at
       FROM notifications WHERE ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, filters.perPage, (filters.page - 1) * filters.perPage],
    );

    return { rows, total: Number(countRows[0].total) };
  },

  async countUnread(userId: string): Promise<number> {
    const rows = await query<{ total: number }>(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND unread = 1',
      [userId],
    );
    return Number(rows[0].total);
  },

  async markOneRead(notificationId: string, userId: string): Promise<number> {
    const result = await execute(
      'UPDATE notifications SET unread = 0 WHERE id = ? AND user_id = ?',
      [notificationId, userId],
    );
    return result.affectedRows;
  },

  async markAllRead(userId: string) {
    await execute('UPDATE notifications SET unread = 0 WHERE user_id = ?', [userId]);
  },

  async insert(data: {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
  }) {
    await execute(
      `INSERT INTO notifications (id, user_id, type, title, body, unread, created_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      [data.id, data.user_id, data.type, data.title, data.body],
    );
  },
};
