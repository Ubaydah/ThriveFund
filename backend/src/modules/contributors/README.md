# Contributors Module

Contributor profiles and invitation management. Goal-scoped endpoints live inside the Goals module router.

## Endpoints

### Standalone (mounted at `/api/v1/contributors`)

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/contributors` | User | ⬜ TODO |

### Nested inside Goals module (`/api/v1/goals/:id/...`)

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/goals/:id/contributors` | User (owner) | ⬜ TODO |
| POST   | `/api/v1/goals/:id/contributors` | User (owner) | ⬜ TODO |
| POST   | `/api/v1/goals/:id/invitations` | User (owner) | ⬜ TODO |
| GET    | `/api/v1/goals/:id/invitations` | User (owner) | ⬜ TODO |

## Notes

- `POST /goals/:id/invitations` body: `{ recipients: [{email, name}], channel: "email"|"sms", message? }`.
- Email/SMS sending is currently stubbed — replace the `TODO` block in `contributors.service.ts`.
- Requires DB tables: `contributors`, `invitations`, `goals`, `transactions`.
