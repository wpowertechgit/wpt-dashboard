const LEGACY_MONTHS: Record<string, number> = {
  ian: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mai: 4,
  jun: 5,
  iun: 5,
  jul: 6,
  iul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function parseAppDate(value?: string | null) {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const legacyMatch = value.match(/^(\d{1,2})-([A-Za-zăîâșşțţ]+)-(\d{2,4})$/i)
  if (!legacyMatch) return null

  const [, dayRaw, monthRaw, yearRaw] = legacyMatch
  const month = LEGACY_MONTHS[monthRaw.toLowerCase()]
  if (month === undefined) return null

  const day = Number(dayRaw)
  const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw)
  const parsed = new Date(Date.UTC(year, month, day))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toIsoDate(value?: string | null) {
  const parsed = parseAppDate(value)
  return parsed ? parsed.toISOString().slice(0, 10) : ''
}

export function formatDateLabel(value?: string | null) {
  const parsed = parseAppDate(value)
  if (!parsed) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

export function compareDateStrings(a?: string | null, b?: string | null) {
  const first = parseAppDate(a)
  const second = parseAppDate(b)
  if (!first && !second) return 0
  if (!first) return 1
  if (!second) return -1
  return normalizeDate(first).getTime() - normalizeDate(second).getTime()
}

export function isOverdue(
  values: { due?: string | null; done?: string | null },
  today = new Date().toISOString().slice(0, 10),
) {
  const due = parseAppDate(values.due)
  if (!due || values.done) return false

  const current = parseAppDate(today)
  if (!current) return false
  return normalizeDate(due).getTime() < normalizeDate(current).getTime()
}

export function daysBetween(start?: string | null, end?: string | null) {
  const from = parseAppDate(start)
  const to = parseAppDate(end)
  if (!from || !to) return null

  const diff = normalizeDate(to).getTime() - normalizeDate(from).getTime()
  return Math.round(diff / 86400000)
}
