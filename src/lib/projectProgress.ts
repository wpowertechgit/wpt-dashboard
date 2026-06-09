interface SaRow { proiect: string; status_global: string }

export function calcProjectProgress(saData: SaRow[] | null | undefined, projectId: string): number {
  const rows = saData?.filter(s => s.proiect === projectId) ?? []
  if (!rows.length) return 0
  const finalized = rows.filter(s => s.status_global.includes('FINALIZAT')).length
  return Math.round((finalized / rows.length) * 100)
}

export function calcProjectCounts(saData: SaRow[] | null | undefined, projectId: string) {
  const rows = saData?.filter(s => s.proiect === projectId) ?? []
  const finalized = rows.filter(s => s.status_global.includes('FINALIZAT')).length
  return { total: rows.length, finalized }
}
