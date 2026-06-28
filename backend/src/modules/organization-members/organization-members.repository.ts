import { query, execute } from '../../config/database';

export const organizationMembersRepository = {
  async insert(data: {
    id: string;
    organization_id: string;
    user_id: string;
    role: string;
    invited_by?: string;
  }) {
    await execute(
      `INSERT INTO organization_members (id, organization_id, user_id, role, invited_by)
       VALUES (?, ?, ?, ?, ?)`,
      [data.id, data.organization_id, data.user_id, data.role, data.invited_by ?? null],
    );
    const rows = await query('SELECT * FROM organization_members WHERE id = ?', [data.id]);
    return rows[0];
  },

  async isMember(orgId: string, userId: string) {
    const rows = await query(
      `SELECT id FROM organization_members WHERE organization_id = ? AND user_id = ?`,
      [orgId, userId],
    );
    return rows.length > 0;
  },

  async hasRole(orgId: string, userId: string, roles: string[]) {
    const placeholders = roles.map(() => '?').join(',');
    const rows = await query(
      `SELECT id FROM organization_members
       WHERE organization_id = ? AND user_id = ? AND role IN (${placeholders})`,
      [orgId, userId, ...roles],
    );
    return rows.length > 0;
  },

  async findByOrg(orgId: string) {
    return query(
      `SELECT om.*, u.full_name, u.email
       FROM organization_members om
       JOIN users u ON u.id = om.user_id
       WHERE om.organization_id = ?
       ORDER BY om.joined_at ASC`,
      [orgId],
    );
  },

  async updateRole(orgId: string, memberId: string, role: string) {
    await execute(
      'UPDATE organization_members SET role = ? WHERE id = ? AND organization_id = ?',
      [role, memberId, orgId],
    );
    const rows = await query('SELECT * FROM organization_members WHERE id = ?', [memberId]);
    return rows[0] ?? null;
  },

  async remove(orgId: string, memberId: string) {
    await execute(
      'DELETE FROM organization_members WHERE id = ? AND organization_id = ? AND role != ?',
      [memberId, orgId, 'owner'],
    );
  },
};
