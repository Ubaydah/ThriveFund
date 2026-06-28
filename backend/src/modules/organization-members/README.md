# Organization Members Module

Team membership and role-based access for organizations.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/organizations/:orgId/members` | List members |
| POST | `/api/v1/organizations/:orgId/members` | Add member |
| PATCH | `/api/v1/organizations/:orgId/members/:memberId` | Update role |
| DELETE | `/api/v1/organizations/:orgId/members/:memberId` | Remove member |

## Roles

`owner`, `admin`, `treasurer`, `viewer`
