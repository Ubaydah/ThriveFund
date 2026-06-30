import crypto from 'crypto';
import { env } from '../../config/env';
import { Errors } from '../../lib/errors';
import { PaymentProviderName } from '../../shared/types/enums';
import type {
  CreateVirtualAccountRequest,
  PaymentProvider,
  PaymentWebhookPayload,
  VerifiedPayment,
  VirtualAccountResult,
} from './payment-provider.interface';

type NombaToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

type NombaResponse<T> = {
  code?: string;
  responseCode?: string;
  description?: string;
  responseMessage?: string;
  message?: string;
  data?: T;
};

type NombaVirtualAccount = {
  accountId?: string;
  id?: string;
  accountHolderId?: string;
  accountRef?: string;
  accountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  banks?: Array<{
    bankName?: string;
    bankAccountNumber?: string;
    accountNumber?: string;
    accountName?: string;
  }>;
};

const DEFAULT_BASE_URLS = {
  sandbox: 'https://sandbox.nomba.com',
  production: 'https://api.nomba.com',
} as const;

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) throw Errors.provider(`Missing ${name} for Nomba integration`);
  return value;
}

function nombaBaseUrl(): string {
  return (env.NOMBA_BASE_URL ?? DEFAULT_BASE_URLS[env.NOMBA_ENVIRONMENT]).replace(/\/+$/, '');
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function mapStatus(status: string): VerifiedPayment['status'] {
  const normalized = status.toLowerCase();
  if (['success', 'successful', 'completed', 'paid'].includes(normalized)) return 'successful';
  if (['pending', 'processing'].includes(normalized)) return 'pending';
  return 'failed';
}

function buildAccountRef(reference: string): string {
  const cleaned = reference.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  return `TF-${cleaned}-${Date.now()}`.slice(0, 64);
}

export class NombaProvider implements PaymentProvider {
  readonly name = PaymentProviderName.Nomba;

  private token: NombaToken | null = null;
  private readonly baseUrl = nombaBaseUrl();
  private readonly clientId = requiredEnv('NOMBA_CLIENT_ID', env.NOMBA_CLIENT_ID);
  private readonly clientSecret = requiredEnv(
    'NOMBA_PRIVATE_KEY',
    env.NOMBA_PRIVATE_KEY ?? env.NOMBA_CLIENT_SECRET ?? env.NOMBA_API_KEY,
  );
  private readonly parentAccountId = requiredEnv(
    'NOMBA_PARENT_ACCOUNT_ID',
    env.NOMBA_PARENT_ACCOUNT_ID ?? env.NOMBA_ACCOUNT_ID,
  );
  private readonly subAccountId = requiredEnv('NOMBA_SUB_ACCOUNT_ID', env.NOMBA_SUB_ACCOUNT_ID);

  async createVirtualAccount(request: CreateVirtualAccountRequest): Promise<VirtualAccountResult> {
    const accountRef = buildAccountRef(request.reference);
    const response = await this.request<NombaVirtualAccount>(
      `/v1/accounts/virtual/${encodeURIComponent(this.subAccountId)}`,
      {
        method: 'POST',
        body: {
          accountRef,
          accountName: request.accountName.slice(0, 64),
        },
      },
    );

    const account = response.data ?? response as NombaVirtualAccount;
    const bank = account.banks?.[0];
    const accountNumber = account.bankAccountNumber ?? bank?.bankAccountNumber ?? bank?.accountNumber;
    const bankName = account.bankName ?? bank?.bankName;
    const bankAccountName = account.bankAccountName ?? bank?.accountName ?? account.accountName;

    if (!accountNumber || !bankName || !bankAccountName) {
      throw Errors.provider('Nomba virtual account response did not include bank details');
    }

    return {
      provider: PaymentProviderName.Nomba,
      providerAccountId: account.accountId ?? account.id ?? account.accountHolderId ?? this.subAccountId,
      accountNumber,
      accountName: bankAccountName,
      bankName,
      providerReference: account.accountRef ?? accountRef,
    };
  }

  async verifyPayment(payload: PaymentWebhookPayload): Promise<VerifiedPayment> {
    if (!payload.providerReference || !payload.accountNumber) {
      throw Errors.validation('Nomba webhook payload is missing transaction or account details');
    }

    return {
      provider: PaymentProviderName.Nomba,
      providerReference: payload.providerReference,
      accountNumber: payload.accountNumber,
      amount: Number(payload.amount),
      currency: payload.currency || 'NGN',
      payerName: payload.payerName ?? 'Anonymous',
      reference: payload.reference || payload.providerReference,
      status: mapStatus(payload.status),
      paidAt: new Date(payload.paidAt || Date.now()),
      bankName: payload.bankName,
    };
  }

  validateWebhookSignature(rawBody: string, signature: string): boolean {
    if (!env.NOMBA_WEBHOOK_SECRET) return false;

    const expected = crypto
      .createHmac('sha256', env.NOMBA_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    const provided = signature.replace(/^sha256=/i, '').trim();

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  }

  async healthCheck() {
    try {
      await this.request('/v1/accounts/balance', { method: 'GET' });
      return { status: 'ok' as const, message: `Nomba ${env.NOMBA_ENVIRONMENT} API reachable` };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nomba health check failed';
      return { status: 'unavailable' as const, message };
    }
  }

  private async request<T>(
    path: string,
    options: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: Record<string, unknown>; skipAuth?: boolean },
  ): Promise<NombaResponse<T> & T> {
    const token = options.skipAuth ? null : await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        accountId: this.parentAccountId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message =
        asString(json?.description) ??
        asString(json?.responseMessage) ??
        asString(json?.message) ??
        `Nomba request failed with HTTP ${response.status}`;
      throw Errors.provider(message);
    }

    return json;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) {
      return this.token.accessToken;
    }

    const response = await this.request<{
      access_token: string;
      refresh_token?: string;
      expiresAt?: string;
    }>('/v1/auth/token/issue', {
      method: 'POST',
      skipAuth: true,
      body: {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      },
    });

    const data = response.data ?? response;
    const accessToken = data.access_token;
    if (!accessToken) throw Errors.provider('Nomba token response did not include an access token');

    const expiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 10 * 60_000;
    this.token = {
      accessToken,
      refreshToken: data.refresh_token,
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : Date.now() + 10 * 60_000,
    };

    return accessToken;
  }
}
