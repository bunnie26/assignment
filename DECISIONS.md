# Design Decisions

Short record of trade-offs for this take-home. Each choice matches what shipped in code.

---

## Decision: In-memory storage vs database

**Context:** The brief allowed an in-memory store and asked for working APIs quickly, without persistence or ops overhead.

**Options Considered:**

* Keep all carts, orders, coupons, and config in process memory only
* Add SQLite or Postgres with migrations and repositories

**Choice:** In-memory storage only (central `MemoryStore` with maps and arrays).

**Why:** Scope and time-to-value favor a single process and no migration story. The assignment explicitly permits it. Trade-off: restarts wipe state, so this is not production-ready for real commerce. If this grew, I would introduce a DB behind the same service interfaces and keep the domain logic unchanged.

---

## Decision: Express vs Fastify

**Context:** Pick a Node HTTP framework that reviewers can run without surprises and that pairs cleanly with TypeScript.

**Options Considered:**

* Express — widest familiarity, huge ecosystem, straightforward middleware model
* Fastify — faster defaults, schema-first validation, slightly steeper onboarding for reviewers skimming a repo cold

**Choice:** Express.

**Why:** For a small API surface, raw throughput is not the bottleneck. Express keeps the mental model obvious in an interview (routes → controllers → services). Fastify would be a fine alternative if the team standardized on it or if we needed built-in JSON schema validation at the edge.

---

## Decision: Map vs array for primary lookups

**Context:** Carts and discount codes are keyed by string identifiers; orders are a chronological list.

**Options Considered:**

* Use arrays for everything and scan/filter on each read
* Use `Map` for keyed entities (`userId` → cart, code → coupon) and an array only where order matters (orders)

**Choice:** `Map` for carts and discount codes; `Order[]` for completed orders.

**Why:** Cart and coupon lookups are hot paths and should stay O(1) average time. Orders are append-only and stats scan the full list anyway, so an array is simple and matches “order history” mentally. Arrays for carts would work at toy scale but scale poorly and read worse in code reviews.

---

## Decision: Coupon generation during checkout vs admin-triggered

**Context:** The product rule is “every nth order gets a coupon.” The assignment also mentions admin APIs; we needed a clear split between configuration and execution.

**Options Considered:**

* Admin endpoint that both sets `n` / `x%` and manually triggers generation when the counter hits a multiple
* Admin sets the rule (`nthOrder`, `discountPercent`); the system generates a code automatically at the end of a successful checkout when `orders.length % nthOrder === 0`

**Choice:** Config via `POST /admin/config`; generation inside checkout after the order is persisted.

**Why:** Admins should not have to remember to “click generate” for correctness. The invariant lives in one place: checkout completes, count is updated, then eligibility runs. Admin stays configuration-only, which is easier to explain and test. A separate “preview generation” admin endpoint could be added later for support tooling without changing core behavior.

---

## Decision: Validation approach (custom vs library)

**Context:** Every endpoint needs predictable 400s and a single error shape without pulling in a heavy validation stack.

**Options Considered:**

* Small custom validators that throw a typed `AppError`
* Zod / Joi / express-validator with shared schemas and automatic error formatting

**Choice:** Custom validators colocated under `validators/`.

**Why:** There are only a few payloads; duplicating schema logic in a library would add dependency weight and boilerplate for marginal gain. Trade-off: no automatic OpenAPI generation from schemas. If the API grew, I would migrate to Zod (or similar) for composable schemas and stricter numeric guards (e.g. `Number.isFinite`) in one place.

---

## Decision: Money handling (float vs integer cents)

**Context:** Line totals, subtotals, discounts, and stats all need consistent rounding and readable JSON.

**Options Considered:**

* Store and transmit integer cents everywhere (avoids binary float issues end-to-end)
* Use JavaScript `number` (IEEE float) with explicit rounding at calculation boundaries

**Choice:** `number` dollars/units with a small `roundMoney` helper at sum and discount steps.

**Why:** The assignment is a minimal backend; float with controlled rounding keeps examples readable in Postman and matches how many teams prototype. I accept minor float risk for pathological inputs. Production systems I have worked on prefer integer minor units or a decimal library; migrating would mean changing types at the model boundary and fixing tests, not rewriting business rules.
