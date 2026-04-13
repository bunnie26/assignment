# IMPLEMENTATION_REPORT

## 1. Overview

Implemented a TypeScript + Express backend for a minimal ecommerce flow with:
- cart item management (one cart per user)
- checkout with optional discount code
- automatic nth-order coupon generation
- admin discount configuration and aggregate stats

Data is fully in-memory using a centralized store object.

---

## 2. Requirements Mapping

### Requirement: Cart system

Implemented in `CartService` with `POST /cart/add`.
- Cart keyed by `userId` in `memoryStore.carts` (`Map`).
- First add creates cart; repeated `itemId` increments quantity.
- Checkout resets cart to empty (cart is not deleted).

### Requirement: Checkout system

Implemented in `CheckoutService` with `POST /checkout`.
- Validates cart existence and non-empty cart.
- Builds immutable order item snapshot (`lineTotal` per item).
- Calculates `subtotal`, optional discount, and `total` with rounding.
- Stores order in `memoryStore.orders`.
- Marks coupon as used when applied.

### Requirement: Discount system

Implemented across `DiscountService` + `CheckoutService`.
- Admin sets rule via `POST /admin/config` (`nthOrder`, `discountPercent`).
- During checkout, if `orders.length % nthOrder === 0`, generates coupon.
- Coupon format: `SAVE{percent}-{RANDOM}`.
- Uniqueness handled with collision checks against `discountCodes` map.
- Coupon validation enforces existence + single-use.

### Requirement: Admin APIs

- `POST /admin/config`: updates global discount rule.
- `GET /admin/stats`: returns
  - `totalItemsPurchased`
  - `totalRevenue`
  - `totalOrders`
  - `totalDiscountAmountGiven`
  - discount code metrics (`totalGenerated`, `totalUsed`, `activeCodes`)

---

## 3. Design Decisions Summary

- **In-memory storage only**: matches assignment scope and keeps implementation focused.
- **Express + TypeScript**: fast development with strong typing and clear structure.
- **Map-based lookups**: `carts` and `discountCodes` use `Map` for O(1) average lookup.
- **Coupon generation strategy**: automatic generation at checkout based on nth-order rule, with retry on collisions.
- **Validation approach**: simple custom validator functions throwing typed `AppError` for consistent HTTP responses.
- **Thin controllers, fat services**: business logic is service-first for testability and clean separation.

---

## 4. Trade-offs & Limitations

- No persistence layer: all state resets on server restart.
- No authentication/authorization: admin/user endpoints are open.
- No idempotency keys: duplicate checkout requests can create multiple orders.
- Concurrency protection is basic: checkout sequence reduces inconsistent updates, but there is no distributed lock/transaction system.
- No integration/API tests currently; testing is unit-focused.

---

## 5. Testing Coverage

Unit tests are implemented with Jest for service-layer business logic:

- `cart.service.test.ts`
  - creates cart on first add
  - increments quantity for existing item
- `checkout.service.test.ts`
  - checkout without coupon
  - checkout with valid coupon
  - rejects empty cart
  - rejects reused coupon
- `discount.service.test.ts`
  - updates config
  - generates only on nth order
  - retries on coupon code collision
- `stats.service.test.ts`
  - verifies aggregate totals for orders/revenue/discounts

Not currently tested:
- HTTP integration behavior for endpoints/middleware
- 404/500 path assertions at API layer

---

## 6. Project Structure Overview

- `services/`: core business logic (cart, checkout, discount, stats)
- `controllers/`: request handling + response mapping only
- `routes/`: endpoint registration and route grouping
- `store/`: centralized in-memory state (`MemoryStore`)
- `validators/`: payload validation rules per API area
- `models/`: shared domain interfaces/types
- `utils/`: shared helpers (`AppError`, money rounding, ID/coupon generators)
- `tests/unit/`: service-level unit tests

---

## 7. How to Run

### Install

```bash
npm install
```

### Run in dev mode

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Run built app

```bash
npm start
```
