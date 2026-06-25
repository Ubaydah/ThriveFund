import { v4 as uuid } from 'uuid';
import { Errors } from '../../lib/errors';
import { goalsRepository } from './goals.repository';
import { transactionsRepository } from '../transactions/transactions.repository';
import type { CreateGoalInput, UpdateGoalInput } from './goals.schema';

export const goalsService = {
  async create(userId: string, body: CreateGoalInput) {
    const id = `goal_${uuid().replace(/-/g, '').slice(0, 12)}`;
    return goalsRepository.insert({ id, user_id: userId, ...body });
  },

  async list(userId: string, query: {
    status?: string;
    category?: string;
    q?: string;
    page?: number;
    per_page?: number;
  }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const { rows, total } = await goalsRepository.findAllByUser(userId, {
      status: query.status,
      category: query.category,
      q: query.q,
      page,
      perPage,
    });
    return { data: rows, meta: { page, per_page: perPage, total } };
  },

  async getById(userId: string, goalId: string) {
    const goal = await goalsRepository.findById(goalId, userId);
    if (!goal) throw Errors.notFound('Goal');
    return goal;
  },

  async update(userId: string, goalId: string, body: UpdateGoalInput) {
    const exists = await goalsRepository.findByIdRaw(goalId, userId);
    if (!exists) throw Errors.notFound('Goal');

    const updated = await goalsRepository.update(goalId, userId, body as Record<string, unknown>);
    if (!updated) throw Errors.validation('No valid fields to update');
    return updated;
  },

  async delete(userId: string, goalId: string) {
    const pendingCount = await transactionsRepository.countPendingByGoal(goalId);
    if (pendingCount > 0) throw Errors.conflict('Cannot delete goal with pending transactions');

    const deleted = await goalsRepository.delete(goalId, userId);
    if (!deleted) throw Errors.notFound('Goal');
  },

  async close(userId: string, goalId: string) {
    const goal = await goalsRepository.updateStatus(goalId, userId, 'completed');
    if (!goal) throw Errors.notFound('Goal');
    return goal;
  },

  async getShareLink(userId: string, goalId: string) {
    const goal = await goalsRepository.findByIdRaw(goalId, userId);
    if (!goal) throw Errors.notFound('Goal');
    const slug = (goal.slug as string | null) ?? goalId;
    return {
      public_url: `https://app.thrivefund.ng/g/${slug}`,
      slug,
      qr_code_url: `https://api.thrivefund.ng/api/v1/goals/${goalId}/qr.png`,
    };
  },
};
