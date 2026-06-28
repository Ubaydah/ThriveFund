# Backend Module Architecture

Modular monolith — each module owns one domain. Cross-module calls go through **services**, not direct repository access from controllers.

## Module Responsibilities

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  webhooks   │────▶│  payments   │────▶│ reconciliation   │
│  (ingest)   │     │  (verify)   │     │  (match + txn)   │
└─────────────┘     └─────────────┘     └────────┬─────────┘
                                                  │
                     ┌─────────────┐              ▼
                     │transactions │◀── immutable records
                     └─────────────┘
                            │
                     ┌──────▼──────┐
                     │notifications│──▶ Brevo email
                     └─────────────┘
```

| Module | Does | Does NOT |
|--------|------|----------|
| webhooks | Receive, validate signature, store raw events | Create transactions |
| payments | Provider verification, `payments` table | Match to goals |
| reconciliation | Match VA → goal → org, create txn | Call Nomba API |
| transactions | Immutable records, CSV export | Mutate after creation |
| virtual-accounts | Create VA via PaymentProvider | Process webhooks |
| notifications | In-app + Brevo emails | Payment logic |
| reports | Aggregations, CSV | Write data |

## Payment Provider (Pre–July 1)

```typescript
// src/providers/payment/index.ts
getPaymentProvider() → MockNombaProvider | NombaProvider (placeholder)
```

| Provider | Status |
|----------|--------|
| `MockNombaProvider` | ✅ Active — generates mock VAs, verifies mock webhooks |
| `NombaProvider` | ⬜ Placeholder — throws until hackathon build phase |

## New API Routes

| Prefix | Module |
|--------|--------|
| `/api/v1/organizations` | organizations |
| `/api/v1/organizations/:orgId/members` | organization-members |
| `/api/v1/reconciliation` | reconciliation |
| `/api/v1/reports` | reports |
| `/api/v1/payments` | payments (admin) |
| `/api/v1/admin/audit-logs` | audit-logs |
| `/api/v1/invitations/:token/accept` | invitations |
| `/api/webhooks/mock/simulate` | webhooks (dev demo) |

## Database Tables

`users` · `organizations` · `organization_members` · `goals` · `virtual_accounts` · `webhook_events` · `payments` · `reconciliation_records` · `transactions` · `contributors` · `invitations` · `notifications` · `audit_logs`

## Enums

See `src/shared/types/enums.ts` for all status values.

## Demo Flow

1. `POST /auth/register` or use seed user `adebayo@thrivefund.ng` / `DemoPass123!`
2. `POST /organizations` — create mosque/school org
3. `POST /goals` — create campaign linked to org
4. `POST /goals/:id/virtual-account` — MockNombaProvider returns account number
5. `POST /api/webhooks/mock/simulate` — simulate payment
6. `GET /reconciliation/overview` — see matched payments
7. `GET /reports/financial-summary` — totals
