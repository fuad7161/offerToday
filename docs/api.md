# Offer Today — Backend API Reference

Base URL (development): `http://localhost:5000`

All responses are JSON. All endpoints below are **read-only** (`GET`) — there are no write, auth, or mutation endpoints yet. See [Not implemented yet](#not-implemented-yet).

---

## Quick reference

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness + database status |
| `GET` | `/api/health/db` | Database readiness probe |
| `GET` | `/api/places` | List top-level places |
| `GET` | `/api/places/:id/shops` | Shops in a place, ranked by today's discount |
| `GET` | `/api/shops/:id` | Shop detail with products and active offers |
| `GET` | `/api/products` | Products across shops, ranked by discount |

---

## Health

### `GET /api/health`

Returns process liveness and MongoDB connection state in one payload.

**Response `200`** (database connected)

```json
{
  "status": "ok",
  "db": "connected",
  "database": {
    "readyState": 1,
    "host": "cluster0-shard-00-02.kjrs3.mongodb.net",
    "name": "offer-today-dev"
  },
  "uptime": 4.05
}
```

**Response `503`** (database not connected) — same shape, with `"status": "unavailable"` and `"db"` set to one of `disconnected`, `connecting`, or `disconnecting`.

| Field | Type | Notes |
|---|---|---|
| `status` | string | `ok` when the DB is connected, otherwise `unavailable` |
| `db` | string | Plain connection state: `connected` / `disconnected` / `connecting` / `disconnecting` |
| `database.readyState` | number | Mongoose ready state (1 = connected) |
| `database.host` | string \| null | Connected host |
| `database.name` | string \| null | Connected database name |
| `uptime` | number | Process uptime in seconds |

> `db` is a plain string specifically so clients can compare it directly (`health.db === 'connected'`).

### `GET /api/health/db`

Dedicated readiness probe. Returns `200` only when MongoDB is reachable, otherwise `503`.

```json
{
  "status": "ok",
  "db": "connected",
  "host": "cluster0-shard-00-02.kjrs3.mongodb.net",
  "name": "offer-today-dev"
}
```

---

## Places

### `GET /api/places`

Returns all **top-level** places (those with `parent: null`), sorted by name. Floors and other nested places are excluded — they are reached through their parent's shop list.

```json
[
  {
    "_id": "6ad26c94b4d7ea7771d06cd6",
    "name": "Bashundhara City",
    "type": "mall",
    "parent": null,
    "city": "Dhaka",
    "createdAt": "2026-10-16T18:27:32.033Z",
    "updatedAt": "2026-10-16T18:27:32.033Z",
    "__v": 0
  },
  {
    "_id": "6ad26c94b4d7ea7771d06cd7",
    "name": "Jamuna Future Park",
    "type": "mall",
    "parent": null,
    "city": "Dhaka",
    "createdAt": "2026-10-16T18:27:32.117Z",
    "updatedAt": "2026-10-16T18:27:32.117Z",
    "__v": 0
  }
]
```

Takes no query parameters.

---

## Shops

### `GET /api/places/:id/shops`

**The core endpoint of the product.** Returns every `approved` shop in the given place **and its child places (floors)**, ranked by today's discount, highest first.

This is what answers the app's central question: *"I'm at this mall — which shops have the best deal today?"*

**Path parameters**

| Name | Type | Description |
|---|---|---|
| `id` | ObjectId | Place ID. May be a mall or a floor. |

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `category` | string | — | Exact match on shop category (e.g. `shoes`, `fashion`, `electronics`) |
| `minDiscount` | number | — | Only shops whose `bestDiscountToday` is `>=` this value |
| `activeOnly` | `"true"` | — | Only shops with `bestDiscountToday > 0`. Any other value (or omission) disables the filter. |

`minDiscount` and `activeOnly` are combined when both are present — the effective filter becomes `> 0` AND `>= minDiscount`.

**Response `200`**

```json
[
  {
    "_id": "6ad26c94b4d7ea7771d06cd9",
    "owner": "6ad26c93b4d7ea7771d06cd4",
    "place": { "_id": "6ad26c94b4d7ea7771d06cd8", "name": "Level 3", "type": "floor" },
    "name": "Yellow",
    "category": "fashion",
    "floorUnit": "L3-31",
    "openingHours": "10:00-21:00",
    "status": "approved",
    "trustScore": 100,
    "bestDiscountToday": 50,
    "createdAt": "2026-10-16T18:27:32.287Z",
    "updatedAt": "2026-10-16T18:27:32.287Z",
    "__v": 0
  }
]
```

Verified ordering for the seeded data — `GET /api/places/<Bashundhara City>/shops`:

| Rank | Shop | Category | Floor | `bestDiscountToday` |
|---|---|---|---|---|
| 1 | Yellow | fashion | Level 3 | 50 |
| 2 | Apex | shoes | Level 3 | 35 |
| 3 | Bata | shoes | Level 3 | 20 |
| 4 | Samsung Smart Plaza | electronics | Level 5 | 11.1 |
| 5 | Aarong | fashion | Level 5 | 0 |

**Ordering rules:** `bestDiscountToday` descending, then `name` ascending as a tiebreaker.

**Filtering examples**

```
GET /api/places/6ad26c94b4d7ea7771d06cd6/shops?minDiscount=30
→ returns Yellow (50), Apex (35)

GET /api/places/6ad26c94b4d7ea7771d06cd6/shops?minDiscount=30&activeOnly=true
→ returns Yellow (50), Apex (35)

GET /api/places/6ad26c94b4d7ea7771d06cd6/shops?category=shoes
→ returns Apex, Bata
```

**Errors**

| Status | Body | Cause |
|---|---|---|
| `400` | `{"error":"Invalid place id"}` | `:id` is not a valid ObjectId |

> Note: an ID that is *well-formed but does not exist* returns `200` with an empty array `[]`, not `404`. A `404` here is only returned for a malformed ID in the sibling endpoint below — always validate the format first.

---

### `GET /api/shops/:id`

Shop detail, including its products and its **currently active** offers.

**Path parameters**

| Name | Type | Description |
|---|---|---|
| `id` | ObjectId | Shop ID |

**Response `200`**

```json
{
  "shop": {
    "_id": "6ad26c94b4d7ea7771d06cd9",
    "name": "Yellow",
    "category": "fashion",
    "floorUnit": "L3-31",
    "place": "6ad26c94b4d7ea7771d06cd8",
    "status": "approved",
    "trustScore": 100,
    "bestDiscountToday": 50
  },
  "products": [
    {
      "_id": "...",
      "shop": "6ad26c94b4d7ea7771d06cd9",
      "name": "Cotton Polo",
      "brand": "Yellow",
      "category": "clothing",
      "regularPrice": 1200,
      "bestDiscountToday": 50
    },
    {
      "_id": "...",
      "shop": "6ad26c94b4d7ea7771d06cd9",
      "name": "Slim Fit Jeans",
      "brand": "Yellow",
      "category": "clothing",
      "regularPrice": 2800,
      "bestDiscountToday": 50
    }
  ],
  "offers": [
    {
      "_id": "...",
      "shop": "6ad26c94b4d7ea7771d06cd9",
      "scope": "shop",
      "type": "percent",
      "value": 50,
      "title": "Half price weekend",
      "startsAt": "2026-10-15T18:27:32.000Z",
      "endsAt": "2026-10-21T18:27:32.000Z",
      "status": "active"
    }
  ]
}
```

| Field | Description |
|---|---|
| `shop` | The shop document, with `place` populated to `{ _id, name, type }` |
| `products` | All products for this shop, sorted by `bestDiscountToday` descending |
| `offers` | Only offers where `status: "active"` **and** `startsAt <= now <= endsAt` |

**Errors**

| Status | Body | Cause |
|---|---|---|
| `400` | `{"error":"Invalid shop id"}` | `:id` is not a valid ObjectId |
| `404` | `{"error":"Shop not found"}` | Valid ObjectId, but no matching shop |

---

## Products

### `GET /api/products`

The brand/product view: which shops are discounting a given brand or matching a text search, ranked by discount. This powers "show me every shop discounting Nike."

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `brand` | string | — | Exact brand match, **case-insensitive** (`nike` matches `Nike`) |
| `q` | string | — | Full-text search over product `name` and `brand` (MongoDB `$text`) |

Both may be combined; they are applied as an AND.

**Response `200`** — array of products with the shop summary populated:

```json
[
  {
    "_id": "...",
    "name": "Nike Pegasus",
    "brand": "Nike",
    "category": "shoes",
    "regularPrice": 12000,
    "bestDiscountToday": 30,
    "shop": {
      "_id": "6ad26c94b4d7ea7771d06cdc",
      "name": "Sportsworld",
      "floorUnit": "G-14",
      "place": "6ad26c94b4d7ea7771d06cd7",
      "bestDiscountToday": 30
    }
  },
  {
    "_id": "...",
    "name": "Nike Air Zoom",
    "brand": "Nike",
    "category": "shoes",
    "regularPrice": 8000,
    "bestDiscountToday": 6.3,
    "shop": {
      "_id": "...",
      "name": "Apex",
      "floorUnit": "L3-20",
      "place": "6ad26c94b4d7ea7771d06cd8",
      "bestDiscountToday": 35
    }
  }
]
```

**Ordering:** `bestDiscountToday` descending, then `name` ascending.

**Examples**

```
GET /api/products?brand=nike
→ Nike Pegasus (Sportsworld, 30%), then Nike Air Zoom (Apex, 6.3%)

GET /api/products?q=galaxy
→ Samsung products matching the text index
```

> The `brand` value is regex-escaped before matching, so characters like `+`, `.`, `(` and `*` are treated literally and cannot break the query.

---

## Data model

### Discount semantics

`bestDiscountToday` (on both `Shop` and `Product`) is a **percentage**, recomputed from active offers. Key rules:

- Only offers that are **currently within their window** count: `status: "active"` and `startsAt <= now <= endsAt`. Expired and future offers are excluded.
- `percent` offers are used as-is.
- `fixed` offers are converted to a percentage of the product's `regularPrice`, capped at `100`. Example: Tk 5000 off a Tk 45000 phone = `11.1%`.
- **Overlap rule:** when several offers apply to one product, the **highest effective discount wins**.
- Offer **scope** determines what it applies to: `shop` (everything), `brand` (matching brand), or `product` (one product).
- A shop-wide `percent` offer counts toward the shop's best even if the shop has no products yet.
- Values are rounded to one decimal place.

### Key fields

**Shop**

| Field | Type | Notes |
|---|---|---|
| `place` | ObjectId → Place | Required |
| `category` | string | Required; filterable via `?category=` |
| `status` | enum | `pending` \| `approved` \| `suspended`. Only `approved` appears in public lists. |
| `trustScore` | number | Default `100` |
| `bestDiscountToday` | number | Percent, default `0` |

**Offer**

| Field | Type | Notes |
|---|---|---|
| `scope` | enum | `shop` \| `product` \| `brand` |
| `product` | ObjectId → Product | Used when `scope = product` |
| `brand` | string | Used when `scope = brand` |
| `type` | enum | `percent` \| `fixed` |
| `value` | number | Percentage or currency amount, depending on `type` |
| `startsAt` / `endsAt` | Date | Both required; define the active window |
| `status` | enum | `active` \| `ended` |

---

## Errors

All error responses share one shape:

```json
{ "error": "Human-readable message" }
```

| Status | Meaning |
|---|---|
| `400` | Malformed input (typically an invalid ObjectId path param) |
| `404` | Resource not found, or unknown route |
| `500` | Unhandled server error |

Unmatched routes return `{"error":"Not found"}` with status `404`.

---

## CORS, security, and logging

- **CORS** — origin is `process.env.CLIENT_URL`, defaulting to `*`.
- **Helmet** — security headers are applied to every response.
- **Body parsing** — `express.json()`.
- **Logging** — `morgan` in `dev` format, or `combined` when `NODE_ENV=production`.

---

## Running the server

From `server/`:

```bash
npm run dev      # nodemon, auto-restart
npm start        # plain node
npm run seed     # wipe + repopulate demo data
npm run smoke    # endpoint tests (server must already be running)
```

The server listens on `process.env.PORT`, default **5000**, and connects to `process.env.MONGODB_URI` on startup. It exits with code `1` if the initial database connection fails.

---

## Not implemented yet

These are read-only endpoints. The following exist in the data model or the planning docs but have **no HTTP routes**:

- **Authentication** — no register/login/logout. The `User` model has `passwordHash` (`select: false`) and a `roles` enum, and `bcryptjs` / `jsonwebtoken` are installed, but no auth routes or JWT middleware exist.
- **Writes** — no create/update/delete for places, shops, products, or offers. All data changes go through `npm run seed`.
- **Search by place name** — `GET /api/places` returns all top-level places; there is no name/query filter.
- **Watch list, alerts, offer reports** — Phase 3/4 features from `docs/workflow.md`. No models or routes.
- **Pagination** — lists return all matching documents. `GET /api/products` in particular has no limit or offset.

### Known rough edges

1. **`q` text search requires an index.** The `$text` filter in `GET /api/products` relies on the product text index (`name`, `brand`). If it errors on a fresh database, ensure indexes are built.
2. **No input validation library.** `minDiscount` is coerced with `Number()`; a non-numeric value becomes `NaN` and yields an empty result rather than a `400`. `zod` is installed but unused.
3. **No pagination or result caps** on any list endpoint.
4. **Shop detail populates `place` but not `owner`**, so owner details are not exposed.
