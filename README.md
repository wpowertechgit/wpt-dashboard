# WastePowertech Operations Dashboard

This is a production waste management operations dashboard built for a waste-to-energy company.

It is a full-stack operations system for tracking waste-to-energy production work across projects, subassemblies, departments, blockers, PDCA actions, internal tasks, inventory, and weekly team KPIs. The app is designed as an enterprise-style SaaS dashboard: authenticated users see only the pages and actions allowed by their role, while production data lives behind Supabase PostgreSQL Row Level Security policies.

## Demo Mode

The app includes a demo mode backed by dummy waste company data. Demo mode exercises the UI and operational workflows without production credentials or real customer data.

```bash
npm install
cp .env.example .env.local
# set VITE_ENABLE_DEMO=true in .env.local
npm run dev
```

Then open the local Vite URL and use the demo entry on the login screen.

## Architecture

```mermaid
flowchart LR
  User[Authenticated user or demo visitor] --> React[React + TypeScript frontend]
  React --> Router[Role-aware routes and permission guards]
  Router --> SupabaseClient[Supabase JS client]
  SupabaseClient --> Auth[Supabase Auth]
  SupabaseClient --> Postgres[(Supabase PostgreSQL)]
  Postgres --> RLS[Row Level Security policies]
  React --> Demo[Static demo dataset]
  React --> Cloudflare[Cloudflare Workers / Pages deployment]
  SupabaseFunctions[Supabase Edge Functions] --> Auth
```

## Key Features

- 12 protected application areas: dashboard, projects, subassemblies, planning calendar, blockages, PDCA, daily flow, team KPI, tasks, inventory, audit logs, and admin.
- Role-based access control with `admin`, `production`, `office`, `office_production`, and `viewer` roles.
- Fine-grained permission keys for view/edit/admin actions, including user management, role management, log viewing, and log deletion.
- Real-time operational KPIs for progress, blockers, delayed work, lead time, efficiency, and quality.
- PDCA workflow module that converts production problems into trackable Plan-Do-Check-Act actions.
- Production flow tracking across LASER, ROLAT, SUDAT, ASAMBLAT, and VOPSIT departments.
- Blockage management with impact, owner, department, status, resolution date, and age tracking.
- Planning calendar for due dates, completions, overdue work, and operational scheduling.
- Internal task board with assignment, priority, due dates, status, and comments.
- Inventory module for stock levels, minimum thresholds, suppliers, locations, and stock transactions.
- Audit/security log area for operational visibility.
- Responsive Material UI interface with desktop navigation and mobile drawer navigation.
- Bilingual Romanian/English page guidance.
- Demo/staging mode with fake waste company projects, blockers, PDCA items, flow logs, and KPI data.

## Tech Stack

- TypeScript
- React 19
- Vite
- Material UI and MUI icons
- React Router
- Supabase JS
- Supabase Auth
- Supabase PostgreSQL
- PostgreSQL migrations
- Supabase Edge Functions
- Cloudflare Workers / Wrangler
- Recharts
- Framer Motion
- Node test runner

## Security Practices

Production deployments use Supabase Auth, PostgreSQL Row Level Security, and app-level permission guards together. The public repository contains only placeholder environment values in `.env.example`.

Security hardening already performed:

- Removed browser-delivered privileged Supabase credentials.
- Moved migration database access to `SUPABASE_DB_URL` from the local environment.
- Hardened profile authorization so users cannot self-promote roles.
- Added permission regression tests and security smoke tests.
- Kept production data out of source control; demo mode uses fake data only.

See [security_best_practices_report.md](security_best_practices_report.md) for the security audit summary and required production credential-rotation note.

## Database

Schema changes are versioned in [`migrations/`](migrations/). The migration set covers base tables, seed/demo structure, profiles, security hardening, role-based RLS, project budgets, date tracking, expanded roles, the permissions system, tasks, inventory, and activity logs.

Migration tooling reads credentials from local environment variables only:

```bash
SUPABASE_DB_URL=postgresql://USER:PASSWORD@HOST:5432/postgres npm run test
node scripts/migrate.mjs
```

## Local Development

```bash
npm install
npm run dev
npm test
npm run build
```

Use `.env.example` as the template for `.env.local`. Do not commit `.env`, `.env.local`, `.dev.vars`, database URLs, service-role keys, or production exports.

## Deployment

The app is configured for Cloudflare deployment with Wrangler:

```bash
npm run deploy
```

For a staging deployment, set `VITE_ENABLE_DEMO=true` and point the app at a non-production Supabase project or demo-only configuration. Production should keep demo mode disabled and rely on Supabase Auth plus RLS policies.
