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
  event?: string;
  eventType?: string;
  type?: string;
  data?: Record<string, unknown>;
}

function toProviderPayload(payload: NombaPayload): PaymentWebhookPayload {
  const data = payload.data ?? {};
  const accountNumber = stringFrom(data.account_number, data.accountNumber, data.bankAccountNumber);
  const providerReference = stringFrom(
    data.provider_reference,
    data.providerReference,
    data.transactionId,
    data.sessionId,
    data.id,
  );

  return {
    event: payload.event ?? payload.eventType ?? payload.type ?? 'payment.received',
    accountNumber,
    amount: numberFrom(data.amount, data.paymentAmount),
    currency: stringFrom(data.currency) || 'NGN',
    payerName: stringFrom(data.payer_name, data.payerName, data.senderName, data.customerName),
    reference: stringFrom(data.reference, data.accountRef, data.merchantReference) || providerReference,
    providerReference,
    status: stringFrom(data.status, data.transactionStatus) || 'pending',
    paidAt: stringFrom(data.paid_at, data.paidAt, data.createdAt, data.date) || new Date().toISOString(),
    bankName: stringFrom(data.bank_name, data.bankName, data.sourceBankName),
  };
}

function stringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function numberFrom(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
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

    const providerPayload = toProviderPayload(payload);
    if (!providerPayload.providerReference || !providerPayload.accountNumber) {
      throw Errors.validation('Nomba webhook payload is missing transaction or account details');
    }

    const event = await webhooksRepository.insertEvent({
      id: `wh_${uuid().replace(/-/g, '').slice(0, 12)}`,
      provider: provider.name,
      event_type: providerPayload.event,
      provider_reference: providerPayload.providerReference,
      payload: rawBody,
    });

    if (!event) {
      return { received: true, duplicate: true };
    }

    await logAudit({
      action: AuditAction.WebhookReceived,
      resource_type: 'webhook_event',
      resource_id: event.id as string,
      metadata: { provider_reference: providerPayload.providerReference },
    });

    try {
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
      await webhooksRepository.markFailed(providerPayload.providerReference, message);
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
