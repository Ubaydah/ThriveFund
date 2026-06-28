import type { PaymentProviderName } from '../../shared/types/enums';

export interface CreateVirtualAccountRequest {
  accountName: string;
  reference: string;
  preferredBank?: string;
  metadata?: Record<string, string>;
}

export interface VirtualAccountResult {
  provider: PaymentProviderName;
  providerAccountId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  providerReference: string;
}

export interface PaymentWebhookPayload {
  event: string;
  accountNumber: string;
  amount: number;
  currency: string;
  payerName?: string;
  reference: string;
  providerReference: string;
  status: string;
  paidAt: string;
  bankName?: string;
}

export interface VerifiedPayment {
  provider: PaymentProviderName;
  providerReference: string;
  accountNumber: string;
  amount: number;
  currency: string;
  payerName: string;
  reference: string;
  status: 'successful' | 'pending' | 'failed';
  paidAt: Date;
  bankName?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;

  /** Create a dedicated virtual account — mock until July 1 hackathon start */
  createVirtualAccount(request: CreateVirtualAccountRequest): Promise<VirtualAccountResult>;

  /** Normalize and verify an incoming payment webhook payload */
  verifyPayment(payload: PaymentWebhookPayload): Promise<VerifiedPayment>;

  /** Validate webhook signature — returns true in mock mode when secret unset */
  validateWebhookSignature(rawBody: string, signature: string): boolean;

  /** Health check for readiness probe */
  healthCheck(): Promise<{ status: 'ok' | 'unavailable'; message?: string }>;
}
