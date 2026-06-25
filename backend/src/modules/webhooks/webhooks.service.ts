import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { env } from '../../config/env';
import { Errors } from '../../lib/errors';
import { webhooksRepository } from './webhooks.repository';
import { virtualAccountsRepository } from '../virtual-accounts/virtual-accounts.repository';
import { transactionsRepository } from '../transactions/transactions.repository';
import { goalsRepository } from '../goals/goals.repository';
import { notificationsRepository } from '../notifications/notifications.repository';

interface NombaPayload {
  event: string;
  data: {
    account_number: string;
    amount: number;
    currency: string;
    payer_name?: string;
    reference: string;
    provider_reference: string;
    status: string;
    paid_at: string;
    bank_name?: string;
  };
}

function verifySignature(rawBody: string, signature: string): boolean {
  if (!env.NOMBA_WEBHOOK_SECRET) return true; // skip in dev if not configured
  const expected = crypto
    .createHmac('sha256', env.NOMBA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function mapStatus(nombaStatus: string): string {
  const s = nombaStatus.toLowerCase();
  if (s === 'success' || s === 'successful' || s === 'completed') return 'successful';
  if (s === 'pending') return 'pending';
  return 'failed';
}

export const webhooksService = {
  async processNomba(rawBody: string, signature: string, payload: NombaPayload) {
    // 1. Validate signature
    if (!verifySignature(rawBody, signature)) {
      throw Errors.unauthorized('Invalid webhook signature');
    }

    // 2. Store raw payload (processed = false)
    await webhooksRepository.insertEvent({
      id: `wh_${uuid().replace(/-/g, '').slice(0, 12)}`,
      event_type: payload.event,
      provider_reference: payload.data.provider_reference,
      payload: rawBody,
    });

    // 3. Idempotency — skip if already processed
    const duplicate = await transactionsRepository.findByProviderReference(payload.data.provider_reference);
    if (duplicate) return { received: true, duplicate: true };

    // 4. Match account_number → VirtualAccount
    const va = await virtualAccountsRepository.findByAccountNumber(payload.data.account_number);
    if (!va) {
      // Unmatched — leave webhook_event.processed = false for admin reconciliation
      return { received: true, matched: false };
    }

    const status = mapStatus(payload.data.status);

    // 5. Create Transaction
    const txnId = `txn_${uuid().replace(/-/g, '').slice(0, 12)}`;
    await transactionsRepository.insert({
      id: txnId,
      goal_id: va.goal_id,
      virtual_account_id: va.id,
      contributor_name: payload.data.payer_name ?? 'Anonymous',
      amount: payload.data.amount,
      reference: payload.data.reference,
      provider_reference: payload.data.provider_reference,
      status,
      paid_at: payload.data.paid_at,
    });

    // 6. Update Goal.current_amount (successful payments only)
    if (status === 'successful') {
      await goalsRepository.incrementAmount(va.goal_id, payload.data.amount);
    }

    // 7. Mark webhook processed
    await webhooksRepository.markProcessed(payload.data.provider_reference);

    // 8. Create in-app notification for goal owner
    if (status === 'successful') {
      const goal = await goalsRepository.findOwnerByGoalId(va.goal_id);
      if (goal) {
        await notificationsRepository.insert({
          id: `ntf_${uuid().replace(/-/g, '').slice(0, 12)}`,
          user_id: goal.user_id,
          type: 'payment',
          title: 'Payment received',
          body: `${payload.data.payer_name ?? 'Someone'} contributed ₦${payload.data.amount.toLocaleString()} to ${goal.title}`,
        });
      }
    }

    return { received: true, matched: true, transaction_id: txnId };
  },
};
