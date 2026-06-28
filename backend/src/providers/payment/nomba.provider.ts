import { Errors } from '../../lib/errors';
import { PaymentProviderName } from '../../shared/types/enums';
import type {
  CreateVirtualAccountRequest,
  PaymentProvider,
  PaymentWebhookPayload,
  VerifiedPayment,
  VirtualAccountResult,
} from './payment-provider.interface';

/**
 * Placeholder for real Nomba integration.
 * DO NOT implement live API calls before the hackathon build phase (July 1).
 */
export class NombaProvider implements PaymentProvider {
  readonly name = PaymentProviderName.Nomba;

  private notReady(): never {
    throw Errors.provider(
      'Live Nomba integration is not enabled yet. Set PAYMENT_PROVIDER=mock until the hackathon build phase begins (July 1).',
    );
  }

  async createVirtualAccount(_request: CreateVirtualAccountRequest): Promise<VirtualAccountResult> {
    return this.notReady();
  }

  async verifyPayment(_payload: PaymentWebhookPayload): Promise<VerifiedPayment> {
    return this.notReady();
  }

  validateWebhookSignature(_rawBody: string, _signature: string): boolean {
    return this.notReady();
  }

  async healthCheck() {
    return {
      status: 'unavailable' as const,
      message: 'NombaProvider placeholder — integration pending hackathon start',
    };
  }
}
