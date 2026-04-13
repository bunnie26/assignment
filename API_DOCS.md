# API_DOCS

## 1. Base Info

- Base URL: `http://localhost:3000`
- Content-Type: `application/json`
- Standard error format:

```json
{
  "error": "Error message"
}
```

---

## 2. API Endpoints

### POST `/cart/add`

Adds an item to a user's cart. If the same `itemId` already exists in that user's cart, quantity is incremented.

#### Request Body

```json
{
  "userId": "user_1",
  "item": {
    "itemId": "sku_1",
    "name": "Wireless Mouse",
    "unitPrice": 25.5,
    "quantity": 2
  }
}
```

#### Sample Response (200)

```json
{
  "message": "Item added to cart",
  "cart": {
    "userId": "user_1",
    "items": [
      {
        "itemId": "sku_1",
        "name": "Wireless Mouse",
        "unitPrice": 25.5,
        "quantity": 2
      }
    ],
    "updatedAt": "2026-04-13T10:00:00.000Z"
  }
}
```

#### Validation Rules

- `userId` is required and must be a string.
- `item` is required and must be an object.
- `item.itemId` is required and must be a string.
- `item.name` is required and must be a string.
- `item.unitPrice` must be a number greater than 0.
- `item.quantity` must be an integer greater than 0.

#### Error Responses

- `400` for validation failures.
- `500` for unexpected server errors.

---

### POST `/checkout`

Creates an order from the user's cart, optionally applies a coupon, then resets the cart to empty.

#### Request Body

```json
{
  "userId": "user_1",
  "discountCode": "SAVE10-ABCD"
}
```

`discountCode` is optional.

#### Sample Response (200) - without generated coupon

```json
{
  "message": "Checkout successful",
  "order": {
    "orderId": "ord_0001",
    "userId": "user_1",
    "items": [
      {
        "itemId": "sku_1",
        "name": "Wireless Mouse",
        "unitPrice": 25.5,
        "quantity": 2,
        "lineTotal": 51
      }
    ],
    "subtotal": 51,
    "discountAmount": 0,
    "total": 51,
    "createdAt": "2026-04-13T10:05:00.000Z"
  },
  "generatedCoupon": {
    "eligible": false
  }
}
```

#### Sample Response (200) - when nth-order coupon is generated

```json
{
  "message": "Checkout successful",
  "order": {
    "orderId": "ord_0003",
    "userId": "user_1",
    "items": [
      {
        "itemId": "sku_3",
        "name": "USB Cable",
        "unitPrice": 10,
        "quantity": 1,
        "lineTotal": 10
      }
    ],
    "subtotal": 10,
    "discountAmount": 0,
    "total": 10,
    "createdAt": "2026-04-13T10:15:00.000Z"
  },
  "generatedCoupon": {
    "eligible": true,
    "code": "SAVE10-X7P2",
    "percent": 10
  }
}
```

#### Discount Behavior

- If `discountCode` is provided, code must exist and be unused.
- Discount is applied as `subtotal * (percent / 100)` with 2-decimal rounding.
- Coupon is marked used during successful checkout.

#### Generated Coupon Behavior

- Coupon generation is automatic in checkout logic.
- Coupon is generated when `orderCount % nthOrder === 0` (`orderCount` from in-memory `orders.length`).
- Code format: `SAVE{percent}-{RANDOM}` (for example, `SAVE10-X7P2`).
- System retries on code collision (up to 5 attempts).

#### Error Cases

- `400` with `{ "error": "userId is required" }` (invalid request body).
- `400` with `{ "error": "discountCode must be a non-empty string when provided" }`.
- `400` with `{ "error": "Cart is empty" }`.
- `400` with `{ "error": "Invalid coupon code" }`.
- `400` with `{ "error": "Coupon code already used" }`.
- `404` with `{ "error": "Cart for given user not found" }`.

---

### POST `/admin/config`

Sets global discount rule used by checkout coupon generation.

#### Request Body

```json
{
  "nthOrder": 3,
  "discountPercent": 10
}
```

#### Sample Response (200)

```json
{
  "message": "Discount configuration updated",
  "config": {
    "nthOrder": 3,
    "discountPercent": 10
  }
}
```

#### Validation Rules

- `nthOrder` must be an integer greater than 0.
- `discountPercent` must be a number greater than 0 and at most 100.

#### Error Responses

- `400` for invalid config input.

---

### GET `/admin/stats`

Returns aggregate purchase/revenue/discount stats from in-memory store.

#### Sample Response (200)

```json
{
  "totalItemsPurchased": 4,
  "totalRevenue": 91,
  "totalOrders": 2,
  "totalDiscountAmountGiven": 10,
  "discountCodes": {
    "totalGenerated": 1,
    "totalUsed": 1,
    "activeCodes": []
  }
}
```

---

## 3. Example Testing Flow

1. **Configure discount rule**
   - `POST /admin/config` with `{ "nthOrder": 3, "discountPercent": 10 }`.
2. **Add items to cart**
   - `POST /cart/add` for `user_1`.
3. **Checkout without coupon**
   - `POST /checkout` with `{ "userId": "user_1" }`.
4. **Create 2 more orders**
   - Add item + checkout twice more for `user_1` or different users.
   - On the 3rd order, response should include `generatedCoupon.eligible: true` and a coupon code.
5. **Apply generated coupon**
   - Add item to cart, then checkout with that coupon in `discountCode`.
6. **Try invalid coupon**
   - Checkout with a fake code like `SAVE10-FAKE` and verify `400`.
7. **Fetch stats**
   - `GET /admin/stats` and verify totals/coupon usage.

---

## 4. Curl Examples

### Set discount config

```bash
curl -X POST http://localhost:3000/admin/config \
  -H "Content-Type: application/json" \
  -d '{
    "nthOrder": 3,
    "discountPercent": 10
  }'
```

### Add item to cart

```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "item": {
      "itemId": "sku_1",
      "name": "Wireless Mouse",
      "unitPrice": 25.5,
      "quantity": 2
    }
  }'
```

### Checkout without coupon

```bash
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1"
  }'
```

### Checkout with coupon

```bash
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "discountCode": "SAVE10-X7P2"
  }'
```

### Invalid coupon example

```bash
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "discountCode": "SAVE10-FAKE"
  }'
```

### Get stats

```bash
curl -X GET http://localhost:3000/admin/stats
```
