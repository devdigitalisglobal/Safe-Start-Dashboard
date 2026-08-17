# Safe Start — Reporting Dashboard

Next.js web app for NRMA, staff, partners, and school admins. Reads aggregate metrics from `safe-start-api` — never touches the database directly.

**Target URL:** `dashboard.safestartdrivers.com.au`

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Supabase (`@supabase/ssr`) |
| Styling | CSS Modules + design tokens (no Tailwind) |
| Data | `safe-start-api` `/dashboard/*` endpoints |

## Setup

```powershell
cd "D:\Digitalis Global Projects\safe-start-dashboard"
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env.local` and fill in values. See `.env.example` for the full list.

- Use the same Supabase project as the mobile app
- Only the **anon/publishable** key — never the service key
- Restart `npm run dev` after editing `.env.local`

### Access

Dashboard routes require a user with role `staff`, `partner`, `reviewer`, or `school_admin`. Student accounts are rejected at login.

Seed dev dashboard users (set `DASHBOARD_DEV_PASSWORD` in the API `.env` first — see `safe-start-api/.env.example`):

```powershell
cd "D:\Digitalis Global Projects\safe-start-api"
npm run seed:dashboard-users
```

The seed script prints dev login emails and confirms the password from your env — it is not stored in source code.

Ensure the API is running:

```powershell
cd "D:\Digitalis Global Projects\safe-start-api"
npm run dev
```

## Project layout

```
src/
├── app/
│   ├── page.tsx          Dashboard home (improvement + reach)
│   ├── login/page.tsx    Sign in
│   └── auth/callback/    Supabase OAuth callback
├── components/           Header, tiles, sections
├── lib/
│   ├── api.ts            Typed fetch to safe-start-api
│   ├── auth.ts           Session + role gate
│   └── supabase/         Browser + server clients
└── theme/tokens.ts       Colours, spacing (matches mobile app)
```

## Related repos

| Repo | Purpose |
|---|---|
| `safe-start` | Expo mobile app |
| `safe-start-api` | Fastify API + dashboard aggregation |
| `safe-start-dashboard` | This project |

## Security

See [../safe-start/SECURITY.md](../safe-start/SECURITY.md) before deploying.
