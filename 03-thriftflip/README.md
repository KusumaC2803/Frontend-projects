# Thrift-Flip Store

A modern full-stack fashion e-commerce starter built from the original Thrift-Flip Store concept.

## Current upgrade

- React + Vite frontend
- Express backend
- Product catalogue
- Search
- Category filtering
- Price filtering
- Rating filtering
- Sorting
- Product detail page
- Shopping cart
- Persistent cart with localStorage
- Responsive/mobile-first layout
- Checkout page
- Stripe test-mode integration scaffold
- REST API
- Your supplied fashion images included as product assets

## Run locally

```bash
npm install
npm --prefix client install
npm --prefix server install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Environment

Copy:

```bash
server/.env.example
```

to:

```bash
server/.env
```

Add your Stripe test secret when you are ready.

## Next upgrades

1. Connect checkout to Stripe test mode.
2. Add MongoDB/PostgreSQL persistence.
3. Add authentication.
4. Add admin product management.
5. Add order history.
6. Deploy frontend and backend.
