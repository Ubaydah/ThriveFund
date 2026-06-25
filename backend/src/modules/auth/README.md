# Auth Module

Handles user registration, login, token management, and password reset.

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | `/api/v1/auth/register` | Public | ⬜ TODO |
| POST | `/api/v1/auth/login` | Public | ⬜ TODO |
| POST | `/api/v1/auth/refresh` | Public | ⬜ TODO |
| POST | `/api/v1/auth/logout` | User (JWT) | ⬜ TODO |
| POST | `/api/v1/auth/forgot-password` | Public | ⬜ TODO |
| POST | `/api/v1/auth/reset-password` | Public | ⬜ TODO |
| GET  | `/api/v1/auth/me` | User (JWT) | ⬜ TODO |

## Notes

- `POST /register` returns `201` with user + token pair.
- `POST /login` returns `200` with user + token pair.
- `POST /forgot-password` always returns `200` (no email enumeration).
- `POST /logout` deletes the refresh token from `refresh_tokens` table.
- Password reset flow: `forgot-password` → email link with token → `reset-password`.
- Requires DB tables: `users`, `refresh_tokens`, `password_resets`.
