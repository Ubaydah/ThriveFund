# Webhooks Module

Receives and processes Nomba payment webhook events. This is a **core MVP endpoint**.

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST   | `/api/webhooks/nomba` | Nomba signature | ⬜ TODO |

> Note: mounted at `/api/webhooks` (no `/v1` prefix) — Nomba needs a stable, non-versioned URL.

## Processing Pipeline

```
1. Validate Nomba HMAC signature (header: x-nomba-signature)
2. Store raw payload → webhook_events (processed = false)
3. Idempotency check on provider_reference — return 200 if already processed
4. Match account_number → virtual_accounts
5. Create transaction record
6. Update goal.current_amount (successful payments only)
7. Mark webhook_event.processed = true
8. Create notification for goal owner
```

## Signature Verification

Set `NOMBA_WEBHOOK_SECRET` in `.env`. Verification uses HMAC-SHA256 of the raw JSON body.
Without the secret set (dev/local), verification is skipped.

## Unmatched Webhooks

If no virtual account is found for the incoming `account_number`, the webhook is stored with `processed = false` and surfaced in `GET /api/v1/admin/reconciliation`.

## Requires DB Tables

`webhook_events`, `virtual_accounts`, `transactions`, `goals`, `notifications`.
