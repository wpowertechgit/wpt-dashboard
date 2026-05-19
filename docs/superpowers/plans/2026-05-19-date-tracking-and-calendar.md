# Date Tracking and Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add project and subassembly date tracking plus a planning calendar that highlights due, done, and overdue work.

**Architecture:** Keep the existing React + Supabase structure, add new SQL columns through a migration, centralize date parsing/formatting and planning-item derivation in small helper modules, then expose the new fields through the existing project/subassembly screens and a new planning route.

**Tech Stack:** React 19, TypeScript, MUI, Supabase, Node test runner, SQL migrations

---

## File Structure

- Create: `migrations/005_date_tracking.sql`
- Create: `src/lib/dateUtils.ts`
- Create: `src/lib/planning.ts`
- Create: `src/components/PlanningCalendar.tsx`
- Create: `scripts/date-tracking.test.mjs`
- Modify: `src/lib/projectDefaults.ts`
- Modify: `src/lib/api.ts`
- Modify: `src/components/Projects.tsx`
- Modify: `src/components/Subassemblies.tsx`
- Modify: `src/components/DailyFlow.tsx`
- Modify: `src/components/Blockages.tsx`
- Modify: `src/components/PDCA.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/i18n.tsx`
- Modify: `src/data/demo.ts`

## Tasks

### Task 1: Add failing tests for date parsing and planning derivation

- [ ] Write tests for legacy/ISO date parsing, overdue detection, and planning item creation.
- [ ] Run `node --test scripts/date-tracking.test.mjs` and verify the new tests fail for the expected missing-module reason.

### Task 2: Implement shared date and planning helpers

- [ ] Add `src/lib/dateUtils.ts` with parsing, formatting, and comparison helpers.
- [ ] Add `src/lib/planning.ts` with functions that derive calendar events and overdue/upcoming lists from projects and subassemblies.
- [ ] Re-run `node --test scripts/date-tracking.test.mjs` and verify the tests pass.

### Task 3: Add storage for new date fields

- [ ] Create `migrations/005_date_tracking.sql` to add project and subassembly date columns.
- [ ] Extend default project/subassembly creation payloads in `src/lib/projectDefaults.ts` so newly created rows start with blank date fields.

### Task 4: Wire date fields through the forms and editors

- [ ] Update `src/components/Projects.tsx` to use native date inputs for project start/due/done.
- [ ] Update `src/components/Subassemblies.tsx` to expose subassembly and department completion dates during editing and display formatted dates in the table.
- [ ] Update `src/components/DailyFlow.tsx`, `src/components/Blockages.tsx`, and `src/components/PDCA.tsx` to use native date inputs for their existing date fields.

### Task 5: Add the planning calendar view

- [ ] Add `src/components/PlanningCalendar.tsx` using the new planning helpers.
- [ ] Register the new route in `src/App.tsx`.
- [ ] Add translation strings in `src/lib/i18n.tsx`.

### Task 6: Refresh demo data and verify

- [ ] Add representative new date fields to `src/data/demo.ts`.
- [ ] Run `node --test scripts/date-tracking.test.mjs`.
- [ ] Run `npx.cmd tsc --noEmit`.
