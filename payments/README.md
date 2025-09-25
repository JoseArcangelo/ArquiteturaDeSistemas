Payments service (SQL - Postgres)

Endpoints:
- POST   /payments
- PATCH  /payments/:id/products
- GET    /payments/:order_id

Notes:
- This service may call Products service to check/update stock and Orders service to update status via HTTP.
- Configure `DATABASE_URL`.
