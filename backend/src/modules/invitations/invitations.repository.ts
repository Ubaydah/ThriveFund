import { query, execute } from '../../config/database';

export const invitationsRepository = {
  async insert(data: {
    id: string;
    goal_id?: string;
    organization_id?: string;
    invited_by: string;
    email: string;
    name?: string | null;
    role?: string | null;
    channel: string;
    token?: string;
    message?: string;
  }) {
    await execute(
      `INSERT INTO invitations
         (id, goal_id, organization_id, invited_by, email, name, role, channel, token, message, status, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NOW())`,
      [data.id, data.goal_id ?? null, data.organization_id ?? null, data.invited_by,
       data.email, data.name ?? null, data.role ?? null, data.channel,
       data.token ?? null, data.message ?? null],
    );
    const rows = await query('SELECT * FROM invitations WHERE id = ?', [data.id]);
    return rows[0];
  },

  async findByGoal(goalId: string) {
    return query('SELECT * FROM invitations WHERE goal_id = ? ORDER BY sent_at DESC', [goalId]);
  },

  async findByOrganization(orgId: string) {
    return query('SELECT * FROM invitations WHERE organization_id = ? ORDER BY sent_at DESC', [orgId]);
  },

  async findByToken(token: string) {
    const rows = await query('SELECT * FROM invitations WHERE token = ? AND status = ?', [token, 'sent']);
    return rows[0] ?? null;
  },

  async updateStatus(id: string, status: string) {
    await execute('UPDATE invitations SET status = ? WHERE id = ?', [status, id]);
  },
};
