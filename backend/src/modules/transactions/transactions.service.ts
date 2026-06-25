import { Errors } from '../../lib/errors';
import { transactionsRepository } from './transactions.repository';

interface ListQuery {
  goal_id?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const transactionsService = {
  async list(userId: string, query: ListQuery) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const { rows, total } = await transactionsRepository.findAll(userId, {
      goal_id: query.goal_id,
      status:  query.status,
      from:    query.from,
      to:      query.to,
      q:       query.q,
      page,
      perPage,
    });
    return { data: rows, meta: { page, per_page: perPage, total } };
  },

  async getById(userId: string, txnId: string) {
    const txn = await transactionsRepository.findById(txnId, userId);
    if (!txn) throw Errors.notFound('Transaction');
    return txn;
  },

  async getByGoal(userId: string, goalId: string, query: Omit<ListQuery, 'goal_id'>) {
    return this.list(userId, { ...query, goal_id: goalId });
  },

  async export(userId: string, filters: { goal_id?: string; from?: string; to?: string; status?: string }) {
    return transactionsRepository.findForExport(userId, filters);
  },
};
