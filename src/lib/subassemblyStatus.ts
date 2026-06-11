export function normalizeDepartmentStatus(value?: string | null) {
  if (!value) return 'Neînceput'
  if (value === 'Neinceput') return 'Neînceput'
  if (value === 'In lucru') return 'În lucru'
  return value
}

export function normalizeGlobalStatus(value?: string | null): string {
  if (!value || value === 'Neinceput' || value === 'Neînceput' || value === '⏳ NEÎNCEPUT') return 'notStarted'
  if (value === '🔄 IN LUCRU') return 'inProgress'
  if (value === '✅ FINALIZAT') return 'completed'
  if (value === '⛔ BLOCAT') return 'blocked'
  if (value === '🔍 DE VERIFICAT') return 'toVerify'
  return value
}
