import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { env } from '../../config/env';
import { PaymentProviderName } from '../../shared/types/enums';
import type {
  CreateVirtualAccountRequest,
  BankTransferRequest,
  BankTransferResult,
  ExpireVirtualAccountResult,
  PaymentProvider,
  PaymentWebhookPayload,
  VerifiedPayment,
  VirtualAccountResult,
} from './payment-provider.interface';

const MOCK_BANKS: Record<string, string> = {
  first_bank: 'First Bank',
  gtbank: 'GTBank',
  zenith: 'Zenith Bank',
  uba: 'UBA',
  access: 'Access Bank',
};

function mapStatus(status: string): VerifiedPayment['status'] {
  const s = status.toLowerCase();
  if (s === 'success' || s === 'successful' || s === 'completed') return 'successful';
  if (s === 'pending') return 'pending';
  return 'failed';
}

/**
 * Mock Nomba provider for pre-hackathon development.
 * Generates realistic test data without calling real Nomba endpoints.
 */
export class MockNombaProvider implements PaymentProvider {
  readonly name = PaymentProviderName.MockNomba;

  async createVirtualAccount(request: CreateVirtualAccountRequest): Promise<VirtualAccountResult> {
    const accountNumber = `9${Date.now().toString().slice(-9)}`;
    const bankKey = request.preferredBank ?? 'first_bank';

    return {
      provider: PaymentProviderName.MockNomba,
      providerAccountId: `mock_nomba_acc_${uuid().replace(/-/g, '').slice(0, 12)}`,
      accountNumber,
      accountName: request.accountName,
      bankName: MOCK_BANKS[bankKey] ?? 'First Bank',
      providerReference: `MOCK-NOMBA-${uuid().slice(0, 8).toUpperCase()}`,
    };
  }

  async verifyPayment(payload: PaymentWebhookPayload): Promise<VerifiedPayment> {
    return {
      provider: PaymentProviderName.MockNomba,
      providerReference: payload.providerReference,
      accountNumber: payload.accountNumber,
      amount: payload.amount,
      currency: payload.currency || 'NGN',
      payerName: payload.payerName ?? 'Anonymous',
      reference: payload.reference,
      status: mapStatus(payload.status),
      paidAt: new Date(payload.paidAt || Date.now()),
      bankName: payload.bankName,
    };
  }

  async transferToBank(request: BankTransferRequest): Promise<BankTransferResult> {
    return {
      provider: PaymentProviderName.MockNomba,
      providerReference: request.merchantTxRef,
      status: 'successful',
      amount: request.amount,
      fee: 0,
      raw: {
        id: `mock_transfer_${uuid().replace(/-/g, '').slice(0, 12)}`,
        destination: request.accountNumber,
        bankCode: request.bankCode,
      },
    };
  }

  async expireVirtualAccount(identifier: string): Promise<ExpireVirtualAccountResult> {
    return {
      provider: PaymentProviderName.MockNomba,
      expired: true,
      providerReference: identifier,
      raw: { expired: true },
    };
  }

  validateWebhookSignature(rawBody: string, signature: string): boolean {
    if (!env.NOMBA_WEBHOOK_SECRET) return true;
    const expected = crypto
      .createHmac('sha256', env.NOMBA_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  async healthCheck() {
    return { status: 'ok' as const, message: 'MockNombaProvider active (no live Nomba calls)' };
  }
}
