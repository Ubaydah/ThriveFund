# Reports Module

Generates CSV-style summaries and financial reports for organizations and users.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reports/financial-summary` | Totals: goals, collected, transactions |
| GET | `/api/v1/reports/transactions/export` | CSV export of transactions |
| GET | `/api/v1/reports/reconciliation` | Reconciliation report (paginated) |
