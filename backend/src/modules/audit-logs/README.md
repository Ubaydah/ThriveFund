# Audit Logs Module

Immutable audit trail for security-sensitive actions.

## Logged Actions

- User registration/login
- Goal and virtual account creation
- Payment verification and reconciliation
- Organization creation
- Invitation sent
- Webhook received

## Endpoints (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/audit-logs` | List audit logs (filterable) |
