# Organizations Module

Manages organizations (schools, mosques, churches, cooperatives, NGOs, etc.) that collect payments through ThriveFund.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations` | List user's organizations |
| GET | `/api/v1/organizations/:id` | Get organization |
| PATCH | `/api/v1/organizations/:id` | Update organization |

## Organization Types

`school`, `mosque`, `church`, `cooperative`, `association`, `ngo`, `business`, `event`, `other`

## Structure

- `organizations.controller.ts` — HTTP handlers
- `organizations.service.ts` — Business logic + audit
- `organizations.repository.ts` — SQL queries
- `organizations.routes.ts` — Route definitions
- `organizations.validators.ts` — Zod DTO validation
- `organizations.types.ts` — TypeScript interfaces
