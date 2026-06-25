# Notifications Module

In-app notification feed. Notifications are created by the webhook processor when a payment lands.

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/notifications` | User | ⬜ TODO |
| GET    | `/api/v1/notifications/unread-count` | User | ⬜ TODO |
| PATCH  | `/api/v1/notifications/:id/read` | User | ⬜ TODO |
| POST   | `/api/v1/notifications/read-all` | User | ⬜ TODO |

## Query Params (`GET /notifications`)

| Param | Description |
|-------|-------------|
| `unread_only` | `true` to return only unread |
| `page` / `per_page` | Pagination |

## Notification Types

`payment` · `goal` · `contributor` · `reminder` · `system`

## Notes

- `unread-count` powers the sidebar badge (e.g. badge showing "3").
- `PATCH /:id/read` returns `204`. Returns `404` if notification doesn't belong to user.
- Notifications are written by `webhooks.service.ts` after successful payment processing.
- Requires DB table: `notifications`.
