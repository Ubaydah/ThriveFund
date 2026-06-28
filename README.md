# ThriveFund

Save, collect, and reconcile payments effortlessly — a React web app for Nigerian businesses and communities.

## Project Structure

```
ThriveFund/
├── docs/        # Architecture & API documentation
├── backend/     # Node.js + Express + TypeScript (modular monolith)
└── frontend/    # React + Vite + TypeScript + Tailwind
```

## Documentation

See the [docs/](./docs/) folder for:

- [Architecture Overview](./docs/architecture-overview.md)
- [API Endpoints (full reference)](./docs/api/endpoints.md)
- [API Quick Reference](./docs/api/quick-reference.md)
- [Webhook Specification](./docs/api/webhooks.md)

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Backend

```bash
cd backend
npm install
cp .env.example .env
mysql ... < database/schema.sql
mysql ... < database/seed.sql
npm run dev
```

API runs at [http://localhost:3001/api/v1](http://localhost:3001/api/v1).

See [backend/README.md](./backend/README.md) for mock payment demo flow.

## Build

```bash
cd frontend
npm run build
npm run preview
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
