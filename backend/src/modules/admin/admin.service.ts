import { Errors } from '../../lib/errors';
import { adminRepository } from './admin.repository';
import { webhooksRepository } from '../webhooks/webhooks.repository';

export const adminService = {
  async overview() {
    return adminRepository.getPlatformStats();
  },

  async listReconciliation(query: { status?: string; from?: string; to?: string; page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const { rows, total } = await webhooksRepository.findReconciliation({
      status: query.status,
      from:   query.from,
      to:     query.to,
      page,
      perPage,
    });
    return { data: rows, meta: { page, per_page: perPage, total } };
  },

  async getReconciliation(id: string) {
    const event = await webhooksRepository.findById(id);
    if (!event) throw Errors.notFound('Webhook event');
    return event;
  },

  async resolveReconciliation(id: string, body: { goal_id: string; action: string; notes?: string }) {
    const event = await webhooksRepository.findById(id);
    if (!event) throw Errors.notFound('Webhook event');

    // TODO: implement full manual match — create transaction against body.goal_id
    await webhooksRepository.markReconciledManually(id);
    return { resolved: true, notes: body.notes };
  },

  async listWebhookEvents(query: { processed?: string; event_type?: string; page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    return webhooksRepository.findAll({
      processed:  query.processed !== undefined ? query.processed === 'true' : undefined,
      event_type: query.event_type,
      page,
      perPage,
    });
  },

  async retryWebhookEvent(id: string) {
    const event = await webhooksRepository.findById(id);
    if (!event) throw Errors.notFound('Webhook event');
    // TODO: re-enqueue event for processing (e.g. push to a job queue)
    return { queued: true };
  },

  async listUsers(query: { page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    return adminRepository.listUsers(page, perPage);
  },

  async listGoals(query: { page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    return adminRepository.listGoals(page, perPage);
  },

  async listTransactions(query: { page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    return adminRepository.listTransactions(page, perPage);
  },
};
