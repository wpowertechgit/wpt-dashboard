export const DEFAULT_SUBASSEMBLY_NAMES = [
  'Structura metalica',
  'Scara metalica',
  'Compactor iesire',
  'Compactor intrare',
  'Reactor superior',
  'Reactor inferior',
  'Suport reactor inferior',
  'Filtru Gudroane',
  'Ventori scrubber',
  'Rezervor metalic (racitor)',
  'Barbutoare',
  'Filtre',
  'Sistem de tevi',
  'Snec reactor superior',
  'Snec reactor inferior',
  'Snec compactor intrare',
  'Snec compactor iesire',
  'Presetupe',
  'Turn de racire',
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
