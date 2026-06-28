import { env } from '../../config/env';
import { MockNombaProvider } from './mock-nomba.provider';
import { NombaProvider } from './nomba.provider';
import type { PaymentProvider } from './payment-provider.interface';

let instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  switch (env.PAYMENT_PROVIDER) {
    case 'nomba':
      instance = new NombaProvider();
      break;
    case 'mock_nomba':
    default:
      instance = new MockNombaProvider();
      break;
  }

  return instance;
}

/** Reset provider instance (for tests) */
export function resetPaymentProvider() {
  instance = null;
}

export * from './payment-provider.interface';
export { MockNombaProvider } from './mock-nomba.provider';
export { NombaProvider } from './nomba.provider';
