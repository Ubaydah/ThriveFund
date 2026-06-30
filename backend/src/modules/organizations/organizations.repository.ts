import { query, execute } from '../../config/database';

export const organizationsRepository = {
  async insert(data: {
    id: string;
    name: string;
    slug: string;
    type: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    owner_id: string;
  }) {
    await execute(
      `INSERT INTO organizations (id, name, slug, type, description, email, phone, address, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id, data.name, data.slug, data.type, data.description ?? null,
       data.email ?? null, data.phone ?? null, data.address ?? null, data.owner_id],
    );
    const rows = await query('SELECT * FROM organizations WHERE id = ?', [data.id]);
    return rows[0];
  },

  async findById(id: string) {
    const rows = await query('SELECT * FROM organizations WHERE id = ?', [id]);
    return rows[0] ?? null;
  },

  async canAccess(id: string, userId: string): Promise<boolean> {
    const rows = await query<{ id: string }>(
      `SELECT o.id
       FROM organizations o
       LEFT JOIN organization_members om ON om.organization_id = o.id
       WHERE o.id = ? AND (o.owner_id = ? OR om.user_id = ?)
       LIMIT 1`,
      [id, userId, userId],
    );
    return Boolean(rows[0]);
  },

  async findBySlug(slug: string) {
    const rows = await query('SELECT * FROM organizations WHERE slug = ?', [slug]);
    return rows[0] ?? null;
  },

  async findByUser(userId: string, page: number, perPage: number) {
    const offset = (page - 1) * perPage;
    const countRows = await query<{ total: number }>(
      `SELECT COUNT(DISTINCT o.id) AS total
       FROM organizations o
       LEFT JOIN organization_members om ON om.organization_id = o.id
       WHERE o.owner_id = ? OR om.user_id = ?`,
      [userId, userId],
    );
    const rows = await query(
      `SELECT DISTINCT o.* FROM organizations o
       LEFT JOIN organization_members om ON om.organization_id = o.id
       WHERE o.owner_id = ? OR om.user_id = ?
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [userId, userId, perPage, offset],
    );
    return { rows, total: Number(countRows[0].total) };
  },

  async update(id: string, fields: Record<string, unknown>) {
    const allowed = ['name', 'type', 'description', 'email', 'phone', 'address'];
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (!sets.length) return this.findById(id);
    values.push(id);
    await execute(`UPDATE organizations SET ${sets.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },
};
