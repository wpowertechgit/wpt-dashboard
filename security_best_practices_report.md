# Security Best Practices Report

## Executive Summary

The project had two critical production blockers: privileged Supabase credentials were usable from browser-delivered code, and database migration credentials were hard-coded in the repository. I removed those client-side and source-code exposure paths, added a regression smoke test, and added a database hardening migration for profile authorization.

Before production, rotate the exposed Supabase database password and privileged API keys in Supabase. Removing them from this workspace does not invalidate credentials that were already exposed.

## Critical Findings

### SEC-001: Supabase privileged key path in browser code

- Status: Fixed in source.
- Location: `src/lib/supabase.ts`, `src/App.tsx`, `src/components/Admin.tsx`
- Evidence: The React bundle created a second Supabase client from a browser-exposed `VITE_*` admin key and used it for profile and Auth Admin operations.
- Impact: Anyone able to inspect the frontend bundle could extract privileged credentials and bypass Row Level Security.
- Fix: Removed the privileged browser client and removed browser-side Auth Admin user creation. The Admin screen now uses normal RLS-protected profile APIs only.
- Required follow-up: Implement new-user creation in a trusted backend or Supabase Edge Function if the app needs in-app account creation.

### SEC-002: Hard-coded database URL in migration tooling

- Status: Fixed.
- Location: `scripts/migrate.mjs`
- Evidence: Migration script contained a literal PostgreSQL connection URL.
- Impact: Anyone with repository or artifact access could connect to the database until credentials are rotated.
- Fix: `scripts/migrate.mjs` now requires `SUPABASE_DB_URL` from the environment and `.env.example` documents placeholders only.

### SEC-003: Profile self-update privilege escalation

- Status: Fixed via migration.
- Location: `migrations/003_profiles.sql`, hardened by `migrations/004_security_hardening.sql`
- Evidence: Existing policy allowed users to update their own `profiles` row while the row includes `role`.
- Impact: A worker could potentially update their own profile to `admin`.
- Fix: Added `migrations/004_security_hardening.sql`, which drops the self-update policy and allows profile writes only when `public.is_admin()` is true.

## Medium Findings

### SEC-004: Security headers are not visible in repo

- Status: Not fixed in code because hosting/edge target is not present.
- Location: `index.html` and deployment config (none found)
- Impact: Missing CSP, clickjacking protection, `nosniff`, referrer, and permissions headers reduces defense in depth.
- Fix: Configure these at the production host/CDN. Prefer HTTP response headers over meta tags.

## Verification

- `npm.cmd test`: passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run build`: passed, with a Vite chunk-size warning only.
- `npm.cmd audit --audit-level=moderate`: 0 vulnerabilities.
- Secret fingerprint scan for the exposed Supabase project/key/password patterns: no matches outside the regression test itself.
