const GLOBAL_IN_PROGRESS = '🔄 IN LUCRU'

export function normalizeDepartmentStatus(value?: string | null) {
  if (!value) return 'Neînceput'
  if (value === 'Neinceput') return 'Neînceput'
  if (value === 'In lucru') return 'În lucru'
  return value
}

export function normalizeGlobalStatus(value?: string | null) {
  if (!value || value === 'Neinceput' || value === 'Neînceput') return GLOBAL_IN_PROGRESS
  return value
}
