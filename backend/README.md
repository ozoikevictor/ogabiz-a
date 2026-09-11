# OgaBiz AI Backend

This is the separate backend API for OgaBiz AI.

## Run it

```bash
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Main API Routes

- `GET /` checks if the API is running.
- `POST /api/auth/register` creates a user and business.
- `POST /api/auth/login` logs in a user.
- `GET /api/dashboard/:businessId` loads all dashboard data.
- `POST /api/products` adds a product.
- `POST /api/customers` adds a customer.
- `POST /api/sales` records a sale and reduces stock.
- `POST /api/expenses` records an expense.
- `POST /api/debts` records a debt.
- `POST /api/debts/:id/payments` records a debt payment.
