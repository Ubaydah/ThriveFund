import { Errors } from '../../lib/errors';
import { goalsRepository } from '../goals/goals.repository';
import { virtualAccountsRepository } from '../virtual-accounts/virtual-accounts.repository';

export const publicService = {
  async getGoalBySlug(slug: string) {
    const goal = await goalsRepository.findBySlug(slug);
    if (!goal) throw Errors.notFound('Goal');
    return goal;
  },

  async getVirtualAccountBySlug(slug: string) {
    const va = await virtualAccountsRepository.findBySlug(slug);
    if (!va) throw Errors.notFound('Virtual account');
    return va;
  },
};
