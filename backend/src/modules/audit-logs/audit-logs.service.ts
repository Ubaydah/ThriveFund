import { auditLogsRepository } from './audit-logs.repository';
import { parsePagination, buildMeta } from '../../shared/utils/pagination';

export const auditLogsService = {
  async list(query: {
    action?: string;
    actor_id?: string;
    organization_id?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
  }) {
    const { page, per_page } = parsePagination(query);
    const { rows, total } = await auditLogsRepository.findAll({ ...query, page, perPage: per_page });
    return { data: rows, meta: buildMeta(page, per_page, total) };
  },
};
