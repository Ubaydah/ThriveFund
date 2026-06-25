import { query, execute } from '../../config/database';

export const usersRepository = {
  async findById(id: string) {
    const rows = await query(
      `SELECT id, full_name, email, phone_number, role, password_hash,
              CONCAT(
                LEFT(SUBSTRING_INDEX(full_name, ' ', 1), 1),
                LEFT(SUBSTRING_INDEX(full_name, ' ', -1), 1)
              ) AS avatar_initials,
              created_at
       FROM users WHERE id = ?`,
      [id],
    );
    return rows[0] ?? null;
  },

  async update(id: string, fields: Record<string, unknown>) {
    const keys = Object.keys(fields);
    if (!keys.length) return null;

    const setClauses = keys.map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    const result = await execute(
      `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = ?`,
      values,
    );
    if (!result.affectedRows) return null;

    const rows = await query(
      'SELECT id, full_name, email, phone_number FROM users WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  },

  async updatePasswordHash(id: string, passwordHash: string) {
    await execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, id],
    );
  },

  async findNotificationPrefs(userId: string) {
    const rows = await query(
      'SELECT payments, goals, reminders, marketing FROM notification_preferences WHERE user_id = ?',
      [userId],
    );
    return rows[0] ?? null;
  },

  async upsertNotificationPrefs(
    userId: string,
    prefs: { payments?: boolean; goals?: boolean; reminders?: boolean; marketing?: boolean },
  ) {
    // Fetch current prefs to honour COALESCE semantics (only overwrite provided fields)
    const current = await this.findNotificationPrefs(userId) ?? {
      payments: true, goals: true, reminders: false, marketing: false,
    };

    const merged = {
      payments:  prefs.payments  ?? current.payments,
      goals:     prefs.goals     ?? current.goals,
      reminders: prefs.reminders ?? current.reminders,
      marketing: prefs.marketing ?? current.marketing,
    };

    await execute(
      `INSERT INTO notification_preferences (user_id, payments, goals, reminders, marketing)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         payments  = VALUES(payments),
         goals     = VALUES(goals),
         reminders = VALUES(reminders),
         marketing = VALUES(marketing)`,
      [userId, merged.payments, merged.goals, merged.reminders, merged.marketing],
    );
  },
};
