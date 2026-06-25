import { v4 as uuid } from 'uuid';
import { Errors } from '../../lib/errors';
import { virtualAccountsRepository } from './virtual-accounts.repository';
import { goalsRepository } from '../goals/goals.repository';

export const virtualAccountsService = {
  async createForGoal(userId: string, goalId: string, body: { account_name_suffix?: string; preferred_bank?: string }) {
    const goal = await goalsRepository.findByIdRaw(goalId, userId);
    if (!goal) throw Errors.notFound('Goal');

    const existing = await virtualAccountsRepository.findActiveByGoalId(goalId);
    if (existing) throw Errors.conflict('A virtual account already exists for this goal');

    // TODO: Replace stub with real Nomba API call:
    // const nombaResponse = await nombaClient.createVirtualAccount({ ... });
    const nombaAccountId = `nomba_acc_${uuid().replace(/-/g, '').slice(0, 12)}`;
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const accountName = `ThriveFund / ${body.account_name_suffix ?? (goal.title as string)}`;
    const bankName = body.preferred_bank === 'gtbank' ? 'GTBank' : 'First Bank';

    return virtualAccountsRepository.insert({
      id: `va_${uuid().replace(/-/g, '').slice(0, 12)}`,
      goal_id: goalId,
      nomba_account_id: nombaAccountId,
      account_number: accountNumber,
      account_name: accountName,
      bank_name: bankName,
      provider_reference: `NOMBA-REF-${uuid().slice(0, 8)}`,
    });
  },

  async getForGoal(userId: string, goalId: string) {
    const va = await virtualAccountsRepository.findByGoalAndUser(goalId, userId);
    if (!va) throw Errors.notFound('Virtual account');
    return va;
  },

  async listAll(userId: string) {
    return virtualAccountsRepository.findAllByUser(userId);
  },

  async getById(userId: string, vaId: string) {
    const va = await virtualAccountsRepository.findByIdAndUser(vaId, userId);
    if (!va) throw Errors.notFound('Virtual account');
    return va;
  },
};
