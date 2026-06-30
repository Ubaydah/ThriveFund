# ThriveFund Backend

Node.js + TypeScript + Express modular monolith for payment collection and reconciliation using **Dedicated Virtual Accounts**.

> **Local/demo mode:** No live Nomba API calls are made while `PAYMENT_PROVIDER=mock_nomba` is active. Real provider calls belong behind `NombaProvider`.

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Framework | Express.js |
| Database | MySQL 8 (AWS RDS) |
| Email | Brevo |
| Auth | JWT |
| Deployment | AWS EC2 |

## Folder Structure

```
backend/
├── database/
│   ├── schema.sql          # Full schema
│   └── seed.sql            # Demo seed data
├── src/
│   ├── app.ts              # Express app + route mounting
│   ├── server.ts           # Entry point
│   ├── config/             # env, database
│   ├── lib/                # errors, response, email, audit
│   ├── middleware/         # auth, admin, error handler
│   ├── providers/
│   │   └── payment/        # PaymentProvider abstraction
│   │       ├── payment-provider.interface.ts
│   │       ├── mock-nomba.provider.ts   ← active now
│   │       └── nomba.provider.ts          ← placeholder
│   ├── shared/
│   │   ├── types/enums.ts
│   │   └── utils/pagination.ts
│   └── modules/              # Feature modules (see below)
└── ThriveFund.postman_collection.json
```

## Modules

Each module follows: `controller` · `service` · `repository` · `routes` · `validators` · `types` · `README.md`

| Module | Responsibility |
|--------|----------------|
| **auth** | Register, login, JWT, password reset |
| **users** | Profile, password, notification prefs |
| **organizations** | Schools, mosques, NGOs, businesses |
| **organization-members** | Team roles (owner, admin, treasurer, viewer) |
| **goals** | Campaigns / collection goals |
| **virtual-accounts** | Mock VA generation via PaymentProvider |
| **webhooks** | Receive + validate webhook events only |
| **payments** | Provider verification, payment records |
| **reconciliation** | Match payments → goals → transactions |
| **transactions** | Immutable payment records |
| **contributors** | Payer profiles |
| **invitations** | Brevo email invitations |
| **notifications** | In-app notifications |
| **analytics** | Dashboard stats and charts |
| **reports** | CSV exports, financial summaries |
| **community** | Community project listings |
| **public** | Public campaign pages |
| **content** | FAQs, categories, banks |
| **admin** | Platform admin dashboard |
| **audit-logs** | Security audit trail |
| **health** | Liveness / readiness probes |

## Payment Flow

```
Contributor transfer
       ↓
POST /api/webhooks/nomba  (or /mock/simulate in dev)
       ↓
webhooks module     → store webhook_events
       ↓
payments module     → MockNombaProvider.verifyPayment() → payments table
       ↓
reconciliation      → match VA → goal → create transaction
       ↓
notifications       → in-app + Brevo email
```

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASS=...
DB_NAME=thrivefund
JWT_SECRET=...
JWT_REFRESH_SECRET=...
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Payment provider — use mock_nomba for local/demo flows
PAYMENT_PROVIDER=mock_nomba
NOMBA_WEBHOOK_SECRET=dev-secret   # optional for mock signature validation
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in values
mysql ... < database/schema.sql
mysql ... < database/seed.sql
npm run dev
```

## Mock Payment Demo

1. Create goal + virtual account via API
2. Simulate payment:

```bash
curl -X POST http://localhost:3001/api/webhooks/mock/simulate \
  -H "Content-Type: application/json" \
  -d '{"account_number":"9123456789","amount":50000,"payer_name":"Babatunde Adeyemi"}'
```

3. Check dashboard — goal balance and transaction should update automatically.

## API Documentation

See [../docs/api/endpoints.md](../docs/api/endpoints.md)

## Nomba Integration

1. Implement `NombaProvider.createVirtualAccount()` with real Nomba API
2. Implement `NombaProvider.verifyPayment()` with Nomba webhook schema
3. Set `PAYMENT_PROVIDER=nomba` and configure `NOMBA_API_KEY`, `NOMBA_BASE_URL`
4. Register webhook URL: `https://api.thrivefund.ng/api/webhooks/nomba`

Do **not** call real Nomba endpoints before the hackathon build phase.
