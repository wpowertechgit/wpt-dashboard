export const DEFAULT_SUBASSEMBLY_NAMES = [
  'Subassembly 01',
  'Subassembly 02',
  'Subassembly 03',
  'Subassembly 04',
  'Subassembly 05',
  'Subassembly 06',
  'Subassembly 07',
  'Subassembly 08',
  'Subassembly 09',
  'Subassembly 10',
  'Subassembly 11',
  'Subassembly 12',
  'Subassembly 13',
  'Subassembly 14',
  'Subassembly 15',
  'Subassembly 16',
  'Subassembly 17',
  'Subassembly 18',
  'Subassembly 19',
] as const

const OPTIONAL_DATE_FIELDS = new Set([
  'data_start',
  'data_due',
  'data_done',
  'proiectare_done',
  'laser_done',
  'rolat_done',
  'sudat_done',
  'asamblat_done',
  'vopsit_done',
])

export function stripEmptyDateFields<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([key, value]) => !(OPTIONAL_DATE_FIELDS.has(key) && value === '')),
  ) as T
}

export function buildDefaultSubassemblies(projectId: string) {
  return DEFAULT_SUBASSEMBLY_NAMES.map((nume, index) =>
    stripEmptyDateFields({
      proiect: projectId,
      nr: index + 1,
      nume,
      status_global: 'Neinceput',
      progres: '0%',
      blocat: false,
      intarziat: false,
      proiectare: 'Neinceput',
      laser: 'Neinceput',
      rolat: 'Neinceput',
      sudat: 'Neinceput',
      asamblat: 'Neinceput',
      vopsit: 'Neinceput',
      data_start: '',
      data_due: '',
      data_done: '',
      proiectare_done: '',
      laser_done: '',
      rolat_done: '',
      sudat_done: '',
      asamblat_done: '',
      vopsit_done: '',
      comentarii: '',
      conditionat_de: null,
    }),
  )
}

export function withDefaultProjectTotals<T extends Record<string, unknown>>(project: T) {
  return stripEmptyDateFields({
    ...project,
    total_sa: DEFAULT_SUBASSEMBLY_NAMES.length,
  })
}
