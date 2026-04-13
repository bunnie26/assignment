# Ecommerce API (Take-Home)

**Author:** Vinay Lakhani  

## 1. Project Overview

Minimal REST backend for cart management, checkout, single-use discount codes, and admin configuration and stats. Each user has one in-memory cart; successful checkouts create orders and may generate a new coupon when the configured “every *n*th order” rule is satisfied.

## 2. Tech Stack

- **Node.js**
- **TypeScript**
- **Express**
- **Jest** (unit tests)

## 3. Setup Instructions

```bash
npm install
npm run dev
```

## 4. Running Tests

```bash
npm test
```

## 5. API Documentation

Endpoint details, request/response examples, a suggested test flow, and **curl** snippets are in **[API_DOCS.md](./API_DOCS.md)**.

## 6. Implementation Details

- **In-memory storage:** Carts, orders, discount codes, and discount configuration live in a single in-process store (`src/store/memory.store.ts`). Nothing is persisted to disk or a database.
- **Discount system:** Admins set `nthOrder` and `discountPercent` via `POST /admin/config`. After each successful checkout, if the total number of completed orders is a multiple of `nthOrder`, a new unused coupon is created and returned in the checkout response. Coupons are validated at checkout, apply as a percentage of subtotal, and are single-use.

## 7. Notes

- **Data resets on restart** — all state is lost when the process exits.
- **No authentication** — user identity is whatever `userId` the client sends; admin routes are not protected.

## 8. Future Improvements

- Add database persistence (PostgreSQL/Redis)
- Add authentication & authorization
- Add integration tests (supertest)