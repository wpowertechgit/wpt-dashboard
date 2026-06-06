import test from 'node:test'
import assert from 'node:assert/strict'

const { DEFAULT_SUBASSEMBLY_NAMES, buildDefaultSubassemblies, stripEmptyDateFields, withDefaultProjectTotals } = await import('../src/lib/projectDefaults.ts')

test('default subassembly template contains the expected 19 names in order', () => {
  assert.equal(DEFAULT_SUBASSEMBLY_NAMES.length, 19)
  assert.deepEqual(DEFAULT_SUBASSEMBLY_NAMES, [
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
  ])
})

test('buildDefaultSubassemblies creates unstarted rows for a new project', () => {
  const rows = buildDefaultSubassemblies('WP1000-11')

  assert.equal(rows.length, 19)
  assert.deepEqual(rows[0], {
    proiect: 'WP1000-11',
    nr: 1,
    nume: 'Subassembly 01',
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
    comentarii: '',
    conditionat_de: null,
  })
  assert.deepEqual(rows.at(-1), {
    proiect: 'WP1000-11',
    nr: 19,
    nume: 'Subassembly 19',
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
    comentarii: '',
    conditionat_de: null,
  })
})

test('withDefaultProjectTotals aligns total_sa with the default template size', () => {
  assert.deepEqual(
    withDefaultProjectTotals({
      id: 'WP1000-11',
      client: 'Client Nou',
      total_sa: 0,
      finalizate_sa: 0,
      progres: 0,
    }),
    {
      id: 'WP1000-11',
      client: 'Client Nou',
      total_sa: 19,
      finalizate_sa: 0,
      progres: 0,
    },
  )
})

test('stripEmptyDateFields removes blank optional date fields but keeps real values', () => {
  assert.deepEqual(
    stripEmptyDateFields({
      id: 'WP1000-11',
      data_start: '2026-05-19',
      data_target: '2026-06-19',
      data_done: '',
      data_due: '',
      laser_done: '',
      comentarii: '',
    }),
    {
      id: 'WP1000-11',
      data_start: '2026-05-19',
      data_target: '2026-06-19',
      comentarii: '',
    },
  )
})
