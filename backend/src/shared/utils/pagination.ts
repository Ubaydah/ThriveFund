export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function parsePagination(query: PaginationParams, maxPerPage = 100) {
  const page = Math.max(1, query.page ?? 1);
  const per_page = Math.min(maxPerPage, Math.max(1, query.per_page ?? 20));
  const offset = (page - 1) * per_page;
  return { page, per_page, offset };
}

export function buildMeta(page: number, per_page: number, total: number): PaginationMeta {
  return {
    page,
    per_page,
    total,
    total_pages: Math.ceil(total / per_page) || 1,
  };
}
