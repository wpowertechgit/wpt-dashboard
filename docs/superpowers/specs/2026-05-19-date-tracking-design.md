# Date Tracking and Planning Design

## Goal

Add usable scheduling data across the production flow so teams can track when projects and subassemblies start, when they are due, when they are done, and how quickly each department finishes its part.

## Scope

- Add project-level dates for start, due, and done.
- Add subassembly-level dates for start, due, and done.
- Add department completion dates on each subassembly for `LASER`, `ROLAT`, `SUDAT`, `ASAMBLAT`, and `VOPSIT`.
- Add a calendar/planning page that surfaces upcoming due dates, completed work, and overdue items.
- Convert date-entry surfaces to native date inputs where the user is expected to enter or update dates.

## Data Model

### `proiecte`

- Keep existing `data_start`.
- Keep existing `data_target` as the project due date field already used in the UI.
- Add `data_done` for actual completion.

### `subansambluri`

- Add `data_start`, `data_due`, `data_done`.
- Add `laser_done`, `rolat_done`, `sudat_done`, `asamblat_done`, `vopsit_done`.

## Date Format Strategy

- New and edited values use ISO `YYYY-MM-DD` strings so native date inputs work cleanly.
- Existing seeded/demo values remain readable through a small parsing/formatting helper that supports both ISO dates and the legacy `DD-Mon-YY` style already present in the repo.

## UI

### Projects

- Project creation form accepts start, due, and done dates via calendar inputs.
- Project cards/table show the due and done dates in human-readable form.

### Subassemblies

- The editable row exposes start, due, done, and department completion dates.
- The table shows due/done context clearly enough to spot late work.

### Calendar / Planning

- Add a dedicated planning page in navigation.
- Show a month grid with project/subassembly due and done events.
- Show side lists for overdue items, upcoming due items, and recently completed work.

## Reporting Intent

- Lead time can be measured from `data_start` to `data_done` on the subassembly.
- Department throughput can be measured from the department completion dates.
- Overdue logic is based on due date present and done date absent or later than due.

## Non-Goals

- No drag-and-drop scheduling in this pass.
- No separate department planned dates yet; only actual completion dates are added per department.
