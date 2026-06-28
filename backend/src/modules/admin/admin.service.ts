import { Errors } from '../../lib/errors';
import { adminRepository } from './admin.repository';
import { webhooksRepository } from '../webhooks/webhooks.repository';
import { reconciliationService } from '../reconciliation/reconciliation.service';
import { resolveReconciliationSchema, type ResolveReconciliationDto } from '../reconciliation/reconciliation.validators';
import { webhooksService } from '../webhooks/webhooks.service';

export const adminService = {
  async overview() {
    const stats = await adminRepository.getPlatformStats();
    const reconciliation = await reconciliationService.overview();
    return { ...stats, reconciliation };
  },

  async listReconciliation(query: { status?: string; from?: string; to?: string; page?: number; per_page?: number }) {
    return reconciliationService.listAdmin(query);
  },

  async getReconciliation(id: string) {
    return reconciliationService.getById(id);
  },

  async resolveReconciliation(id: string, body: ResolveReconciliationDto) {
    const parsed = resolveReconciliationSchema.parse(body);
    return reconciliationService.resolveManual(id, parsed);
  },

  async listWebhookEvents(query: { processed?: string; event_type?: string; page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const rows = await webhooksRepository.findAll({
      processed: query.processed !== undefined ? query.processed === 'true' : undefined,
      event_type: query.event_type,
      page,
      perPage,
    });
    return rows;
  },

  async retryWebhookEvent(id: string) {
    const event = await webhooksRepository.findById(id);
    if (!event) throw Errors.notFound('Webhook event');
    const payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
    const signature = '';
    const rawBody = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
    return webhooksService.processNomba(rawBody, signature, payload);
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
