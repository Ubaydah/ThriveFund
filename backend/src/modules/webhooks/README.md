# Webhooks Module

Receives and validates payment webhook events. **Does not** create transactions directly — delegates to payments and reconciliation modules.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/webhooks/nomba` | Signature | Receive Nomba/mock payment webhook |
| POST | `/api/webhooks/mock/simulate` | None (dev only) | Simulate mock payment for demo |

## Mock Simulation (Development)

```bash
curl -X POST http://localhost:3001/api/webhooks/mock/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "<from virtual account creation>",
    "amount": 50000,
    "payer_name": "Babatunde Adeyemi"
  }'
```

Disabled in `NODE_ENV=production`.

## Processing Pipeline

1. Validate signature (via PaymentProvider)
2. Store raw payload in `webhook_events`
3. Idempotency check on `provider_reference`
4. Call `paymentsService.ingestFromWebhook()`
5. Call `reconciliationService.reconcilePayment()`

## Webhook Event Statuses

`received`, `processed`, `failed`, `duplicate`
