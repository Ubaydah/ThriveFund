# Reconciliation Module

Matches verified payments to virtual accounts, goals, organizations, and contributors. Creates immutable transaction records.

## Flow

```
webhook → payments (verify) → reconciliation (match) → transactions (immutable record)
                                                      → notifications (Brevo email)
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/reconciliation` | User | List reconciliation records |
| GET | `/api/v1/reconciliation/overview` | User | Stats summary |
| GET | `/api/v1/reconciliation/:id` | User | Record detail |
| GET | `/api/v1/admin/reconciliation` | Admin | Platform-wide list |
| POST | `/api/v1/admin/reconciliation/:id/resolve` | Admin | Manual match |

## Statuses

`matched`, `unmatched`, `manual`, `failed`, `pending`
