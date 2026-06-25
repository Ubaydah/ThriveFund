# Goals Module

Core resource — savings/contribution goals with full CRUD, nested sub-resource routes, and share link.

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST   | `/api/v1/goals` | User | ⬜ TODO |
| GET    | `/api/v1/goals` | User | ⬜ TODO |
| GET    | `/api/v1/goals/:id` | User (owner) | ⬜ TODO |
| PATCH  | `/api/v1/goals/:id` | User (owner) | ⬜ TODO |
| DELETE | `/api/v1/goals/:id` | User (owner) | ⬜ TODO |
| POST   | `/api/v1/goals/:id/close` | User (owner) | ⬜ TODO |
| GET    | `/api/v1/goals/:id/share` | User (owner) | ⬜ TODO |

### Nested — Virtual Accounts

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST   | `/api/v1/goals/:id/virtual-account` | User | ⬜ TODO |
| GET    | `/api/v1/goals/:id/virtual-account` | User (owner) | ⬜ TODO |

### Nested — Transactions

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/goals/:id/transactions` | User (owner) | ⬜ TODO |

### Nested — Contributors & Invitations

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/goals/:id/contributors` | User (owner) | ⬜ TODO |
| POST   | `/api/v1/goals/:id/contributors` | User (owner) | ⬜ TODO |
| POST   | `/api/v1/goals/:id/invitations` | User (owner) | ⬜ TODO |
| GET    | `/api/v1/goals/:id/invitations` | User (owner) | ⬜ TODO |

## Notes

- `DELETE` returns `409` if pending transactions exist.
- `POST /close` sets `status = 'completed'`.
- All `:id` routes verify the goal belongs to the requesting user.
- Virtual account, transaction, and contributor controllers are imported here for the nested routes.
- Requires DB tables: `goals`, `virtual_accounts`, `transactions`, `contributors`, `invitations`.
