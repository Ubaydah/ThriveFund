import { v4 as uuid } from 'uuid';
import { getPaymentProvider } from '../../providers/payment';
import type { PaymentWebhookPayload } from '../../providers/payment';
import { Errors } from '../../lib/errors';
import { logAudit } from '../../lib/audit';
import { AuditAction } from '../../shared/types/enums';
import { webhooksRepository } from './webhooks.repository';
import { paymentsService } from '../payments/payments.service';
import { reconciliationService } from '../reconciliation/reconciliation.service';

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

function toProviderPayload(payload: NombaPayload): PaymentWebhookPayload {
  return {
    event: payload.event,
    accountNumber: payload.data.account_number,
    amount: payload.data.amount,
    currency: payload.data.currency || 'NGN',
    payerName: payload.data.payer_name,
    reference: payload.data.reference,
    providerReference: payload.data.provider_reference,
    status: payload.data.status,
    paidAt: payload.data.paid_at,
    bankName: payload.data.bank_name,
  };
}

export const webhooksService = {
  /**
   * Webhook ingestion only:
   * 1. Validate signature
   * 2. Store raw webhook_events
   * 3. Delegate to payments → reconciliation
   */
  async processNomba(rawBody: string, signature: string, payload: NombaPayload) {
    const provider = getPaymentProvider();

    if (!provider.validateWebhookSignature(rawBody, signature)) {
      throw Errors.unauthorized('Invalid webhook signature');
    }

    const event = await webhooksRepository.insertEvent({
      id: `wh_${uuid().replace(/-/g, '').slice(0, 12)}`,
      event_type: payload.event,
      provider_reference: payload.data.provider_reference,
      payload: rawBody,
    });

    if (!event) {
      return { received: true, duplicate: true };
    }

    await logAudit({
      action: AuditAction.WebhookReceived,
      resource_type: 'webhook_event',
      resource_id: event.id as string,
      metadata: { provider_reference: payload.data.provider_reference },
    });

    try {
      const providerPayload = toProviderPayload(payload);
      const { payment, duplicate } = await paymentsService.ingestFromWebhook(
        event.id as string,
        providerPayload,
      );

      if (duplicate) {
        return { received: true, duplicate: true };
      }

      const result = await reconciliationService.reconcilePayment({
        id: payment.id as string,
        webhook_event_id: event.id as string,
        provider_reference: payment.provider_reference as string,
        account_number: payment.account_number as string,
        amount: Number(payment.amount),
        payer_name: payment.payer_name as string,
        reference: payment.reference as string,
        status: payment.status as string,
        paid_at: payment.paid_at as string | undefined,
      });

      return {
        received: true,
        matched: result.matched,
        transaction_id: result.transaction_id,
        reconciliation_id: (result.reconciliation as { id?: string })?.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      await webhooksRepository.markFailed(payload.data.provider_reference, message);
      throw err;
    }
  },

  /** Dev-only: simulate a mock payment webhook for demo/testing */
  async simulateMockPayment(body: {
    account_number: string;
    amount: number;
    payer_name?: string;
    goal_reference?: string;
  }) {
    const providerRef = `MOCK-WH-${uuid().slice(0, 8).toUpperCase()}`;
    const payload: NombaPayload = {
      event: 'payment.received',
      data: {
        account_number: body.account_number,
        amount: body.amount,
        currency: 'NGN',
        payer_name: body.payer_name ?? 'Mock Contributor',
        reference: `REF-${Date.now()}`,
        provider_reference: providerRef,
        status: 'successful',
        paid_at: new Date().toISOString(),
        bank_name: 'First Bank',
      },
    };
    return this.processNomba(JSON.stringify(payload), '', payload);
  },
};
