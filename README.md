# Offer Today

A web app that answers one question in seconds: **“I’m at this mall — which shops have discounts today, and which is the best deal?”**

It is **not** a marketplace: no cart, no checkout, no payments, no orders. It stores shop information and ranks shops by today’s discount so shoppers know where to walk.

- **Frontend** — React + Vite, Tailwind CSS, React Router, TanStack Query, Axios
- **Backend** — Express + Mongoose (MongoDB)
- **Docs** — product planning and API reference in [`docs/`](docs/)

---

## Table of contents

1. [Project structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Step 1 — Set up MongoDB](#step-1--set-up-mongodb)
5. [Step 2 — Run the backend](#step-2--run-the-backend)
6. [Step 3 — Run the frontend](#step-3--run-the-frontend)
7. [Step 4 — Verify it works](#step-4--verify-it-works)
8. [Environment variables](#environment-variables)
9. [Available scripts](#available-scripts)
10. [Demo data](#demo-data)
11. [Troubleshooting](#troubleshooting)

---

## Project structure

```
offerToday/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Single Axios instance
│   │   ├── components/     # DiscountBadge, ShopCard, FilterBar, OfferCard, ...
│   │   ├── hooks/          # TanStack Query hooks (usePlaces, useShop, ...)
│   │   ├── lib/            # formatDiscount, discountedPrice, timeLeft, storage
│   │   ├── pages/          # Place picker, place view, shop detail, search
│   │   ├── App.jsx         # Routes
│   │   └── main.jsx        # Providers (QueryClient, Router)
│   ├── .env.example
│   ├── tailwind.config.js  # Design tokens
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/db.js    # Mongoose connection
│   │   ├── models/         # User, Place, Shop, Product, Offer
│   │   ├── routes/         # health.js, api.js
│   │   ├── services/       # bestDiscount.js (discount computation)
│   │   ├── seed/seed.js    # Demo data
│   │   └── smoke/smoke.js  # Endpoint tests
│   ├── index.js            # Entry point
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── api.md              # API reference
│   ├── workflow.md         # Product overview
│   ├── thought.md
│   └── todo.md
└── .gitignore
```

The backend and frontend are **separate apps** in separate folders, each with its own `package.json`. You run both at the same time in two terminals.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js 18+** | Developed and tested on Node 22. Check with `node -v`. |
| **npm** | Ships with Node. Check with `npm -v`. |
| **MongoDB** | A MongoDB Atlas cluster (free tier is fine) or any MongoDB connection string. |

No database runs locally — the backend connects to MongoDB over the network, so you need a working connection string before starting.

---

## Quick start

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env      # then edit .env and set MONGODB_URI
npm run seed              # load demo data (run once)
npm run dev               # http://localhost:5000

# Terminal 2 — frontend
cd client
npm install
cp .env.example .env      # defaults to http://localhost:5000/api
npm run dev               # http://localhost:5173
```

The sections below explain each step. If you already have a MongoDB URI, you can jump straight to [Step 2](#step-2--run-the-backend).

---

## Step 1 — Set up MongoDB

You need a connection string in the form:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/offer-today-dev?retryWrites=true&w=majority
```

**Using MongoDB Atlas (free):**

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Security → Database Access** → **Add New Database User**. Set a username and password. Use a password with **no special characters** (`@ : / ? # [ ] %`) to avoid URL-encoding issues, or percent-encode them if you must.
3. **Security → Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for local development.
4. Click **Connect → Drivers**, choose **Node.js**, and copy the connection string. Replace `<db_password>` with your password and add a database name (e.g. `/offer-today-dev`) before the `?`.

> **Tip:** Atlas users are scoped to a *project*. If you get `bad auth`, confirm the user exists in the same project as the cluster, and that the password in your connection string exactly matches the one in Atlas.

---

## Step 2 — Run the backend

```bash
cd server
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Open `server/.env` and set at least `MONGODB_URI` to your connection string. See [Environment variables](#environment-variables) for the full list.

Seed the database with demo data (safe to re-run — it wipes and repopulates):

```bash
npm run seed
```

Start the server:

```bash
npm run dev     # auto-restarts on file changes (nodemon)
# or
npm start       # plain node
```

Expected output:

```
[db] connected to cluster0-shard-00-XX.kjrs3.mongodb.net/offer-today-dev
[server] listening on http://localhost:5000 (development)
```

If the initial database connection fails, the process exits with an error explaining why rather than hanging.

---

## Step 3 — Run the frontend

In a **second terminal**:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173** (Vite’s default port).

The client reads its API base URL from `VITE_API_URL` in `client/.env`, which defaults to `http://localhost:5000/api`. Keep the backend running, otherwise the UI shows its error state.

---

## Step 4 — Verify it works

**Backend health check:**

```bash
curl http://localhost:5000/api/health
```

You should see `"db": "connected"`.

**End-to-end test** (the backend must already be running):

```bash
cd server
npm run smoke
```

All 11 checks should pass, ending with `All checks passed`. This exercises the real endpoints and confirms the discount logic, ranking, and filters.

**In the browser**, open http://localhost:5173 and pick **Bashundhara City**. You should see, in this order:

| Rank | Shop | Discount |
|---|---|---|
| 1 | Yellow | 50% |
| 2 | Apex | 35% |
| 3 | Bata | 20% |
| 4 | Samsung Smart Plaza | 11.1% |
| 5 | Aarong | No offers today |

The 11.1% proves a fixed-amount offer (Tk 5000 off a Tk 45,000 phone) was converted to a percentage.

---

## Environment variables

### Backend — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | **Yes** | MongoDB connection string. |
| `PORT` | No | Server port. Defaults to `5000`. |
| `NODE_ENV` | No | `development` or `production`. Seeding refuses to run in `production`. |
| `CLIENT_URL` | No | CORS origin. Defaults to `*`, which works for local dev. |
| `JWT_SECRET` | No\* | Reserved for auth. |
| `JWT_EXPIRES_IN` | No\* | Reserved for auth. |
| `REFRESH_TOKEN_EXPIRES_IN` | No\* | Reserved for auth. |

\* Present in `.env.example` but **not used yet** — there are no authentication endpoints. See [`docs/api.md`](docs/api.md#not-implemented-yet).

### Frontend — `client/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | API base URL **including the `/api` prefix**. Defaults to `http://localhost:5000/api`. |

> Vite only exposes variables prefixed with `VITE_` to the browser.

---

## Available scripts

### Backend (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart). |
| `npm start` | Start with plain node. |
| `npm run seed` | Wipe and repopulate the database with demo data. |
| `npm run smoke` | Run endpoint tests. **Requires the server to be running.** |

### Frontend (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (http://localhost:5173). |
| `npm run build` | Production build into `client/dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |

---

## Demo data

`npm run seed` creates:

- **2 malls** — Bashundhara City, Jamuna Future Park (plus floors)
- **8 shops** — 7 approved, 1 pending (pending shops are intentionally hidden from lists)
- **13 products** and **10 offers**, including expired and future offers that must *not* count, to prove the date filtering works

**Demo users** (created by the seed, password `Password123!`):

```
admin@offertoday.test
owner@offertoday.test
shopper@offertoday.test
```

> These accounts exist in the database, but **login is not implemented yet** — there are no auth endpoints. They are ready for when authentication is added.

---

## Troubleshooting

**`bad auth : authentication failed` when starting or seeding**
The credentials in `MONGODB_URI` don't match a user in Atlas. Check that:
1. The username exists under **Database Access** *in the same project as the cluster*.
2. The password in `.env` is exactly the one shown in Atlas (passwords are shown only once when created/edited — use **Edit → Edit Password** to set a fresh one).
3. The password has no special characters, or that any special characters are percent-encoded (`@` → `%40`).

**Connection hangs or times out**
Your IP isn't allowlisted. Add it under **Network Access**.

**Frontend shows the “Couldn’t load” error**
The backend isn't running, or `VITE_API_URL` is wrong. Confirm `curl http://localhost:5000/api/places` returns JSON, and that `client/.env` points at `http://localhost:5000/api`.

**`npm run smoke` fails with `fetch failed`**
The smoke test makes HTTP calls — the backend must be running in another terminal first. It defaults to `http://localhost:5000/api`; override with the `API_URL` environment variable.

**Port already in use**
Change `PORT` in `server/.env`. Vite will pick another port automatically, or you can pass `--port`.

**Restarting the seed wipes data**
`npm run seed` deletes all documents before inserting. Only use it against a development database.

---

## Further reading

- [`docs/api.md`](docs/api.md) — full API reference, including endpoints, discount semantics, and what is not implemented yet.
- [`docs/workflow.md`](docs/workflow.md) — product overview and planned phases (search, watch list, notifications, trust system).
