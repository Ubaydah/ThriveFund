export const isDemoPayments =
  process.env.NEXT_PUBLIC_PAYMENT_PROVIDER !== 'nomba';

export const paymentModeCopy = isDemoPayments
  ? {
      label: 'Demo provider active.',
      detail: 'Virtual accounts and payment simulations use test data in this environment.',
      short: 'Demo provider active',
    }
  : {
      label: 'Live payments active.',
      detail: 'Virtual accounts and incoming transfers are processed through the configured payment provider.',
      short: 'Live payments active',
    };
